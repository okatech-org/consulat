import { v } from 'convex/values'
import { query } from '../../_generated/server'

export const getNotification = query({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.notificationId)
  },
})

export const getNotificationsByUser = query({
  args: {
    userId: v.id('users'),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications: Array<any> = []

    if (args.unreadOnly) {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_unread', (q) =>
          q.eq('userId', args.userId).eq('readAt', undefined),
        )
        .order('desc')
        .collect()
    } else {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_status', (q) =>
          q.eq('userId', args.userId).eq('status', args.status || 'sent'),
        )
        .order('desc')
        .collect()
    }

    if (args.type) {
      notifications = notifications.filter(
        (notification) => notification.type === args.type,
      )
    }

    if (args.limit) {
      notifications = notifications.slice(0, args.limit)
    }

    return notifications
  },
})

export const getAllNotifications = query({
  args: {
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications: Array<any> = []

    if (args.status && args.type) {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect()
    } else if (args.status) {
      notifications = await ctx.db
        .query('notifications')
        .filter((q) => q.eq(q.field('status'), args.status!))
        .order('desc')
        .collect()
    } else if (args.type) {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .order('desc')
        .collect()
    } else {
      notifications = await ctx.db
        .query('notifications')
        .order('desc')
        .collect()
    }

    return args.limit ? notifications.slice(0, args.limit) : notifications
  },
})

export const getUnreadNotifications = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) =>
        q.eq('userId', args.userId).eq('readAt', undefined),
      )
      .order('desc')
      .collect()
  },
})

export const getScheduledNotifications = query({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications = await ctx.db
      .query('notifications')
      .filter((q) => q.neq(q.field('scheduledFor'), undefined))
      .collect()

    if (args.startTime) {
      notifications = notifications.filter(
        (n) => n.scheduledFor && n.scheduledFor >= args.startTime!,
      )
    }

    if (args.endTime) {
      notifications = notifications.filter(
        (n) => n.scheduledFor && n.scheduledFor <= args.endTime!,
      )
    }

    return notifications.filter((n) => n.status === 'pending')
  },
})

export const getNotificationsByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('notifications')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .order('desc')
      .collect()
  },
})

export const getNotificationsByRelated = query({
  args: {
    relatedId: v.string(),
    relatedType: v.string(),
  },
  handler: async (ctx, args) => {
    const allNotifications = await ctx.db
      .query('notifications')
      .order('desc')
      .collect()

    return allNotifications.filter(
      (notification) =>
        notification.relatedId === args.relatedId &&
        notification.relatedType === args.relatedType,
    )
  },
})

export const getNotificationStats = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .collect()

    const stats = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.readAt).length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    }

    notifications.forEach((notification) => {
      stats.byType[notification.type] =
        (stats.byType[notification.type] || 0) + 1
      stats.byStatus[notification.status] =
        (stats.byStatus[notification.status] || 0) + 1
    })

    return stats
  },
})
