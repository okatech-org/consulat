import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  activityTypeValidator,
  requestActionTypeValidator,
  requestPriorityValidator,
  requestStatusValidator,
} from '../lib/validators';

export const requests = defineTable({
  number: v.string(), // Numéro unique
  serviceId: v.id('services'),

  // Demandeur
  requesterId: v.id('users'),
  profileId: v.optional(v.id('profiles')), // Pour qui

  // État avec validation enum
  status: requestStatusValidator,
  priority: requestPriorityValidator,

  // Données
  formData: v.optional(v.any()),
  documentIds: v.array(v.id('documents')),

  // Assignation
  assignedToId: v.optional(v.id('users')),
  assignedAt: v.optional(v.number()),

  // Traçabilité et actions
  activities: v.array(
    v.object({
      type: activityTypeValidator,
      actorId: v.optional(v.id('users')),
      data: v.optional(v.any()),
      timestamp: v.number(),
    }),
  ),
  actions: v.array(
    v.object({
      type: requestActionTypeValidator,
      data: v.optional(v.any()),
      userId: v.id('users'),
      createdAt: v.number(),
    }),
  ),

  // Timestamps
  submittedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_number', ['number'])
  .index('by_service', ['serviceId'])
  .index('by_requester', ['requesterId'])
  .index('by_status', ['status'])
  .index('by_priority_status', ['priority', 'status'])
  .index('by_assigned', ['assignedToId'])
  .index('by_requester_status', ['requesterId', 'status'])
  .index('by_service_status', ['serviceId', 'status'])
  .index('by_assigned_status', ['assignedToId', 'status'])
  .index('by_created_status', ['createdAt', 'status']);
