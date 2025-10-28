import { v } from 'convex/values';
import {
  mutation,
  query,
  internalAction,
  internalQuery,
  action,
  internalMutation,
} from '../_generated/server';
import { NotificationChannel, NotificationType } from '../lib/constants';
import type { Doc } from '../_generated/dataModel';
import {
  notificationStatusValidator,
  notificationTypeValidator,
} from '../lib/validators';
import { internal } from '../_generated/api';
import { resend } from './email';
import { twilio } from '../lib/twilio';

// Mutations
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
      readAt: undefined,
      channels: args.channels as Array<NotificationChannel>,
      deliveryStatus: {
        appAt: undefined,
        emailAt: undefined,
        smsAt: undefined,
      },
      scheduledFor: args.scheduledFor,
    });

    return notificationId;
  },
});

export const createNotificationInternal = internalMutation({
  args: {
    userId: v.id('users'),
    type: v.string(),
    title: v.string(),
    content: v.string(),
    channels: v.array(v.string()),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert('notifications', {
      userId: args.userId,
      type: args.type as NotificationType,
      title: args.title,
      content: args.content,
      readAt: undefined,
      channels: args.channels as Array<NotificationChannel>,
      deliveryStatus: {
        appAt: undefined,
        emailAt: undefined,
        smsAt: undefined,
      },
      scheduledFor: args.scheduledFor,
    });

    return notificationId;
  },
});

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
    const notificationIds: Array<string> = [];

    for (const userId of args.userIds) {
      const notificationId = await ctx.db.insert('notifications', {
        userId: userId,
        type: args.type as NotificationType,
        title: args.title,
        content: args.content,
        readAt: undefined,
        channels: args.channels as Array<NotificationChannel>,
        deliveryStatus: {
          appAt: undefined,
          emailAt: undefined,
          smsAt: undefined,
        },
        scheduledFor: args.scheduledFor,
      });

      notificationIds.push(notificationId);
    }

    return notificationIds;
  },
});

export const createAppointmentReminder = mutation({
  args: {
    appointmentId: v.id('appointments'),
    reminderType: v.string(),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const reminderTimes = {
      '3_days': 3 * 24 * 60 * 60 * 1000,
      '1_day': 24 * 60 * 60 * 1000,
      '1_hour': 60 * 60 * 1000,
    };

    const scheduledFor =
      appointment.startAt -
      reminderTimes[args.reminderType as keyof typeof reminderTimes];

    if (scheduledFor <= Date.now()) {
      throw new Error('Cannot schedule reminder in the past');
    }

    const notificationIds: Array<string> = [];

    for (const participant of appointment.participants) {
      const notificationId = await ctx.db.insert('notifications', {
        userId: participant.userId,
        type: NotificationType.Reminder,
        title: 'Rappel de rendez-vous',
        content: `Vous avez un rendez-vous dans ${args.reminderType.replace('_', ' ')}`,
        readAt: undefined,
        channels: [NotificationChannel.App, NotificationChannel.Email],
        deliveryStatus: {
          appAt: undefined,
          emailAt: undefined,
          smsAt: undefined,
        },
        scheduledFor: scheduledFor,
      });

      notificationIds.push(notificationId);
    }

    return notificationIds;
  },
});

export const markNotificationAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.readAt) {
      throw new Error('Notification already read');
    }

    await ctx.db.patch(args.notificationId, {
      readAt: Date.now(),
    });

    return args.notificationId;
  },
});

export const markAllNotificationsAsRead = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) =>
        q.eq('userId', args.userId).eq('readAt', undefined),
      )
      .collect();

    const readAt = Date.now();
    const updatePromises = unreadNotifications.map((notification) =>
      ctx.db.patch(notification._id, { readAt }),
    );

    await Promise.all(updatePromises);
    return { updatedCount: unreadNotifications.length };
  },
});

export const updateDeliveryStatus = mutation({
  args: {
    notificationId: v.id('notifications'),
    channel: v.string(),
    delivered: v.boolean(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    const updatedDeliveryStatus = {
      ...notification.deliveryStatus,
      [args.channel]: args.delivered,
    };

    await ctx.db.patch(args.notificationId, {
      deliveryStatus: updatedDeliveryStatus,
    });

    return args.notificationId;
  },
});

export const updateDeliveryStatusInternal = internalMutation({
  args: {
    notificationId: v.id('notifications'),
    channel: v.string(),
    delivered: v.boolean(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    const timestamp = Date.now();
    const channelKey = `${args.channel}At` as keyof typeof notification.deliveryStatus;

    const updatedDeliveryStatus = {
      ...notification.deliveryStatus,
      [channelKey]: args.delivered ? timestamp : undefined,
    };

    await ctx.db.patch(args.notificationId, {
      deliveryStatus: updatedDeliveryStatus,
    });

    return args.notificationId;
  },
});

export const rescheduleNotification = mutation({
  args: {
    notificationId: v.id('notifications'),
    newScheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.newScheduledFor <= Date.now()) {
      throw new Error('Cannot schedule notification in the past');
    }

    await ctx.db.patch(args.notificationId, {
      scheduledFor: args.newScheduledFor,
      deliveryStatus: {
        appAt: undefined,
        emailAt: undefined,
        smsAt: undefined,
      },
    });

    return args.notificationId;
  },
});

export const cancelNotification = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (
      notification.deliveryStatus.appAt ||
      notification.deliveryStatus.emailAt ||
      notification.deliveryStatus.smsAt
    ) {
      throw new Error('Cannot cancel sent notification');
    }

    await ctx.db.patch(args.notificationId, {
      scheduledFor: undefined,
      deliveryStatus: {
        appAt: undefined,
        emailAt: undefined,
        smsAt: undefined,
      },
    });

    return args.notificationId;
  },
});

export const deleteNotification = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return args.notificationId;
  },
});

export const deleteExpiredNotifications = mutation({
  args: {
    userId: v.optional(v.id('users')),
    olderThan: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notificationsQuery = ctx.db.query('notifications');

    if (args.userId) {
      notificationsQuery = notificationsQuery.filter((q) =>
        q.eq(q.field('userId'), args.userId),
      );
    }

    const notifications = await notificationsQuery.collect();
    const now = Date.now();
    const olderThan = args.olderThan || 30 * 24 * 60 * 60 * 1000;

    const expiredNotifications = notifications.filter((notification) => {
      const isExpired = notification.scheduledFor && notification.scheduledFor < now;
      const isOld = notification._creationTime < now - olderThan;
      const isRead = notification.readAt && notification.readAt < now - olderThan;

      return isExpired || isOld || isRead;
    });

    const deletePromises = expiredNotifications.map((notification) =>
      ctx.db.delete(notification._id),
    );

    await Promise.all(deletePromises);
    return { deletedCount: expiredNotifications.length };
  },
});

// Queries
export const getNotification = query({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.notificationId);
  },
});

export const getNotificationsByUser = query({
  args: {
    userId: v.id('users'),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications: Array<Doc<'notifications'>> = [];

    if (args.unreadOnly) {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_unread', (q) =>
          q.eq('userId', args.userId).eq('readAt', undefined),
        )
        .order('desc')
        .collect();
    } else {
      notifications = await ctx.db
        .query('notifications')
        .filter((q) => q.eq(q.field('userId'), args.userId))
        .order('desc')
        .collect();
    }

    if (args.type) {
      notifications = notifications.filter(
        (notification) => notification.type === args.type,
      );
    }

    if (args.limit) {
      notifications = notifications.slice(0, args.limit);
    }

    return notifications;
  },
});

export const getAllNotifications = query({
  args: {
    status: v.optional(notificationStatusValidator),
    type: v.optional(notificationTypeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications: Array<Doc<'notifications'>> = [];

    if (args.status && args.type) {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .order('desc')
        .collect();
    } else if (args.status) {
      notifications = await ctx.db.query('notifications').order('desc').collect();
    } else if (args.type) {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .order('desc')
        .collect();
    } else {
      notifications = await ctx.db.query('notifications').order('desc').collect();
    }

    return args.limit ? notifications.slice(0, args.limit) : notifications;
  },
});

export const getUnreadNotifications = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) =>
        q.eq('userId', args.userId).eq('readAt', undefined),
      )
      .order('desc')
      .collect();
  },
});

export const getUnreadNotificationsCount = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) =>
        q.eq('userId', args.userId).eq('readAt', undefined),
      )
      .collect();
    
    return {
      count: notifications.length,
    };
  },
});

export const getScheduledNotifications = query({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications = await ctx.db
      .query('notifications')
      .filter((q) => q.neq(q.field('scheduledFor'), undefined))
      .collect();

    if (args.startTime) {
      notifications = notifications.filter(
        (n) => n.scheduledFor && n.scheduledFor >= args.startTime!,
      );
    }

    if (args.endTime) {
      notifications = notifications.filter(
        (n) => n.scheduledFor && n.scheduledFor <= args.endTime!,
      );
    }

    return notifications.filter(
      (n) =>
        n.deliveryStatus.appAt === undefined &&
        n.deliveryStatus.emailAt === undefined &&
        n.deliveryStatus.smsAt === undefined,
    );
  },
});

export const getNotificationsByType = query({
  args: { type: notificationTypeValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('notifications')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .order('desc')
      .collect();
  },
});

// Actions pour l'envoi multi-canal
export const sendNotificationEmail = internalAction({
  args: {
    notificationId: v.id('notifications'),
    email: v.string(),
    title: v.string(),
    content: v.string(),
    actionUrl: v.optional(v.string()),
    actionLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1d4ed8;">${args.title}</h2>
          <p style="color: #333; line-height: 1.6;">${args.content}</p>
      `;

      if (args.actionUrl && args.actionLabel) {
        html += `
          <div style="margin: 30px 0; text-align: center;">
            <a href="${args.actionUrl}" 
               style="background-color: #1d4ed8; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              ${args.actionLabel}
            </a>
          </div>
        `;
      }

      html += `
          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            Ceci est une notification automatique de Consulat.ga
          </p>
        </div>
      `;

      await resend.sendEmail(ctx, {
        from: `Consulat.ga <${process.env.RESEND_SENDER}>`,
        to: args.email,
        subject: args.title,
        html,
      });

      await ctx.runMutation(
        internal.functions.notification.updateDeliveryStatusInternal,
        {
          notificationId: args.notificationId,
          channel: NotificationChannel.Email,
          delivered: true,
        },
      );

      return { success: true };
    } catch (error) {
      console.error('Error sending email notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const sendNotificationSms = internalAction({
  args: {
    notificationId: v.id('notifications'),
    phoneNumber: v.string(),
    content: v.string(),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      let message = args.content;

      if (args.actionUrl) {
        message += `\n\n${args.actionUrl}`;
      }

      const status = await twilio.sendMessage(ctx, {
        to: args.phoneNumber,
        body: message,
      });

      await ctx.runMutation(
        internal.functions.notification.updateDeliveryStatusInternal,
        {
          notificationId: args.notificationId,
          channel: NotificationChannel.Sms,
          delivered: true,
        },
      );

      return { success: true, status };
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const sendMultiChannelNotification = action({
  args: {
    userId: v.id('users'),
    type: v.string(),
    title: v.string(),
    content: v.string(),
    channels: v.array(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    actionLabel: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    priority: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    notificationId: string;
    scheduled: boolean;
    results?: Array<{ channel: string; success: boolean; error?: string }>;
    success?: boolean;
  }> => {
    const notificationId = await ctx.runMutation(
      internal.functions.notification.createNotificationInternal,
      {
        userId: args.userId,
        type: args.type,
        title: args.title,
        content: args.content,
        channels: args.channels,
        scheduledFor: args.scheduledFor,
      },
    );

    if (args.scheduledFor && args.scheduledFor > Date.now()) {
      return { notificationId, scheduled: true };
    }

    const results: Array<{ channel: string; success: boolean; error?: string }> = [];

    for (const channel of args.channels) {
      if (channel === NotificationChannel.App) {
        await ctx.runMutation(
          internal.functions.notification.updateDeliveryStatusInternal,
          {
            notificationId,
            channel: NotificationChannel.App,
            delivered: true,
          },
        );
        results.push({ channel, success: true });
      } else if (channel === NotificationChannel.Email && args.email) {
        const emailResult = await ctx.runAction(
          internal.functions.notification.sendNotificationEmail,
          {
            notificationId,
            email: args.email,
            title: args.title,
            content: args.content,
            actionUrl: args.actionUrl,
            actionLabel: args.actionLabel,
          },
        );
        results.push({ channel, ...emailResult });
      } else if (channel === NotificationChannel.Sms && args.phoneNumber) {
        const smsResult = await ctx.runAction(
          internal.functions.notification.sendNotificationSms,
          {
            notificationId,
            phoneNumber: args.phoneNumber,
            content: args.content,
            actionUrl: args.actionUrl,
          },
        );
        results.push({ channel, ...smsResult });
      }
    }

    return {
      notificationId,
      scheduled: false,
      results,
      success: results.some((r) => r.success),
    };
  },
});

export const processScheduledNotifications = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const scheduledNotifications = await ctx.runQuery(
      internal.functions.notification.getScheduledNotificationsInternal,
      {
        startTime: 0,
        endTime: now,
      },
    );

    const processedCount = { success: 0, failed: 0 };

    for (const notification of scheduledNotifications.slice(0, 50)) {
      try {
        const user = await ctx.runQuery(
          internal.functions.notification.getUserForNotification,
          {
            userId: notification.userId,
          },
        );

        if (!user) {
          console.error(`User not found for notification ${notification._id}`);
          processedCount.failed++;
          continue;
        }

        for (const channel of notification.channels) {
          if (channel === NotificationChannel.App) {
            await ctx.runMutation(
              internal.functions.notification.updateDeliveryStatusInternal,
              {
                notificationId: notification._id,
                channel: NotificationChannel.App,
                delivered: true,
              },
            );
          } else if (channel === NotificationChannel.Email && user.email) {
            await ctx.runAction(internal.functions.notification.sendNotificationEmail, {
              notificationId: notification._id,
              email: user.email,
              title: notification.title,
              content: notification.content,
            });
          } else if (channel === NotificationChannel.Sms && user.phoneNumber) {
            await ctx.runAction(internal.functions.notification.sendNotificationSms, {
              notificationId: notification._id,
              phoneNumber: user.phoneNumber,
              content: notification.content,
            });
          }
        }

        processedCount.success++;
      } catch (error) {
        console.error(
          `Error processing scheduled notification ${notification._id}:`,
          error,
        );
        processedCount.failed++;
      }
    }

    return processedCount;
  },
});

export const getUserForNotification = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getScheduledNotificationsInternal = internalQuery({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications = await ctx.db
      .query('notifications')
      .filter((q) => q.neq(q.field('scheduledFor'), undefined))
      .collect();

    if (args.startTime) {
      notifications = notifications.filter(
        (n) => n.scheduledFor && n.scheduledFor >= args.startTime!,
      );
    }

    if (args.endTime) {
      notifications = notifications.filter(
        (n) => n.scheduledFor && n.scheduledFor <= args.endTime!,
      );
    }

    return notifications.filter(
      (n) =>
        n.deliveryStatus.appAt === undefined &&
        n.deliveryStatus.emailAt === undefined &&
        n.deliveryStatus.smsAt === undefined,
    );
  },
});
