import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { NotificationChannel, NotificationStatus, NotificationType } from '../lib/constants'

export const notifications = defineTable({
  userId: v.id('users'),

  // Contenu
  type: v.union(
    v.literal(NotificationType.Updated),
    v.literal(NotificationType.Reminder),
    v.literal(NotificationType.Confirmation),
    v.literal(NotificationType.Cancellation),
    v.literal(NotificationType.Communication),
    v.literal(NotificationType.ImportantCommunication),
  ),
  title: v.string(),
  content: v.string(),

  // État
  status: v.union(
    v.literal(NotificationStatus.Pending),
    v.literal(NotificationStatus.Sent),
    v.literal(NotificationStatus.Delivered),
    v.literal(NotificationStatus.Failed),
    v.literal(NotificationStatus.Read),
  ),
  readAt: v.optional(v.number()),

  // Multi-canal
  channels: v.array(
    v.union(
      v.literal(NotificationChannel.App),
      v.literal(NotificationChannel.Email),
      v.literal(NotificationChannel.Sms),
    )
  ),
  deliveryStatus: v.object({
    app: v.optional(v.boolean()),
    email: v.optional(v.boolean()),
    sms: v.optional(v.boolean()),
  }),

  // Programmation
  scheduledFor: v.optional(v.number()),
  sentAt: v.optional(v.number()),

  // Contexte
  relatedId: v.optional(v.string()),
  relatedType: v.optional(v.string()),

  createdAt: v.number(),
  expiresAt: v.optional(v.number()),
})
  .index('by_user_status', ['userId', 'status'])
  .index('by_user_unread', ['userId', 'readAt'])
  .index('by_scheduled', ['scheduledFor'])
  .index('by_type', ['type'])
