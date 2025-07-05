'use server';

import { db } from '@/server/db';
import { NotificationType } from '@prisma/client';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';
import { tryCatch } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth/utils';

/**
 * Send a message to a profile and notify the profile owner
 */
export async function sendProfileMessage(
  userId: string,
  message: string,
  recipientEmail: string,
  from: string,
  contact: string,
) {
  const currentUser = await getCurrentUser();
  const notificationContent = `${from} vous a envoyé un message. \n\n${message} \n\nVous pouvez le contacter via : ${contact}`;

  // Create the message in the database
  const { error: messageError, data: createdMessage } = await tryCatch(
    db.message.create({
      data: {
        content: notificationContent,
        receiverId: userId,
        senderId: currentUser?.id ?? null,
      },
    }),
  );

  if (messageError) {
    console.error('Error creating message:', messageError);
    throw messageError;
  }

  const notificationTitle = 'Vous avez reçu un message de contact';

  // Create a notification using the notify service
  const { error: notificationError } = await tryCatch(
    notify({
      userId: userId,
      type: NotificationType.REQUEST_NEW,
      title: notificationTitle,
      message: notificationContent,
      channels: [NotificationChannel.APP, NotificationChannel.EMAIL],
      email: recipientEmail,
      metadata: {
        messageId: createdMessage!.id,
        senderId: userId,
        senderName: from,
      },
    }),
  );

  if (notificationError) {
    console.error('Error sending notification:', notificationError);
  }

  return createdMessage;
}
