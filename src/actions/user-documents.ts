'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { processFileData } from '@/actions/utils';
import { deleteFiles } from '@/actions/uploads';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';
import { tryCatch } from '@/lib/utils';
import { AppUserDocument } from '@/types';

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

export async function reuploadUserDocument(documentId: string, file: File) {
  try {
    await checkAuth();

    // Vérifier que le document appartient à l'utilisateur
    const existingDocument = await db.userDocument.findFirst({
      where: {
        id: documentId,
      },
    });

    if (!existingDocument) {
      return { error: 'Document not found' };
    }

    // Upload du nouveau fichier
    const formData = new FormData();
    formData.append('files', file);
    const uploadedFile = await processFileData(formData);

    if (!uploadedFile?.url) {
      throw new Error('Failed to upload file');
    }

    // Supprimer l'ancien fichier si c'est un fichier uploadthing
    if (existingDocument.fileUrl.includes('utfs.io')) {
      const key = existingDocument.fileUrl.split('/').pop();
      if (key) {
        await deleteFiles([key]);
      }
    }

    // Mettre à jour le document
    const updatedDocument = await db.userDocument.update({
      where: { id: documentId },
      data: {
        fileUrl: uploadedFile.url,
        status: DocumentStatus.PENDING,
      },
    });

    revalidatePath(ROUTES.user.profile);
    revalidatePath(ROUTES.user.documents);

    return { success: true, data: updatedDocument };
  } catch (error) {
    console.error('Error reuploading document:', error);
    return { error: 'Failed to reupload document' };
  }
}

export async function deleteUserDocument(documentId: string) {
  await checkAuth();

  // Vérifier que le document appartient à l'utilisateur
  // TODO: Vérifier que le document appartient à l'utilisateur
  const document = await db.userDocument.findFirst({
    where: {
      id: documentId,
    },
  });

  if (!document) {
    return { error: 'Document not found' };
  }

  // Supprimer le fichier si c'est un fichier uploadthing
  await deleteFiles([document.fileUrl]);

  // Supprimer le document
  await db.userDocument.delete({
    where: { id: documentId },
  });

  return true;
}

export async function createUserDocument(
  type: DocumentType,
  file: FormData,
  profileId?: string,
): Promise<AppUserDocument | null> {
  const uploaded = [];
  const authResult = await checkAuth();

  const { data: uploadedFile, error: uploadError } = await tryCatch(
    processFileData(file),
  );

  if (uploadError || !uploadedFile?.url) {
    throw new Error('upload_failed');
  }

  uploaded.push(uploadedFile.url);

  const { data: document, error: documentError } = await tryCatch(
    db.userDocument.create({
      data: {
        type,
        fileUrl: uploadedFile.url,
        status: DocumentStatus.PENDING,
        userId: authResult.user.id,
      },
    }),
  );

  if (documentError || !document) {
    await deleteFiles(uploaded);
    throw new Error('document_creation_failed');
  }

  if (profileId) {
    await connectDocumentToProfile(profileId, document.id, type);
  }

  return {
    ...document,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: document.metadata as Record<string, any>,
  };
}

function connectDocumentToProfile(
  profileId: string,
  documentId: string,
  documentType: DocumentType,
) {
  switch (documentType) {
    case DocumentType.PASSPORT:
      return db.profile.update({
        where: { id: profileId },
        data: { passportId: documentId },
      });
    case DocumentType.BIRTH_CERTIFICATE:
      return db.profile.update({
        where: { id: profileId },
        data: { birthCertificateId: documentId },
      });
    case DocumentType.RESIDENCE_PERMIT:
      return db.profile.update({
        where: { id: profileId },
        data: { residencePermitId: documentId },
      });
    case DocumentType.PROOF_OF_ADDRESS:
      return db.profile.update({
        where: { id: profileId },
        data: { addressProofId: documentId },
      });
    case DocumentType.IDENTITY_PHOTO:
      return db.profile.update({
        where: { id: profileId },
        data: { identityPictureId: documentId },
      });
    default:
      return null;
  }
}
