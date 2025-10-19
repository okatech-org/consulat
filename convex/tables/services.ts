import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  deliveryModeValidator,
  processingModeValidator,
  serviceCategoryValidator,
  serviceStatusValidator,
  serviceStepValidator,
} from '../lib/validators';

/**
 * Services table
 * Stores all consular services with their configuration, steps, and pricing
 */
export const services = defineTable({
  // Basic information
  code: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  category: serviceCategoryValidator,
  status: serviceStatusValidator,
  countries: v.array(v.string()),
  organizationId: v.id('organizations'),

  // Service steps (with fully typed fields including profilePath)
  steps: v.array(serviceStepValidator),

  // Processing and delivery modes
  processing: v.object({
    mode: processingModeValidator,
    appointment: v.object({
      requires: v.boolean(),
      duration: v.optional(v.number()),
      instructions: v.optional(v.string()),
    }),
    proxy: v.optional(
      v.object({
        allows: v.boolean(),
        requirements: v.optional(v.string()),
      }),
    ),
  }),

  delivery: v.object({
    modes: v.array(deliveryModeValidator),
    appointment: v.optional(
      v.object({
        requires: v.boolean(),
        duration: v.optional(v.number()),
        instructions: v.optional(v.string()),
      }),
    ),
    proxy: v.optional(
      v.object({
        allows: v.boolean(),
        requirements: v.optional(v.string()),
      }),
    ),
  }),

  pricing: v.object({
    isFree: v.boolean(),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
  }),

  automations: v.optional(v.id('workflows')),

  // Legacy ID for migration purposes
  legacyId: v.optional(v.string()),
})
  .index('by_code', ['code'])
  .index('by_organization', ['organizationId'])
  .index('by_category', ['category'])
  .index('by_status', ['status'])
  .index('by_organization_status', ['organizationId', 'status'])
  .index('by_countries', ['countries']);
