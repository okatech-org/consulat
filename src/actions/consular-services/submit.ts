'use server'

import { db } from '@/lib/prisma'
import { ActionResult } from '@/lib/auth/action'
import { checkAuth } from '@/lib/auth/action'
import { DocumentStatus, Prisma, ServiceRequestStatus, DocumentType } from '@prisma/client'
import { processFileData } from '@/actions/utils'
import { deleteFiles } from '@/actions/uploads'

interface SubmitServiceRequestInput {
  requiredDocuments: DocumentType[]
  serviceId: string
  consulateId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stepsData: Record<string, any>
  profileDocuments?: string[]
  documents?: FormData
  appointment?: {
    date: string
    time: string
    duration: number
  }
}

export async function submitServiceRequest(
  input: SubmitServiceRequestInput
): Promise<ActionResult<{ id: string }>> {
  const uploadedFiles = []

  try {
    const authResult = await checkAuth()
    if (authResult.error || !authResult.user) {
      return { error: authResult.error }
    }
    const documentsToUpload: { type: DocumentType; file: FormDataEntryValue }[] = []
    const toCreateDocuments = []

    if (input.documents) {
      input.requiredDocuments.forEach((docType) => {
        const file = input.documents?.get(docType as unknown as string)
        if (file) {
          documentsToUpload.push({ type: docType, file })
        }
      })
    }

    for (const document of documentsToUpload) {
      const formData = new FormData()
      formData.append('files', document.file)
      const uploadedFile = await processFileData(formData)

      if (uploadedFile?.url) {
        uploadedFiles.push(uploadedFile.key)
        toCreateDocuments.push({
          type: document.type,
          url: uploadedFile.url
        })
      }
    }

    const formData: Prisma.InputJsonValue = JSON.parse(JSON.stringify(input.stepsData));

    const request = await db.serviceRequest.create({
      data: {
        serviceId: input.serviceId,
        userId: authResult.user.id,
        consulateId: input.consulateId,
        status: ServiceRequestStatus.SUBMITTED,
        formData,
        submittedAt: new Date(),
        documents: {
          connect: input.profileDocuments?.map((id) => ({ id })),
          create: toCreateDocuments.map((doc) => ({
            type: doc.type,
            status: DocumentStatus.PENDING,
            fileUrl: doc.url
          }))
        },
        // Créer le rendez-vous si nécessaire
        ...(input.appointment && {
          appointment: {
            create: {
              date: new Date(`${input.appointment.date}`),
              duration: input.appointment.duration,
              userId: authResult.user.id,
              consulateId: input.consulateId,
              type: 'DOCUMENT_SUBMISSION',
              status: "CONFIRMED"
            }
          }
        })
      }
    })

    return { data: { id: request.id } }

  } catch (error) {

    await deleteFiles(uploadedFiles)
    console.error('Error submitting service request:', error)
    return { error: 'Failed to submit service request' }
  }
}