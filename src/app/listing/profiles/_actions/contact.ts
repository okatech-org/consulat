'use server';

import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { tryCatch } from '@/lib/utils';
import { NotificationType } from '@prisma/client';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';

/**
 * Send a message to a profile and notify the profile owner
 */
export async function sendProfileMessage(profileId: string, message: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('You must be logged in to send a message');
  }

  const { error, data } = await tryCatch(async () => {
    // Get the profile and check if it exists
    const profile = await db.profile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Create a message record
    const createdMessage = await db.message.create({
      data: {
        content: message,
        userId: session.user.id,
        // We don't have a direct link to the profile in the Message model,
        // so we leave it unlinked at this stage
      },
    });

    // If the profile has a user, notify them
    if (profile.user) {
      const notificationTitle = 'Nouveau message';
      const notificationContent = `${session.user.name} vous a envoyé un message.`;

      // Create a notification using the notify service
      await notify({
        userId: profile.user.id,
        type: NotificationType.REQUEST_NEW, // Using an existing notification type
        title: notificationTitle,
        message: notificationContent,
        channels: [NotificationChannel.APP, NotificationChannel.EMAIL], // Send both app notification and email
        email: profile.user.email || undefined,
        actions: [
          {
            label: 'Voir le message',
            url: `/messages`,
            primary: true,
          },
        ],
        metadata: {
          messageId: createdMessage.id,
          senderId: session.user.id,
          senderName: session.user.name,
        },
      });
    }

    return createdMessage;
  });

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }

  return data;
}
