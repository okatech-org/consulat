'use server';

import { db } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth/action';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { processFileData } from '@/actions/utils';
import { deleteFiles } from '@/actions/uploads';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';

interface UpdateDocumentData {
  issuedAt?: string;
  expiresAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export async function updateUserDocument(documentId: string, data: UpdateDocumentData) {
  try {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user) {
      return { error: authResult.error };
    }

    // Vérifier que le document appartient à l'utilisateur
    const document = await db.userDocument.findFirst({
      where: {
        id: documentId,
        userId: authResult.user.id,
      },
    });

    if (!document) {
      return { error: 'Document not found' };
    }

    // Mettre à jour le document
    const updatedDocument = await db.userDocument.update({
      where: { id: documentId },
      data: {
        issuedAt: data.issuedAt ? new Date(data.issuedAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        metadata: data.metadata || undefined,
        // Remettre le statut en attente si les dates sont modifiées
        status: data.issuedAt || data.expiresAt ? DocumentStatus.PENDING : undefined,
      },
    });

    revalidatePath(ROUTES.user.profile);
    revalidatePath(ROUTES.user.documents);

    return { success: true, data: updatedDocument };
  } catch (error) {
    console.error('Error updating document:', error);
    return { error: 'Failed to update document' };
  }
}

export async function reuploadUserDocument(documentId: string, file: File) {
  try {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user) {
      return { error: authResult.error };
    }

    // Vérifier que le document appartient à l'utilisateur
    const existingDocument = await db.userDocument.findFirst({
      where: {
        id: documentId,
        userId: authResult.user.id,
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
  try {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user) {
      return { error: authResult.error };
    }

    // Vérifier que le document appartient à l'utilisateur
    const document = await db.userDocument.findFirst({
      where: {
        id: documentId,
        userId: authResult.user.id,
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

    revalidatePath(ROUTES.user.profile);
    revalidatePath(ROUTES.user.documents);

    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { error: 'Failed to delete document' };
  }
}

export async function createUserDocument(
  type: DocumentType,
  file: FormData,
  profileId?: string,
) {
  const uploaded = [];
  try {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user) {
      return { error: authResult.error };
    }

    const uploadedFile = await processFileData(file);

    if (!uploadedFile?.url) {
      throw new Error('Failed to upload file');
    }

    uploaded.push(uploadedFile.url);

    // Créer le document
    const document = await db.userDocument.create({
      data: {
        type,
        fileUrl: uploadedFile.url,
        status: DocumentStatus.PENDING,
        userId: authResult.user.id,
      },
    });

    if (profileId) {
      await connectDocumentToProfile(profileId, document.id, type);
    }

    revalidatePath(ROUTES.user.profile);
    revalidatePath(ROUTES.user.documents);

    return { success: true, data: document };
  } catch (error) {
    await deleteFiles(uploaded);
    console.error('Error creating document:', error);
    return { error: 'Failed to create document' };
  }
}

function connectDocumentToProfile(
  profileId: string,
  documentId: string,
  documentType: DocumentType,
) {
  console.log('Connecting document to profile:', profileId, documentId, documentType);
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
