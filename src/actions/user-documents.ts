'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { processFileData } from '@/actions/utils';
import { deleteFiles } from '@/actions/uploads';
import { tryCatch } from '@/lib/utils';
import { AppUserDocument } from '@/types';
import { FileUploadResponse } from '@/components/ui/file-input';

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

export async function deleteUserDocument(documentId: string): Promise<boolean> {
  await checkAuth();

  // Vérifier que le document appartient à l'utilisateur
  // TODO: Vérifier que le document appartient à l'utilisateur
  const { data: document, error: documentError } = await tryCatch(
    db.userDocument.findFirst({
      where: {
        id: documentId,
      },
    }),
  );

  if (documentError || !document) {
    throw new Error('document_not_found');
  }

  // Supprimer le fichier si c'est un fichier uploadthing
  const { error: deleteErrorFile } = await tryCatch(deleteFiles([document.fileUrl]));

  if (deleteErrorFile) {
    throw new Error('delete_file_failed');
  }

  // Supprimer le document
  const { error: deleteError } = await tryCatch(
    db.userDocument.delete({
      where: { id: documentId },
    }),
  );

  if (deleteError) {
    throw new Error('delete_document_failed');
  }

  return true;
}

export async function createUserDocument(
  type: DocumentType,
  fileData: FileUploadResponse,
  profileId?: string,
): Promise<AppUserDocument | null> {
  const uploaded = [];
  const authResult = await checkAuth();

  const { data: document, error: documentError } = await tryCatch(
    db.userDocument.create({
      data: {
        id: fileData.serverData.id,
        type,
        fileUrl: fileData.serverData.fileUrl,
        status: DocumentStatus.PENDING,
        userId: authResult.user.id,
        ...(profileId && {
          ...(typesMap[type] && {
            [typesMap[type]]: {
              connect: {
                id: profileId,
              },
            },
          }),
        }),
      },
    }),
  );

  if (documentError || !document) {
    await deleteFiles(uploaded);
    throw new Error('document_creation_failed');
  }

  return {
    ...document,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: document.metadata as Record<string, any>,
  };
}
