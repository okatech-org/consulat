import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  notificationChannelValidator,
  notificationTypeValidator,
} from '../lib/validators';

export const notifications = defineTable({
  userId: v.id('users'),
  // Contenu
  type: notificationTypeValidator,
  title: v.string(),
  content: v.string(),

  readAt: v.optional(v.number()),

  // Multi-canal
  channels: v.array(notificationChannelValidator),
  deliveryStatus: v.object({
    appAt: v.optional(v.number()),
    emailAt: v.optional(v.number()),
    smsAt: v.optional(v.number()),
  }),

  // Programmation
  scheduledFor: v.optional(v.number()),
})
  .index('by_user_unread', ['userId', 'readAt'])
  .index('by_scheduled', ['scheduledFor'])
  .index('by_type', ['type']);
