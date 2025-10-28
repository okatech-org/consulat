import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { OrganizationStatus } from '../lib/constants';
import type { OrganizationType } from '../lib/constants';
import {
  getOrganizationServicesHelper,
  getOrganizationUsers,
} from '../helpers/relationships';
import {
  countryCodeValidator,
  organizationStatusValidator,
  organizationTypeValidator,
} from '../lib/validators';

// Mutations
export const createOrganization = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    logo: v.optional(v.string()),
    type: organizationTypeValidator,
    status: v.optional(organizationStatusValidator),
    parentId: v.optional(v.id('organizations')),
    countryCodes: v.optional(v.array(countryCodeValidator)),
  },
  handler: async (ctx, args) => {
    const organizationId = await ctx.db.insert('organizations', {
      code: args.code,
      name: args.name,
      logo: args.logo,
      type: args.type as OrganizationType,
      status: args.status ?? OrganizationStatus.Active,
      parentId: args.parentId,
      childIds: [],
      countryCodes: args.countryCodes || [],
      memberIds: [],
      serviceIds: [],
      settings: [],
      metadata: {},
    });

    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (parent) {
        await ctx.db.patch(args.parentId, {
          childIds: [...parent.childIds, organizationId],
        });
      }
    }

    return organizationId;
  },
});

export const updateOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
    code: v.optional(v.string()),
    name: v.optional(v.string()),
    logo: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    countryCodes: v.optional(v.array(v.string())),
    settings: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existingOrg = await ctx.db.get(args.organizationId);
    if (!existingOrg) {
      throw new Error('Organization not found');
    }

    const updateData = {
      ...(args.code && { code: args.code }),
      ...(args.name && { name: args.name }),
      ...(args.logo !== undefined && { logo: args.logo }),
      ...(args.type && { type: args.type as OrganizationType }),
      ...(args.status && { status: args.status as OrganizationStatus }),
      ...(args.countryCodes && { countryCodes: args.countryCodes }),
      ...(args.settings && { settings: args.settings }),
      ...(args.metadata && { metadata: args.metadata }),
      updatedAt: Date.now(),
    };

    await ctx.db.patch(args.organizationId, updateData);
    return args.organizationId;
  },
});

export const addServiceToOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    if (organization.serviceIds.includes(args.serviceId)) {
      throw new Error('Service already exists in organization');
    }

    await ctx.db.patch(args.organizationId, {
      serviceIds: [...organization.serviceIds, args.serviceId],
    });

    return args.organizationId;
  },
});

export const removeServiceFromOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    await ctx.db.patch(args.organizationId, {
      serviceIds: organization.serviceIds.filter((id) => id !== args.serviceId),
    });

    return args.organizationId;
  },
});

export const updateOrganizationSettings = mutation({
  args: {
    organizationId: v.id('organizations'),
    settings: v.any(),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    await ctx.db.patch(args.organizationId, {
      settings: { ...organization.settings, ...args.settings },
    });

    return args.organizationId;
  },
});

export const updateOrganizationStatus = mutation({
  args: {
    organizationId: v.id('organizations'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    await ctx.db.patch(args.organizationId, {
      status: args.status as OrganizationStatus,
    });

    return organization;
  },
});

export const deleteOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Delete associated services
    const services = await ctx.db
      .query('services')
      .filter((q) => q.eq(q.field('organizationId'), args.organizationId))
      .collect();

    for (const service of services) {
      await ctx.db.delete(service._id);
    }

    // Delete associated memberships
    const memberships = await ctx.db
      .query('memberships')
      .filter((q) => q.eq(q.field('organizationId'), args.organizationId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // Delete the organization
    await ctx.db.delete(args.organizationId);

    return { success: true };
  },
});

// Queries
export const getOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

export const getOrganizationByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('organizations')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();
  },
});

export const getAllOrganizations = query({
  args: {
    status: v.optional(organizationStatusValidator),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const organizations = await ctx.db
        .query('organizations')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect();

      return args.limit ? organizations.slice(0, args.limit) : organizations;
    }

    const organizations = await ctx.db.query('organizations').order('desc').collect();

    return args.limit ? organizations.slice(0, args.limit) : organizations;
  },
});

export const getOrganizationWithDetails = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) return null;

    const [services, members] = await Promise.all([
      getOrganizationServicesHelper(ctx, args.organizationId),
      getOrganizationUsers(ctx, args.organizationId),
    ]);

    return {
      ...organization,
      services,
      members,
    };
  },
});

export const getOrganizationsByCountry = query({
  args: { countryCode: countryCodeValidator },
  handler: async (ctx, args) => {
    const organizations = await ctx.db.query('organizations').collect();

    return organizations.filter(
      (org) => org.countryCodes && org.countryCodes.includes(args.countryCode),
    );
  },
});

export const getOrganizationServices = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await getOrganizationServicesHelper(ctx, args.organizationId);
  },
});

// Enriched list query for organizations with counts and details
export const getOrganizationsListEnriched = query({
  args: {
    search: v.optional(v.string()),
    type: v.optional(v.array(v.string())),
    status: v.optional(v.array(v.string())),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page || 1;
    const limit = args.limit || 10;
    const skip = (page - 1) * limit;

    let organizations = await ctx.db.query('organizations').collect();

    // Filter by status
    if (args.status && args.status.length > 0) {
      organizations = organizations.filter((org) => args.status!.includes(org.status));
    }

    // Filter by type
    if (args.type && args.type.length > 0) {
      organizations = organizations.filter((org) => args.type!.includes(org.type));
    }

    // Filter by search term
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      organizations = organizations.filter((org) =>
        org.name.toLowerCase().includes(searchLower),
      );
    }

    const total = organizations.length;

    // Apply pagination
    const paginatedOrganizations = organizations.slice(skip, skip + limit);

    // Enrich with counts
    const enrichedOrganizations = await Promise.all(
      paginatedOrganizations.map(async (org) => {
        const [services, members, countries] = await Promise.all([
          getOrganizationServicesHelper(ctx, org._id),
          getOrganizationUsers(ctx, org._id),
          Promise.all(
            (org.countryCodes || []).map(async (countryCode) => {
              const country = await ctx.db
                .query('countries')
                .withIndex('by_code', (q) => q.eq('code', countryCode))
                .first();
              return country;
            }),
          ),
        ]);

        return {
          ...org,
          countries: countries.filter(Boolean),
          servicesCount: services.length,
          membersCount: members.length,
        };
      }),
    );

    return {
      organizations: enrichedOrganizations,
      total,
      page,
      limit,
    };
  },
});
