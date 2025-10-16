import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { OrganizationStatus } from '../lib/constants';
import type { OrganizationType } from '../lib/constants';
import {
  getOrganizationServicesHelper,
  getOrganizationUsers,
} from '../helpers/relationships';
import { organizationStatusValidator } from '../lib/validators';

// Mutations
export const createOrganization = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    logo: v.optional(v.string()),
    type: v.string(),
    status: v.optional(organizationStatusValidator),
    parentId: v.optional(v.id('organizations')),
    countryIds: v.optional(v.array(v.string())),
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
      countryIds: args.countryIds || [],
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
    countryIds: v.optional(v.array(v.string())),
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
      ...(args.countryIds && { countryIds: args.countryIds }),
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

/* 
export const createOrganizationCountryConfig = mutation({
  args: {
    organizationId: v.id("organizations"),
    countryCode: v.string(),
    contact: v.any(),
    schedule: v.any(),
    holidays: v.optional(v.array(v.string())),
    closures: v.optional(v.array(v.string())),
    consularCard: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const configId = await ctx.db.insert("organizationCountryConfigs", {
      organizationId: args.organizationId,
      countryCode: args.countryCode,
      contact: args.contact,
      schedule: args.schedule,
      holidays: args.holidays || [],
      closures: args.closures || [],
      consularCard: args.consularCard || {},
      updatedAt: Date.now(),
    });

    return configId;
  },
});
*/

/* 
export const updateOrganizationCountryConfig = mutation({
  args: {
    configId: v.id("organizationCountryConfigs"),
    contact: v.optional(v.any()),
    schedule: v.optional(v.any()),
    holidays: v.optional(v.array(v.string())),
    closures: v.optional(v.array(v.string())),
    consularCard: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const updateData = {
      ...(args.contact && { contact: args.contact }),
      ...(args.schedule && { schedule: args.schedule }),
      ...(args.holidays && { holidays: args.holidays }),
      ...(args.closures && { closures: args.closures }),
      ...(args.consularCard && { consularCard: args.consularCard }),
      updatedAt: Date.now(),
    };

    await ctx.db.patch(args.configId, updateData);
    return args.configId;
  },
});

export const deleteOrganizationCountryConfig = mutation({
  args: { configId: v.id("organizationCountryConfigs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.configId);
    return args.configId;
  },
});
*/

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
  args: { countryCode: v.string() },
  handler: async (ctx, args) => {
    const organizations = await ctx.db.query('organizations').collect();

    return organizations.filter(
      (org) => org.countryIds && org.countryIds.includes(args.countryCode),
    );
  },
});

export const getOrganizationServices = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await getOrganizationServicesHelper(ctx, args.organizationId);
  },
});

/* 
export const getOrganizationCountryConfig = query({
  args: {
    organizationId: v.id("organizations"),
    countryCode: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizationCountryConfigs")
      .withIndex("by_organization_country", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("countryCode", args.countryCode),
      )
      .first();
  },
});
*/
