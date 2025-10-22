import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  consularCardValidator,
  contactValidator,
  countryCodeValidator,
  organizationStatusValidator,
  organizationTypeValidator,
  weeklyScheduleValidator,
} from '../lib/validators';

export const organizations = defineTable({
  code: v.string(), // Code unique
  name: v.string(),
  logo: v.optional(v.string()), // URL du logo
  type: organizationTypeValidator,
  status: organizationStatusValidator,

  // Hiérarchie
  parentId: v.optional(v.id('organizations')),
  childIds: v.array(v.id('organizations')),

  // Relations
  countryCodes: v.array(countryCodeValidator),
  memberIds: v.array(v.id('users')),
  serviceIds: v.array(v.id('services')),

  // Configuration
  settings: v.array(
    v.object({
      appointmentSettings: v.optional(v.any()),
      workflowSettings: v.optional(v.any()),
      notificationSettings: v.optional(v.any()),
      countryCode: countryCodeValidator,

      contact: v.optional(contactValidator),

      schedule: v.optional(weeklyScheduleValidator),

      holidays: v.array(v.number()),
      closures: v.array(v.number()),

      consularCard: v.optional(consularCardValidator),
    }),
  ),

  metadata: v.optional(v.record(v.string(), v.any())),
  legacyId: v.optional(v.string()),
})
  .index('by_code', ['code'])
  .index('by_status', ['status'])
  .index('by_parent', ['parentId'])
  .index('by_country_code', ['countryCodes']);
