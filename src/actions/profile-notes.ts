'use client';

import { checkAuth } from '@/lib/auth/action';
import { db } from '@/lib/prisma';
import { NoteType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';

interface AddNoteInput {
  profileId: string;
  content: string;
  type: NoteType;
}

export async function addProfileNote({ profileId, content, type }: AddNoteInput) {
  const authResult = await checkAuth(['ADMIN', 'AGENT', 'MANAGER']);
  if (authResult.error || !authResult.user) {
    throw new Error(authResult.error || 'Unauthorized');
  }

  try {
    const note = await db.profileNote.create({
      data: {
        content,
        type,
        profileId,
        createdBy: authResult.user.id,
      },
    });

    // Si c'est un feedback, créer une notification pour l'utilisateur
    if (type === 'FEEDBACK') {
      await db.notification.create({
        data: {
          type: 'PROFILE_FEEDBACK',
          title: 'Nouveau retour sur votre profil',
          message: content,
          profileId,
          userId: authResult.user.id,
        },
      });
    }

    revalidatePath(ROUTES.dashboard.registrations_review(profileId));
    return { success: true, data: note };
  } catch (error) {
    console.error('Error adding profile note:', error);
    throw new Error('Failed to add profile note');
  }
}
