'use server'

import { db } from '@/lib/prisma'
import { ActionResult } from '@/lib/auth/action'
import { checkAuth } from '@/lib/auth/action'

export async function deleteServiceRequest(
  requestId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const authResult = await checkAuth()
    if (authResult.error || !authResult.user) return { error: authResult.error }

    const request = await db.serviceRequest.findUnique({
      where: {
        id: requestId,
        userId: authResult.user.id
      }
    })

    if (!request) {
      return { error: 'Service request not found' }
    }

    if (request.status !== 'DRAFT') {
      return { error: 'Cannot delete submitted service request' }
    }

    await db.serviceRequest.delete({
      where: { id: requestId }
    })

    return { data: { success: true } }
  } catch (error) {
    console.error('Error deleting service request:', error)
    return { error: 'Failed to delete service request' }
  }
}