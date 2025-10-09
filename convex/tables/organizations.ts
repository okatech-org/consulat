import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { OrganizationType, OrganizationStatus } from '../lib/constants'

export const organizations = defineTable({
  code: v.string(), // Code unique
  name: v.string(),
  logo: v.optional(v.string()), // URL du logo
  type: v.union(
    v.literal(OrganizationType.Embassy),
    v.literal(OrganizationType.Consulate),
    v.literal(OrganizationType.GeneralConsulate),
    v.literal(OrganizationType.HonoraryConsulate),
    v.literal(OrganizationType.ThirdParty),
  ),
  status: v.union(
    v.literal(OrganizationStatus.Active),
    v.literal(OrganizationStatus.Inactive),
    v.literal(OrganizationStatus.Suspended),
  ),

  // Hiérarchie
  parentId: v.optional(v.id('organizations')),
  childIds: v.array(v.id('organizations')),

  // Relations
  countryIds: v.array(v.string()),
  memberIds: v.array(v.id('users')),
  serviceIds: v.array(v.id('services')),

  // Configuration
  settings: v.object({
    appointmentSettings: v.optional(v.any()),
    workflowSettings: v.optional(v.any()),
    notificationSettings: v.optional(v.any()),
  }),

  metadata: v.optional(v.any()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_code', ['code'])
  .index('by_status', ['status'])
  .index('by_parent', ['parentId'])
  .index('by_country', ['countryIds'])
