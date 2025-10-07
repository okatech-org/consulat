import { v } from 'convex/values'
import { query } from '../../_generated/server'

export const getService = query({
  args: { serviceId: v.id('services') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.serviceId)
  },
})

export const getServiceByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('services')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first()
  },
})

export const getAllServices = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    organizationId: v.optional(v.id('organizations')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let services: Array<any> = []

    if (args.organizationId && args.category && args.status) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .filter((q) =>
          q.and(
            q.eq(q.field('category'), args.category!),
            q.eq(q.field('status'), args.status!),
          ),
        )
        .order('desc')
        .collect()
    } else if (args.organizationId && args.category) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .filter((q) => q.eq(q.field('category'), args.category!))
        .order('desc')
        .collect()
    } else if (args.organizationId && args.status) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect()
    } else if (args.category && args.status) {
      services = await ctx.db
        .query('services')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect()
    } else if (args.organizationId) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .order('desc')
        .collect()
    } else if (args.category) {
      services = await ctx.db
        .query('services')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .order('desc')
        .collect()
    } else if (args.status) {
      services = await ctx.db
        .query('services')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect()
    } else {
      services = await ctx.db.query('services').order('desc').collect()
    }

    return args.limit ? services.slice(0, args.limit) : services
  },
})

export const getServicesByOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('services')
      .withIndex('by_organization', (q) =>
        q.eq('organizationId', args.organizationId),
      )
      .order('desc')
      .collect()
  },
})

export const getServicesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('services')
      .withIndex('by_category', (q) => q.eq('category', args.category))
      .order('desc')
      .collect()
  },
})

export const searchServices = query({
  args: {
    searchTerm: v.string(),
    organizationId: v.optional(v.id('organizations')),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let services: Array<any> = []

    if (args.organizationId && args.category) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .filter((q) => q.eq(q.field('category'), args.category!))
        .collect()
    } else if (args.organizationId) {
      services = await ctx.db
        .query('services')
        .withIndex('by_organization', (q) =>
          q.eq('organizationId', args.organizationId!),
        )
        .collect()
    } else if (args.category) {
      services = await ctx.db
        .query('services')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .collect()
    } else {
      services = await ctx.db.query('services').collect()
    }

    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        service.code.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        (service.description &&
          service.description
            .toLowerCase()
            .includes(args.searchTerm.toLowerCase())),
    )
  },
})
