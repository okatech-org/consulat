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
} from '../lib/validators';

export const requests = defineTable({
  number: v.string(), // Numéro unique
  serviceId: v.id('services'),

  // Demandeur
  requesterId: v.id('users'),
  profileId: v.optional(v.union(v.id('profiles'), v.id('childProfiles'))), // Pour qui

  // État avec validation enum
  status: requestStatusValidator,
  priority: requestPriorityValidator,

  // Données
  formData: v.optional(v.any()),
  documentIds: v.array(v.id('documents')),

  // Assignation
  assignedAgentId: v.optional(v.id('memberships')),

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
    submittedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    assignedAt: v.optional(v.number()),
    // Traçabilité et actions
    activities: v.array(activityValidator),
  }),
})
  .index('by_number', ['number'])
  .index('by_service', ['serviceId'])
  .index('by_requester', ['requesterId'])
  .index('by_status', ['status'])
  .index('by_priority_status', ['priority', 'status'])
  .index('by_assigned', ['assignedAgentId'])
  .index('by_requester_status', ['requesterId', 'status'])
  .index('by_service_status', ['serviceId', 'status'])
  .index('by_assigned_status', ['assignedAgentId', 'status']);
