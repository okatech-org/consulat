import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  requestPriorityValidator,
  requestStatusValidator,
  noteValidator,
  deliveryModeValidator,
  processingModeValidator,
  addressValidator,
  deliveryStatusValidator,
  activityValidator,
  serviceCategoryValidator,
} from '../lib/validators';

export const requests = defineTable({
  number: v.string(), // Numéro unique
  serviceId: v.id('services'),
  organizationId: v.id('organizations'),
  assignedAgentId: v.optional(v.id('memberships')),
  countryCode: v.string(),

  // Demandeur
  requesterId: v.id('profiles'),
  profileId: v.optional(v.union(v.id('profiles'), v.id('childProfiles'))), // Pour qui

  // État avec validation enum
  status: requestStatusValidator,
  priority: requestPriorityValidator,

  // Données
  formData: v.optional(v.any()),
  documentIds: v.array(v.id('documents')),

  config: v.optional(
    v.object({
      processingMode: processingModeValidator,
      deliveryMode: deliveryModeValidator,
      deliveryAddress: v.optional(addressValidator),
      proxy: v.optional(
        v.object({
          firstName: v.string(),
          lastName: v.string(),
          identityDoc: v.id('documents'),
          powerOfAttorneyDoc: v.id('documents'),
        }),
      ),
    }),
  ),

  delivery: v.optional(
    v.object({
      address: addressValidator,
      trackingNumber: v.string(),
      status: deliveryStatusValidator,
    }),
  ),

  generatedDocuments: v.array(v.id('documents')),

  notes: v.array(noteValidator),

  metadata: v.object({
    activities: v.array(activityValidator),
    organization: v.optional(
      v.object({
        name: v.string(),
        type: v.string(),
        logo: v.optional(v.string()),
      }),
    ),
    requester: v.optional(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        email: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
      }),
    ),
    profile: v.optional(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        email: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
        isChildProfile: v.optional(v.boolean()),
      }),
    ),
    assignee: v.optional(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
      }),
    ),
    service: v.optional(
      v.object({
        name: v.string(),
        category: serviceCategoryValidator,
      }),
    ),
  }),

  submittedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  assignedAt: v.optional(v.number()),
})
  .index('by_number', ['number'])
  .index('by_service', ['serviceId'])
  .index('by_requester', ['requesterId'])
  .index('by_submitted_at', ['submittedAt'])
  .index('by_organization', ['organizationId'])
  .index('by_profile', ['profileId'])
  .index('by_assignee', ['assignedAgentId'])
  .index('by_status', ['status'])
  .index('by_priority', ['priority'])
  .index('by_profile_status', ['profileId', 'status'])
  .index('by_assignee_status', ['assignedAgentId', 'status'])
  .index('by_priority_status', ['priority', 'status'])
  .index('by_country_code_status', ['countryCode', 'status'])
  .index('by_status_profile_service', ['status', 'profileId', 'serviceId']);
