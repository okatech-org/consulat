import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { OrganizationStatus } from '../../lib/constants'
import type { OrganizationType } from '../../lib/constants'

export const createOrganization = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    logo: v.optional(v.string()),
    type: v.string(),
    status: v.optional(v.string()),
    parentId: v.optional(v.id('organizations')),
    countryIds: v.optional(v.array(v.string())),
    settings: v.optional(v.any()),
    metadata: v.optional(v.any()),
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
      settings: args.settings || {
        appointmentSettings: {},
        workflowSettings: {},
        notificationSettings: {},
      },
      metadata: args.metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Mettre à jour l'organisation parent si nécessaire
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId)
      if (parent) {
        await ctx.db.patch(args.parentId, {
          childIds: [...parent.childIds, organizationId],
          updatedAt: Date.now(),
        })
      }
    }

    return organizationId
  },
})
