import { v } from 'convex/values'
import { query } from '../../_generated/server'
import {
  getOrganizationServicesHelper,
  getOrganizationUsers,
} from '../../helpers/relationships'

export const getOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId)
  },
})

export const getOrganizationByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('organizations')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first()
  },
})

export const getAllOrganizations = query({
  args: {
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const organizations = await ctx.db
        .query('organizations')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect()

      return args.limit ? organizations.slice(0, args.limit) : organizations
    }

    const organizations = await ctx.db
      .query('organizations')
      .order('desc')
      .collect()

    return args.limit ? organizations.slice(0, args.limit) : organizations
  },
})

export const getOrganizationWithDetails = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId)
    if (!organization) return null

    const [services, members, countryConfigs] = await Promise.all([
      getOrganizationServicesHelper(ctx, args.organizationId),
      getOrganizationUsers(ctx, args.organizationId),
      ctx.db
        .query('organizationCountryConfigs')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId),
        )
        .collect(),
    ])

    return {
      ...organization,
      services,
      members,
      countryConfigs,
    }
  },
})

export const getOrganizationsByCountry = query({
  args: { countryCode: v.string() },
  handler: async (ctx, args) => {
    const organizations = await ctx.db.query('organizations').collect()

    return organizations.filter(
      (org) => org.countryIds && org.countryIds.includes(args.countryCode),
    )
  },
})
