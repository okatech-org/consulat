'use server';

import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';

/**
 * Send a message to a profile and notify the profile owner
 */
export async function sendProfileMessage(
  profileId: string,
  message: string,
  recipientEmail: string,
) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error('You must be logged in to send messages');
  }

  // Get the profile and ensure it exists
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    include: { user: true },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  // Create the message in the database
  const createdMessage = await db.message.create({
    data: {
      content: message,
      userId: session.user.id,
    },
  });

  const notificationTitle = 'Nouveau message';
  const notificationContent = `${session.user.name || 'Un utilisateur'} vous a envoyé un message.`;

  // Create a notification using the notify service
  await notify({
    userId: profile.userId ?? '',
    type: NotificationType.REQUEST_NEW,
    title: notificationTitle,
    message: notificationContent,
    channels: [NotificationChannel.APP],
    email: recipientEmail,
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
      senderName: session.user.name || '',
    },
  });

  return createdMessage;
}
