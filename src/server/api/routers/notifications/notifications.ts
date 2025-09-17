import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { NotificationType, Prisma } from '@prisma/client';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';

export const notificationsRouter = createTRPCRouter({
  // Récupérer la liste des notifications
  getList: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        unreadOnly: z.boolean().default(false),
        types: z.array(z.nativeEnum(NotificationType)).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.NotificationWhereInput = {
        userId: ctx.auth.userId,
        ...(input.unreadOnly && { read: false }),
        ...(input.types && { type: { in: input.types } }),
      };

      const notifications = await ctx.db.notification.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          appointment: {
            select: {
              id: true,
              date: true,
              type: true,
              status: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (notifications.length > input.limit) {
        const nextItem = notifications.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: notifications,
        nextCursor,
      };
    }),

  // Récupérer le nombre de notifications non lues
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.notification.count({
      where: {
        userId: ctx.auth.userId,
        read: false,
      },
    });

    return count;
  }),

  // Marquer une notification comme lue
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification non trouvée',
        });
      }

      const updated = await ctx.db.notification.update({
        where: { id: input.id },
        data: { read: true },
      });

      return updated;
    }),

  // Marquer toutes les notifications comme lues
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db.notification.updateMany({
      where: {
        userId: ctx.auth.userId,
        read: false,
      },
      data: { read: true },
    });

    return { count: result.count };
  }),

  // Supprimer une notification
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification non trouvée',
        });
      }

      await ctx.db.notification.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Supprimer toutes les notifications lues
  deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db.notification.deleteMany({
      where: {
        userId: ctx.auth.userId,
        read: true,
      },
    });

    return { count: result.count };
  }),

  // Récupérer les préférences de notification
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await ctx.db.notificationPreference.findMany({
      where: { userId: ctx.auth.userId },
    });

    // Créer une map des préférences par type et canal
    const preferencesMap: Record<string, Record<string, boolean>> = {};

    preferences.forEach((pref) => {
      if (!preferencesMap[pref.type]) {
        preferencesMap[pref.type] = {};
      }
      preferencesMap[pref.type]![pref.channel] = pref.enabled;
    });

    return preferencesMap;
  }),

  // Mettre à jour les préférences de notification
  updatePreferences: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        channel: z.string(),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const preference = await ctx.db.notificationPreference.upsert({
        where: {
          userId_type_channel: {
            userId: ctx.auth.userId,
            type: input.type,
            channel: input.channel,
          },
        },
        update: { enabled: input.enabled },
        create: {
          userId: ctx.auth.userId,
          type: input.type,
          channel: input.channel,
          enabled: input.enabled,
        },
      });

      return preference;
    }),

  // Créer une notification (pour les tests ou cas spéciaux)
  create: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(NotificationType),
        title: z.string(),
        message: z.string(),
        channels: z
          .array(z.nativeEnum(NotificationChannel))
          .default([NotificationChannel.APP]),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
        metadata: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await notify({
        userId: ctx.auth.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        channels: input.channels,
        priority: input.priority,
        metadata: input.metadata,
      });

      if (!result.successful) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la création de la notification',
        });
      }

      return result;
    }),

  // Récupérer les statistiques des notifications
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [total, unread, byType] = await Promise.all([
      ctx.db.notification.count({
        where: { userId: ctx.auth.userId },
      }),
      ctx.db.notification.count({
        where: { userId: ctx.auth.userId, read: false },
      }),
      ctx.db.notification.groupBy({
        by: ['type'],
        where: { userId: ctx.auth.userId },
        _count: { id: true },
      }),
    ]);

    return {
      total,
      unread,
      byType: byType.reduce(
        (acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        },
        {} as Record<NotificationType, number>,
      ),
    };
  }),
});
