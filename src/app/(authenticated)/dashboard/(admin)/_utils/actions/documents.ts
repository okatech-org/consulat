'use server';

import { db } from '@/lib/prisma';
import { DocumentStatus } from '@prisma/client';
import { checkAuth } from '@/lib/auth/action';

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

    return { success: true, data: document };
  } catch (error) {
    console.error('Error validating document:', error);
    return { error: 'Failed to validate document' };
  }
}
