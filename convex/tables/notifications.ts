import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  deliveryStatusValidator,
  notificationChannelValidator,
  notificationStatusValidator,
  notificationTypeValidator,
} from '../lib/validators'

export const notifications = defineTable({
  userId: v.id('users'),

  // Contenu
  type: notificationTypeValidator,
  title: v.string(),
  content: v.string(),

  // État
  status: notificationStatusValidator,
  readAt: v.optional(v.number()),

  // Multi-canal
  channels: v.array(notificationChannelValidator), // Type-safe avec enum
  deliveryStatus: deliveryStatusValidator,

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
