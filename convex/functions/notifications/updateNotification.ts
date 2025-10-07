import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import { NotificationStatus } from '../../lib/constants'

export const markNotificationAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId)
    if (!notification) {
      throw new Error('Notification not found')
    }

    if (notification.readAt) {
      throw new Error('Notification already read')
    }

    await ctx.db.patch(args.notificationId, {
      readAt: Date.now(),
    })

    return args.notificationId
  },
})

export const markAllNotificationsAsRead = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) =>
        q.eq('userId', args.userId).eq('readAt', undefined),
      )
      .collect()

    const readAt = Date.now()
    const updatePromises = unreadNotifications.map((notification) =>
      ctx.db.patch(notification._id, { readAt }),
    )

    await Promise.all(updatePromises)
    return { updatedCount: unreadNotifications.length }
  },
})

export const updateNotificationStatus = mutation({
  args: {
    notificationId: v.id('notifications'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      status: args.status as NotificationStatus,
      ...(args.status === 'sent' && { sentAt: Date.now() }),
    })

    return args.notificationId
  },
})

export const updateDeliveryStatus = mutation({
  args: {
    notificationId: v.id('notifications'),
    channel: v.string(),
    delivered: v.boolean(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId)
    if (!notification) {
      throw new Error('Notification not found')
    }

    const updatedDeliveryStatus = {
      ...notification.deliveryStatus,
      [args.channel]: args.delivered,
    }

    await ctx.db.patch(args.notificationId, {
      deliveryStatus: updatedDeliveryStatus,
    })

    return args.notificationId
  },
})

export const rescheduleNotification = mutation({
  args: {
    notificationId: v.id('notifications'),
    newScheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.newScheduledFor <= Date.now()) {
      throw new Error('Cannot schedule notification in the past')
    }

    await ctx.db.patch(args.notificationId, {
      scheduledFor: args.newScheduledFor,
      status: NotificationStatus.Pending,
      sentAt: undefined,
    })

    return args.notificationId
  },
})

export const cancelNotification = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId)
    if (!notification) {
      throw new Error('Notification not found')
    }

    if (notification.status === NotificationStatus.Sent) {
      throw new Error('Cannot cancel sent notification')
    }

    await ctx.db.patch(args.notificationId, {
      status: NotificationStatus.Failed,
    })

    return args.notificationId
  },
})

export const deleteNotification = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId)
    return args.notificationId
  },
})

export const deleteExpiredNotifications = mutation({
  args: {
    userId: v.optional(v.id('users')),
    olderThan: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notificationsQuery = ctx.db.query('notifications')

    if (args.userId) {
      notificationsQuery = notificationsQuery.filter((q) =>
        q.eq(q.field('userId'), args.userId),
      )
    }

    const notifications = await notificationsQuery.collect()
    const now = Date.now()
    const olderThan = args.olderThan || 30 * 24 * 60 * 60 * 1000 // 30 jours par défaut

    const expiredNotifications = notifications.filter((notification) => {
      const isExpired = notification.expiresAt && notification.expiresAt < now
      const isOld = notification.createdAt < now - olderThan
      const isRead =
        notification.readAt && notification.readAt < now - olderThan

      return isExpired || isOld || isRead
    })

    const deletePromises = expiredNotifications.map((notification) =>
      ctx.db.delete(notification._id),
    )

    await Promise.all(deletePromises)
    return { deletedCount: expiredNotifications.length }
  },
})
