'use server';

import { db } from '@/lib/prisma';
import { DocumentStatus } from '@prisma/client';
import { checkAuth } from '@/lib/auth/action';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';

interface ValidateDocumentInput {
  documentId: string;
  status: DocumentStatus;
  notes?: string;
}

export async function validateDocument(input: ValidateDocumentInput) {
  try {
    const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER']);
    if (authResult.error || !authResult.user) {
      return { error: authResult.error };
    }

    const document = await db.userDocument.update({
      where: { id: input.documentId },
      data: {
        status: input.status,
        metadata: {
          ...(input.notes && { validationNotes: input.notes }),
          validatedBy: authResult.user.id,
          validatedAt: new Date().toISOString(),
        },
      },
      include: {
        user: true,
      },
    });

    // Revalider les pages concernées
    revalidatePath(ROUTES.admin_profiles);
    revalidatePath(`${ROUTES.admin_profiles}/${document.user?.id}/review`);

    return { success: true, data: document };
  } catch (error) {
    console.error('Error validating document:', error);
    return { error: 'Failed to validate document' };
  }
}
