import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { CountryStatus } from '../lib/constants';
import type { Doc } from '../_generated/dataModel';
import { countryCodeValidator, countryStatusValidator } from '../lib/validators';

export const createCountry = mutation({
  args: {
    name: v.string(),
    code: countryCodeValidator,
    flag: v.optional(v.string()),
    status: v.optional(countryStatusValidator),
  },
  returns: v.id('countries'),
  handler: async (ctx, args) => {
    const existingCountry = await ctx.db
      .query('countries')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();

    if (existingCountry) {
      throw new Error('Country with this code already exists');
    }

    const countryId = await ctx.db.insert('countries', {
      name: args.name,
      code: args.code,
      flag: args.flag,
      status: args.status ?? CountryStatus.Inactive,
    });

    return countryId;
  },
});

export const getAllCountries = query({
  args: {
    status: v.optional(countryStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let countries: Array<Doc<'countries'>>;

    if (args.status) {
      countries = await ctx.db
        .query('countries')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('asc')
        .collect();
    } else {
      countries = await ctx.db.query('countries').order('asc').collect();
    }

    if (args.limit) {
      return countries.slice(0, args.limit);
    }

    return countries;
  },
});

export const getCountry = query({
  args: { countryId: v.id('countries') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.countryId);
  },
});

export const getCountryByCode = query({
  args: { code: countryCodeValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('countries')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();
  },
});

export const updateCountry = mutation({
  args: {
    countryId: v.id('countries'),
    name: v.optional(v.string()),
    code: v.optional(countryCodeValidator),
    flag: v.optional(v.string()),
    status: v.optional(countryStatusValidator),
  },
  returns: v.id('countries'),
  handler: async (ctx, args) => {
    const existingCountry = await ctx.db.get(args.countryId);
    if (!existingCountry) {
      throw new Error('Country not found');
    }

    if (args.code && args.code !== existingCountry.code) {
      const existingCountryWithCode = await ctx.db
        .query('countries')
        .withIndex('by_code', (q) => q.eq('code', args.code!))
        .first();

      if (existingCountryWithCode) {
        throw new Error('Country with this code already exists');
      }
    }

    const updateData = {
      ...(args.name && { name: args.name }),
      ...(args.code && { code: args.code }),
      ...(args.flag !== undefined && { flag: args.flag }),
      ...(args.status && { status: args.status }),
      updatedAt: Date.now(),
    };

    await ctx.db.patch(args.countryId, updateData);
    return args.countryId;
  },
});

export const deleteCountry = mutation({
  args: { countryId: v.id('countries') },
  returns: v.id('countries'),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.countryId);
    return args.countryId;
  },
});

export const searchCountries = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const countries = await ctx.db.query('countries').collect();

    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(args.searchTerm.toLowerCase()),
    );
  },
});

// Query enrichie avec compteurs pour l'interface admin
export const getCountryListingItems = query({
  args: {
    status: v.optional(countryStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let countries: Array<Doc<'countries'>>;

    if (args.status) {
      countries = await ctx.db
        .query('countries')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('asc')
        .collect();
    } else {
      countries = await ctx.db.query('countries').order('asc').collect();
    }

    if (args.limit) {
      countries = countries.slice(0, args.limit);
    }

    // Enrichir avec les compteurs
    const enrichedCountries = await Promise.all(
      countries.map(async (country) => {
        // Compter les organisations liées à ce pays
        const organizationsCount = await ctx.db
          .query('organizations')
          .withIndex('by_country_code', (q) => q.eq('countryCodes', [country.code]))
          .collect()
          .then((organizations) => organizations.length);

        const profilesCount = await ctx.db
          .query('profiles')
          .withIndex('by_country_code', (q) => q.eq('residenceCountry', country.code))
          .collect()
          .then((profiles) => profiles.length);

        const childProfilesCount = await ctx.db
          .query('childProfiles')
          .withIndex('by_country_code', (q) => q.eq('residenceCountry', country.code))
          .collect()
          .then((childProfiles) => childProfiles.length);

        return {
          ...country,
          organizationsCount,
          usersCount: profilesCount + childProfilesCount,
        };
      }),
    );

    return enrichedCountries;
  },
});
