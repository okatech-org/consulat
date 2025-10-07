import { v } from 'convex/values'
import { mutation, query } from '../../_generated/server'
import { CountryStatus } from '../../lib/constants'

export const createCountry = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    flag: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.id('countries'),
  handler: async (ctx, args) => {
    // Vérifier si le pays existe déjà
    const existingCountry = await ctx.db
      .query('countries')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first()

    if (existingCountry) {
      throw new Error('Country with this code already exists')
    }

    const countryId = await ctx.db.insert('countries', {
      name: args.name,
      code: args.code,
      flag: args.flag,
      status: args.status ?? CountryStatus.Inactive,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return countryId
  },
})

export const getAllCountries = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (args.status) {
      const countries = await ctx.db
        .query('countries')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('asc')
        .collect()

      if (args.limit) {
        return countries.slice(0, args.limit)
      }

      return countries
    }

    // Pas de filtre de statut
    const countries = await ctx.db.query('countries').order('asc').collect()

    if (args.limit) {
      return countries.slice(0, args.limit)
    }

    return countries
  },
})

export const getCountry = query({
  args: { countryId: v.id('countries') },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.countryId)
  },
})

export const getCountryByCode = query({
  args: { code: v.string() },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('countries')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first()
  },
})

export const updateCountry = mutation({
  args: {
    countryId: v.id('countries'),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    flag: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.id('countries'),
  handler: async (ctx, args) => {
    const existingCountry = await ctx.db.get(args.countryId)
    if (!existingCountry) {
      throw new Error('Country not found')
    }

    // Vérifier l'unicité du code si modifié
    if (args.code && args.code !== existingCountry.code) {
      const existingCountryWithCode = await ctx.db
        .query('countries')
        .withIndex('by_code', (q) => q.eq('code', args.code!))
        .first()

      if (existingCountryWithCode) {
        throw new Error('Country with this code already exists')
      }
    }

    const updateData = {
      ...(args.name && { name: args.name }),
      ...(args.code && { code: args.code }),
      ...(args.flag !== undefined && { flag: args.flag }),
      ...(args.status && { status: args.status as CountryStatus }),
      updatedAt: Date.now(),
    }

    await ctx.db.patch(args.countryId, updateData)
    return args.countryId
  },
})

export const deleteCountry = mutation({
  args: { countryId: v.id('countries') },
  returns: v.id('countries'),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.countryId)
    return args.countryId
  },
})

export const searchCountries = query({
  args: { searchTerm: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const countries = await ctx.db.query('countries').collect()

    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(args.searchTerm.toLowerCase()),
    )
  },
})
