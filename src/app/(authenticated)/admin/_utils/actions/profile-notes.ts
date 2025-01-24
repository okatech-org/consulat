'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import { getTranslations } from 'next-intl/server';
import { createNotification } from '@/actions/notifications';
interface AddNoteInput {
  profileId: string;
  content: string;
  type: 'INTERNAL' | 'FEEDBACK';
}

export async function addProfileNote(input: AddNoteInput) {
  const t = await getTranslations('actions.profiles.review.notes');

  try {
    const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);
    if (authResult.error || !authResult.user) {
      return { error: authResult.error };
    }

    // Récupérer le profil pour avoir l'userId
    const profile = await db.profile.findUnique({
      where: { id: input.profileId },
      select: { userId: true },
    });

    if (!profile) {
      return { error: 'Profile not found' };
    }

    // Créer la note
    const note = await db.profileNote.create({
      data: {
        content: input.content,
        type: input.type,
        profileId: input.profileId,
        createdBy: authResult.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    // Si c'est un feedback, créer une notification pour l'utilisateur
    if (input.type === 'FEEDBACK') {
      await createNotification({
        userId: profile.userId,
        type: 'PROFILE_FEEDBACK',
        title: t('notification.title'),
        message: input.content,
        profileId: input.profileId,
      });
    }

    revalidatePath(`${ROUTES.admin_profiles}/${input.profileId}/review`);

    return { success: true, data: note };
  } catch (error) {
    console.error('Error adding note:', error);
    return { error: 'Failed to add note' };
  }
}
