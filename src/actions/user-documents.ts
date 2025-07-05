'use server';

import { db } from '@/server/db';
import { checkAuth } from '@/lib/auth/action';
import { DocumentStatus, DocumentType, RequestActionType } from '@prisma/client';
import { deleteFiles } from '@/actions/uploads';
import { tryCatch } from '@/lib/utils';
import type { AppUserDocument } from '@/types';
import { getCurrentUser } from '@/lib/auth/utils';

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

export async function deleteUserDocument(
  documentId: string,
  requestId?: string,
): Promise<boolean> {
  const authResult = await checkAuth();

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
    console.error({ ...deleteErrorFile });
  }

  if (requestId) {
    const { error: updateError } = await tryCatch(
      db.serviceRequest.update({
        where: { id: requestId },
        data: {
          lastActionAt: new Date(),
          lastActionBy: authResult.user.id,
          actions: {
            create: {
              type: RequestActionType.DOCUMENT_DELETED,
              userId: authResult.user.id,
              data: { documentId, name: authResult.user.name },
            },
          },
        },
      }),
    );

    if (updateError) {
      console.error('update_document_failed', updateError);
    }
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
  requestId?: string;
}): Promise<AppUserDocument | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Vous devez être connecté pour créer un document');
  }

  // Map document types to profile field names
  const profileFieldMap: Record<DocumentType, string> = {
    [DocumentType.IDENTITY_PHOTO]: 'identityPictureId',
    [DocumentType.PASSPORT]: 'passportId',
    [DocumentType.BIRTH_CERTIFICATE]: 'birthCertificateId',
    [DocumentType.RESIDENCE_PERMIT]: 'residencePermitId',
    [DocumentType.PROOF_OF_ADDRESS]: 'addressProofId',
    [DocumentType.IDENTITY_CARD]: '', // Not connected to profile
    [DocumentType.MARRIAGE_CERTIFICATE]: '', // Not connected to profile
    [DocumentType.DEATH_CERTIFICATE]: '', // Not connected to profile
    [DocumentType.DIVORCE_DECREE]: '', // Not connected to profile
    [DocumentType.NATIONALITY_CERTIFICATE]: '', // Not connected to profile
    [DocumentType.OTHER]: '', // Not connected to profile
    [DocumentType.VISA_PAGES]: '', // Not connected to profile
    [DocumentType.EMPLOYMENT_PROOF]: '', // Not connected to profile
    [DocumentType.NATURALIZATION_DECREE]: '', // Not connected to profile
    [DocumentType.CONSULAR_CARD]: '', // Not connected to profile
  } as const;

  const { data: document, error: documentError } = await tryCatch(
    db.$transaction(async (tx) => {
      // 1. Create the document first
      const newDocument = await tx.userDocument.create({
        data: {
          id: data.id,
          type: data.type,
          fileUrl: data.fileUrl,
          status: DocumentStatus.PENDING,
          fileType: data.fileType,
          userId: data.userId && data.userId !== '' ? data.userId : currentUser.id,
        },
      });

      // 2. If profileId is provided and document type is mapped to a profile field, update the profile
      if (data.profileId && profileFieldMap[data.type]) {
        const profileField = profileFieldMap[data.type];

        await tx.profile.update({
          where: { id: data.profileId },
          data: {
            [profileField]: newDocument.id,
          },
        });
      }

      return newDocument;
    }),
  );

  if (documentError || !document) {
    if (data.id) {
      await deleteFiles([data.id]);
    }
    throw new Error('Failed to create document');
  }

  if (data.requestId) {
    const { error: updateError } = await tryCatch(
      db.serviceRequest.update({
        where: { id: data.requestId },
        data: {
          lastActionAt: new Date(),
          lastActionBy: currentUser.id,
          actions: {
            create: {
              type: RequestActionType.DOCUMENT_UPDATED,
              userId: currentUser.id,
              data: { documentId: data.id },
            },
          },
        },
      }),
    );

    if (updateError) {
      console.error('update_document_failed', updateError);
    }
  }

  return {
    ...document,
     
    metadata:
      typeof document.metadata === 'string'
        ? (JSON.parse(document.metadata || '{}') as Record<string, unknown>)
        : (document.metadata as Record<string, unknown>) || {},
  };
}

/**
 * Remplace le fichier d'un UserDocument, met à jour fileUrl, fileType et remet le statut à PENDING.
 * @param documentId - L'identifiant du document à mettre à jour
 * @param fileUrl - La nouvelle URL du fichier
 * @param fileType - Le nouveau type MIME du fichier
 * @returns Le document mis à jour au format AppUserDocument
 */
export async function replaceUserDocumentFile(
  documentId: string,
  fileUrl: string,
  fileType: string,
): Promise<AppUserDocument | null> {
  await checkAuth();

  const { data: updatedDocument, error } = await tryCatch(
    db.userDocument.update({
      where: { id: documentId },
      data: {
        fileUrl,
        fileType,
        status: DocumentStatus.PENDING,
      },
    }),
  );

  if (error || !updatedDocument) {
    throw new Error('replace_document_file_failed');
  }

  return {
    ...updatedDocument,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: updatedDocument?.metadata as Record<string, any>,
  };
}
