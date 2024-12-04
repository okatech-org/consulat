'use server'

import { db } from '@/lib/prisma'
import { ActionResult } from '@/lib/auth/action'
import { checkAuth } from '@/lib/auth/action'
import { ServiceRequestStatus } from '@prisma/client'

interface SubmitServiceRequestInput {
  serviceId: string
  formData: Record<string, unknown>
  documents: Record<string, string> // URLs des documents uploadés
}

export async function submitServiceRequest(
  input: SubmitServiceRequestInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const authResult = await checkAuth()
    if (authResult.error || !authResult.user) {
      return { error: authResult.error }
    }

    // Récupérer le consulat de l'utilisateur
    const user = await db.user.findUnique({
      where: { id: authResult.user.id },
      include: { consulate: true }
    })

    if (!user?.consulate) {
      return { error: 'User has no assigned consulate' }
    }

    // Créer la demande
    const request = await db.serviceRequest.create({
      data: {
        serviceId: input.serviceId,
        userId: authResult.user.id,
        consulateId: user.consulate.id,
        status: ServiceRequestStatus.SUBMITTED,
        formData: input.formData,
        submittedAt: new Date(),
        // Créer les documents associés
        documents: {
          create: Object.entries(input.documents).map(([type, url]) => ({
            type: type as any,
            fileUrl: url,
            userId: authResult.user.id
          }))
        }
      }
    })

    return { data: { id: request.id } }
  } catch (error) {
    console.error('Error submitting service request:', error)
    return { error: 'Failed to submit service request' }
  }
}