import { v } from 'convex/values'
import { mutation, query } from '../../_generated/server'

export const createOrganizationCountryConfig = mutation({
  args: {
    organizationId: v.id('organizations'),
    countryCode: v.string(),
    contact: v.any(),
    schedule: v.any(),
    holidays: v.optional(v.array(v.string())),
    closures: v.optional(v.array(v.string())),
    consularCard: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const configId = await ctx.db.insert('organizationCountryConfigs', {
      organizationId: args.organizationId,
      countryCode: args.countryCode,
      contact: args.contact,
      schedule: args.schedule,
      holidays: args.holidays || [],
      closures: args.closures || [],
      consularCard: args.consularCard || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return configId
  },
})

export const getOrganizationCountryConfig = query({
  args: {
    organizationId: v.id('organizations'),
    countryCode: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('organizationCountryConfigs')
      .withIndex('by_organization_country', (q) =>
        q
          .eq('organizationId', args.organizationId)
          .eq('countryCode', args.countryCode),
      )
      .first()
  },
})

export const updateOrganizationCountryConfig = mutation({
  args: {
    configId: v.id('organizationCountryConfigs'),
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
    }

    await ctx.db.patch(args.configId, updateData)
    return args.configId
  },
})

export const deleteOrganizationCountryConfig = mutation({
  args: { configId: v.id('organizationCountryConfigs') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.configId)
    return args.configId
  },
})
