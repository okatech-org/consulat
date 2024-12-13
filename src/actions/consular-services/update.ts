'use server'

import { db } from '@/lib/prisma'
import { ActionResult } from '@/lib/auth/action'
import { checkAuth } from '@/lib/auth/action'
import { ServiceRequestStatus, Prisma } from '@prisma/client'

interface UpdateServiceRequestInput {
  requestId: string
  status?: ServiceRequestStatus
  formData?: Record<string, unknown>
}

function validateJsonData(data: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue
}

export async function updateServiceRequest(
  input: UpdateServiceRequestInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const authResult = await checkAuth()
    if (authResult.error || !authResult.user) return { error: authResult.error }

    const request = await db.serviceRequest.findUnique({
      where: {
        id: input.requestId,
        userId: authResult.user.id
      }
    })

    if (!request) {
      return { error: 'Service request not found' }
    }

    const formDataJson = input.formData ? validateJsonData(input.formData) : undefined

    const updatedRequest = await db.serviceRequest.update({
      where: { id: input.requestId },
      data: {
        status: input.status,
        formData: formDataJson,
        ...(input.status === 'SUBMITTED' && { submittedAt: new Date() }),
        ...(input.status === 'COMPLETED' && { completedAt: new Date() })
      }
    })

    return { data: { id: updatedRequest.id } }
  } catch (error) {
    console.error('Error updating service request:', error)
    return { error: 'Failed to update service request' }
  }
}