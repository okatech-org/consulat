import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  RequestStatus,
  RequestPriority,
  ActivityType,
  RequestActionType,
} from '../lib/constants'

export const requests = defineTable({
  number: v.string(), // Numéro unique
  serviceId: v.id('services'),

  // Demandeur
  requesterId: v.id('users'),
  profileId: v.optional(v.id('profiles')), // Pour qui

  // État avec validation enum
  status: v.union(
    v.literal(RequestStatus.Pending),
    v.literal(RequestStatus.PendingCompletion),
    v.literal(RequestStatus.Edited),
    v.literal(RequestStatus.Draft),
    v.literal(RequestStatus.Submitted),
    v.literal(RequestStatus.UnderReview),
    v.literal(RequestStatus.InProduction),
    v.literal(RequestStatus.Validated),
    v.literal(RequestStatus.Rejected),
    v.literal(RequestStatus.ReadyForPickup),
    v.literal(RequestStatus.AppointmentScheduled),
    v.literal(RequestStatus.Completed),
    v.literal(RequestStatus.Cancelled),
  ),
  priority: v.union(
    v.literal(RequestPriority.Normal),
    v.literal(RequestPriority.Urgent),
    v.literal(RequestPriority.Critical),
  ),

  // Données
  formData: v.optional(v.any()),
  documentIds: v.array(v.id('documents')),

  // Assignation
  assignedToId: v.optional(v.id('users')),
  assignedAt: v.optional(v.number()),

  // Traçabilité et actions
  activities: v.array(
    v.object({
      type: v.union(
        v.literal(ActivityType.RequestCreated),
        v.literal(ActivityType.RequestSubmitted),
        v.literal(ActivityType.RequestAssigned),
        v.literal(ActivityType.DocumentUploaded),
        v.literal(ActivityType.DocumentValidated),
        v.literal(ActivityType.DocumentRejected),
        v.literal(ActivityType.PaymentReceived),
        v.literal(ActivityType.RequestCompleted),
        v.literal(ActivityType.RequestCancelled),
        v.literal(ActivityType.CommentAdded),
        v.literal(ActivityType.StatusChanged),
      ),
      actorId: v.optional(v.id("users")),
      data: v.optional(v.any()),
      timestamp: v.number(),
    })
  ),
  actions: v.array(
    v.object({
      type: v.union(
        v.literal(RequestActionType.Assignment),
        v.literal(RequestActionType.StatusChange),
        v.literal(RequestActionType.NoteAdded),
        v.literal(RequestActionType.DocumentAdded),
        v.literal(RequestActionType.DocumentValidated),
        v.literal(RequestActionType.AppointmentScheduled),
        v.literal(RequestActionType.PaymentReceived),
        v.literal(RequestActionType.Completed),
        v.literal(RequestActionType.ProfileUpdate),
        v.literal(RequestActionType.DocumentUpdated),
        v.literal(RequestActionType.DocumentDeleted),
      ),
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
  .index('by_created_status', ['createdAt', 'status'])
