import { auth } from '@/next-auth';
import { db } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { notify } from '@/lib/services/notifications';
import { NotificationChannel } from '@/types/notifications';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to send a message' },
        { status: 401 },
      );
    }

    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const profileId = params.id;

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
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
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
        email: profile.email || undefined,
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

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
