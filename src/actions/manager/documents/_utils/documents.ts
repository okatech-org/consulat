// src/actions/manager/documents.ts
import { db } from '@/lib/prisma'
import { DocumentStatus } from '@prisma/client'
import { createNotification } from '@/actions/notifications'

export async function validateDocument(documentId: string, status: DocumentStatus, notes?: string) {
  try {
    const document = await db.userDocument.update({
      where: { id: documentId },
      data: {
        status,
        metadata: {
          validationNotes: notes,
          validatedAt: new Date().toISOString()
        }
      }
    })

    // Envoyer une notification à l'utilisateur
    await createNotification({
      userId: document.userId as string,
      type: status === DocumentStatus.VALIDATED ? 'DOCUMENT_VALIDATED' : 'DOCUMENT_REJECTED',
      title: `Document ${status.toLowerCase()}`,
      message: notes || `Votre document a été ${status.toLowerCase()}`
    })

    return { success: true, data: document }
  } catch (error) {
    console.error('Error validating document:', error)
    return { error: 'Failed to validate document' }
  }
}