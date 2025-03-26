'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { deleteFiles } from '@/actions/uploads';
import { tryCatch } from '@/lib/utils';
import { AppUserDocument } from '@/types';
import { auth } from '@/auth';

interface UpdateDocumentData {
  issuedAt?: string;
  expiresAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export async function updateUserDocument(
  documentId: string,
  data: UpdateDocumentData,
): Promise<AppUserDocument | null> {
  await checkAuth();

  const { data: updatedDocument, error } = await tryCatch(
    db.userDocument.update({
      where: { id: documentId },
      data: {
        issuedAt: data.issuedAt ? new Date(data.issuedAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        metadata: data.metadata || undefined,
        // Remettre le statut en attente si les dates sont modifiées
        status: data.issuedAt || data.expiresAt ? DocumentStatus.PENDING : undefined,
      },
    }),
  );

  if (error || !updatedDocument) {
    throw new Error('update_document_failed');
  }

  return {
    ...updatedDocument,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: updatedDocument?.metadata as Record<string, any>,
  };
}

export async function checkDocumentExists(documentId: string): Promise<boolean> {
  await checkAuth();

  const { data: document, error } = await tryCatch(
    db.userDocument.findUnique({
      where: { id: documentId },
    }),
  );

  if (error) {
    console.error('Error checking document existence:', error);
  }

  return !!document;
}

export async function deleteUserDocument(documentId: string): Promise<boolean> {
  await checkAuth();

  // Supprimer le document
  const { error: deleteError } = await tryCatch(
    db.userDocument.delete({
      where: { id: documentId },
    }),
  );

  if (deleteError) {
    console.error('delete_document_failed', deleteError);
  }

  // Supprimer le fichier si c'est un fichier uploadthing
  const { error: deleteErrorFile } = await tryCatch(deleteFiles([documentId]));

  if (deleteErrorFile) {
    console.log('deleteErrorFile', { ...deleteErrorFile });
  }

  return true;
}

export async function createUserDocument(data: {
  id?: string;
  type: DocumentType;
  fileUrl: string;
  fileType: string;
  userId?: string;
  profileId?: string;
}): Promise<AppUserDocument | null> {
  const authResult = await auth();

  if (!authResult?.user) {
    throw new Error('Vous devez être connecté pour créer un document');
  }

  // @ts-expect-error - We don't need to define the type for the typesMap
  const typesMap: Record<
    DocumentType,
    | 'identityPictureProfile'
    | 'passportProfile'
    | 'birthCertificateProfile'
    | 'residencePermitProfile'
    | 'addressProofProfile'
  > = {
    [DocumentType.IDENTITY_PHOTO]: 'identityPictureProfile',
    [DocumentType.PASSPORT]: 'passportProfile',
    [DocumentType.BIRTH_CERTIFICATE]: 'birthCertificateProfile',
    [DocumentType.RESIDENCE_PERMIT]: 'residencePermitProfile',
    [DocumentType.PROOF_OF_ADDRESS]: 'addressProofProfile',
  } as const;

  const { data: document, error: documentError } = await tryCatch(
    db.userDocument.create({
      data: {
        id: data.id,
        type: data.type,
        fileUrl: data.fileUrl,
        status: DocumentStatus.PENDING,
        fileType: data.fileType,
        userId: data.userId && data.userId !== '' ? data.userId : authResult.user.id,
        ...(data.profileId && {
          ...(typesMap[data.type] && {
            [typesMap[data.type]]: {
              connect: {
                id: data.profileId ?? authResult.user.profileId,
              },
            },
          }),
        }),
      },
    }),
  );

  if (documentError || !document) {
    if (data.id) {
      await deleteFiles([data.id]);
    }
    throw new Error('Failed to create document');
  }

  return {
    ...document,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata:
      typeof document.metadata === 'string'
        ? (JSON.parse(document.metadata || '{}') as Record<string, unknown>)
        : (document.metadata as Record<string, unknown>) || {},
  };
}
