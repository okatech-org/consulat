import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import type { OrganizationStatus, OrganizationType } from '../../lib/constants'

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
    const existingOrg = await ctx.db.get(args.organizationId)
    if (!existingOrg) {
      throw new Error('Organization not found')
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
    }

    await ctx.db.patch(args.organizationId, updateData)
    return args.organizationId
  },
})

export const addServiceToOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

    if (organization.serviceIds.includes(args.serviceId)) {
      throw new Error('Service already exists in organization')
    }

    await ctx.db.patch(args.organizationId, {
      serviceIds: [...organization.serviceIds, args.serviceId],
      updatedAt: Date.now(),
    })

    return args.organizationId
  },
})

export const removeServiceFromOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
    serviceId: v.id('services'),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

    await ctx.db.patch(args.organizationId, {
      serviceIds: organization.serviceIds.filter((id) => id !== args.serviceId),
      updatedAt: Date.now(),
    })

    return args.organizationId
  },
})

export const updateOrganizationSettings = mutation({
  args: {
    organizationId: v.id('organizations'),
    settings: v.any(),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId)
    if (!organization) {
      throw new Error('Organization not found')
    }

    await ctx.db.patch(args.organizationId, {
      settings: { ...organization.settings, ...args.settings },
      updatedAt: Date.now(),
    })

    return args.organizationId
  },
})
