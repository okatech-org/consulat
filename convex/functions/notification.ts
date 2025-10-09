import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from "../lib/constants";
import type { Doc } from "../_generated/dataModel";

// Mutations
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
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
    const notificationId = await ctx.db.insert("notifications", {
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
    });

    return notificationId;
  },
});

export const createBulkNotifications = mutation({
  args: {
    userIds: v.array(v.id("users")),
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
      const notificationId = await ctx.db.insert("notifications", {
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
      });

      notificationIds.push(notificationId);
    }

    return notificationIds;
  },
});

export const createAppointmentReminder = mutation({
  args: {
    appointmentId: v.id("appointments"),
    reminderType: v.string(),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const reminderTimes = {
      "3_days": 3 * 24 * 60 * 60 * 1000,
      "1_day": 24 * 60 * 60 * 1000,
      "1_hour": 60 * 60 * 1000,
    };

    const scheduledFor =
      appointment.startAt -
      reminderTimes[args.reminderType as keyof typeof reminderTimes];

    if (scheduledFor <= Date.now()) {
      throw new Error("Cannot schedule reminder in the past");
    }

    const notificationIds: Array<string> = [];

    for (const participant of appointment.participants) {
      const notificationId = await ctx.db.insert("notifications", {
        userId: participant.userId,
        type: NotificationType.Reminder,
        title: "Rappel de rendez-vous",
        content: `Vous avez un rendez-vous dans ${args.reminderType.replace("_", " ")}`,
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
        relatedType: "appointment",
        createdAt: Date.now(),
        expiresAt: appointment.startAt,
      });

      notificationIds.push(notificationId);
    }

    return notificationIds;
  },
});

export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.readAt) {
      throw new Error("Notification already read");
    }

    await ctx.db.patch(args.notificationId, {
      readAt: Date.now(),
    });

    return args.notificationId;
  },
});

export const markAllNotificationsAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("readAt", undefined),
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

export const updateNotificationStatus = mutation({
  args: {
    notificationId: v.id("notifications"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      status: args.status as NotificationStatus,
      ...(args.status === "sent" && { sentAt: Date.now() }),
    });

    return args.notificationId;
  },
});

export const updateDeliveryStatus = mutation({
  args: {
    notificationId: v.id("notifications"),
    channel: v.string(),
    delivered: v.boolean(),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
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

export const rescheduleNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
    newScheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.newScheduledFor <= Date.now()) {
      throw new Error("Cannot schedule notification in the past");
    }

    await ctx.db.patch(args.notificationId, {
      scheduledFor: args.newScheduledFor,
      status: NotificationStatus.Pending,
      sentAt: undefined,
    });

    return args.notificationId;
  },
});

export const cancelNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.status === NotificationStatus.Sent) {
      throw new Error("Cannot cancel sent notification");
    }

    await ctx.db.patch(args.notificationId, {
      status: NotificationStatus.Failed,
    });

    return args.notificationId;
  },
});

export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return args.notificationId;
  },
});

export const deleteExpiredNotifications = mutation({
  args: {
    userId: v.optional(v.id("users")),
    olderThan: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notificationsQuery = ctx.db.query("notifications");

    if (args.userId) {
      notificationsQuery = notificationsQuery.filter((q) =>
        q.eq(q.field("userId"), args.userId),
      );
    }

    const notifications = await notificationsQuery.collect();
    const now = Date.now();
    const olderThan = args.olderThan || 30 * 24 * 60 * 60 * 1000;

    const expiredNotifications = notifications.filter((notification) => {
      const isExpired = notification.expiresAt && notification.expiresAt < now;
      const isOld = notification.createdAt < now - olderThan;
      const isRead =
        notification.readAt && notification.readAt < now - olderThan;

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
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.notificationId);
  },
});

export const getNotificationsByUser = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications: Array<Doc<"notifications">> = [];

    if (args.unreadOnly) {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user_unread", (q) =>
          q.eq("userId", args.userId).eq("readAt", undefined),
        )
        .order("desc")
        .collect();
    } else {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", args.userId).eq("status", args.status || "sent"),
        )
        .order("desc")
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
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications: Array<Doc<"notifications">> = [];

    if (args.status && args.type) {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .filter((q) => q.eq(q.field("status"), args.status!))
        .order("desc")
        .collect();
    } else if (args.status) {
      notifications = await ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("status"), args.status!))
        .order("desc")
        .collect();
    } else if (args.type) {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("desc")
        .collect();
    } else {
      notifications = await ctx.db
        .query("notifications")
        .order("desc")
        .collect();
    }

    return args.limit ? notifications.slice(0, args.limit) : notifications;
  },
});

export const getUnreadNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("readAt", undefined),
      )
      .order("desc")
      .collect();
  },
});

export const getScheduledNotifications = query({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.neq(q.field("scheduledFor"), undefined))
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

    return notifications.filter((n) => n.status === "pending");
  },
});

export const getNotificationsByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .collect();
  },
});

export const getNotificationsByRelated = query({
  args: {
    relatedId: v.string(),
    relatedType: v.string(),
  },
  handler: async (ctx, args) => {
    const allNotifications = await ctx.db
      .query("notifications")
      .order("desc")
      .collect();

    return allNotifications.filter(
      (notification) =>
        notification.relatedId === args.relatedId &&
        notification.relatedType === args.relatedType,
    );
  },
});

export const getNotificationStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const stats = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.readAt).length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    notifications.forEach((notification) => {
      stats.byType[notification.type] =
        (stats.byType[notification.type] || 0) + 1;
      stats.byStatus[notification.status] =
        (stats.byStatus[notification.status] || 0) + 1;
    });

    return stats;
  },
});
