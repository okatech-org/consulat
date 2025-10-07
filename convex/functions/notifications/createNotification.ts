import { v } from 'convex/values'
import { mutation } from '../../_generated/server'
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../../lib/constants'

export const createNotification = mutation({
  args: {
    userId: v.id('users'),
    type: v.string(),
    title: v.string(),
    content: v.string(),
    channels: v.array(v.string()),
    scheduledFor: v.optional(v.number()),
    relatedId: v.optional(v.string()),
    relatedType: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert('notifications', {
      userId: args.userId,
      type: args.type as NotificationType,
      title: args.title,
      content: args.content,
      status: NotificationStatus.Pending,
      readAt: undefined,
      channels: args.channels as Array<NotificationChannel>,
      deliveryStatus: {
        app: false,
        email: false,
        sms: false,
      },
      scheduledFor: args.scheduledFor,
      sentAt: undefined,
      relatedId: args.relatedId,
      relatedType: args.relatedType,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    })

    return notificationId
  },
})

export const createBulkNotifications = mutation({
  args: {
    userIds: v.array(v.id('users')),
    type: v.string(),
    title: v.string(),
    content: v.string(),
    channels: v.array(v.string()),
    scheduledFor: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const notificationIds: Array<string> = []

    for (const userId of args.userIds) {
      const notificationId = await ctx.db.insert('notifications', {
        userId: userId,
        type: args.type as NotificationType,
        title: args.title,
        content: args.content,
        status: NotificationStatus.Pending,
        readAt: undefined,
        channels: args.channels as Array<NotificationChannel>,
        deliveryStatus: {
          app: false,
          email: false,
          sms: false,
        },
        scheduledFor: args.scheduledFor,
        sentAt: undefined,
        relatedId: undefined,
        relatedType: undefined,
        createdAt: Date.now(),
        expiresAt: args.expiresAt,
      })

      notificationIds.push(notificationId)
    }

    return notificationIds
  },
})

export const createAppointmentReminder = mutation({
  args: {
    appointmentId: v.id('appointments'),
    reminderType: v.string(), // '3_days', '1_day', '1_hour'
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }

    const reminderTimes = {
      '3_days': 3 * 24 * 60 * 60 * 1000,
      '1_day': 24 * 60 * 60 * 1000,
      '1_hour': 60 * 60 * 1000,
    }

    const scheduledFor =
      appointment.startAt -
      reminderTimes[args.reminderType as keyof typeof reminderTimes]

    if (scheduledFor <= Date.now()) {
      throw new Error('Cannot schedule reminder in the past')
    }

    const notificationIds: Array<string> = []

    for (const participant of appointment.participants) {
      const notificationId = await ctx.db.insert('notifications', {
        userId: participant.userId,
        type: NotificationType.Reminder,
        title: 'Rappel de rendez-vous',
        content: `Vous avez un rendez-vous dans ${args.reminderType.replace('_', ' ')}`,
        status: NotificationStatus.Pending,
        readAt: undefined,
        channels: [NotificationChannel.App, NotificationChannel.Email],
        deliveryStatus: {
          app: false,
          email: false,
          sms: false,
        },
        scheduledFor: scheduledFor,
        sentAt: undefined,
        relatedId: args.appointmentId,
        relatedType: 'appointment',
        createdAt: Date.now(),
        expiresAt: appointment.startAt,
      })

      notificationIds.push(notificationId)
    }

    return notificationIds
  },
})
