'use server';

import { getCurrentUser } from '@/actions/user';
import { db } from '@/lib/prisma';
import { Notification, NotificationType } from '@prisma/client';

export async function getUnreadNotificationsCount() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { count: 0 };
    }

    const count = await db.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    return { count };
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return { count: 0 };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    await db.notification.update({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { error: 'Failed to mark notification as read' };
  }
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    return db.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  profileId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        profileId: params.profileId,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}
