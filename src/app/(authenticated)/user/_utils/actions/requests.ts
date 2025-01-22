import { db } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth/action'

export async function getRequests(options?: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const authResult = await checkAuth(['MANAGER'])
  if (authResult.error) return null

  // Récupérer les demandes avec pagination et filtres
  return await db.serviceRequest.findMany({
    where: {
      // Ajouter les filtres
    },
    include: {
      user: true,
      service: true,
      documents: true
    },
    take: options?.limit || 10,
    skip: ((options?.page || 1) - 1) * (options?.limit || 10)
  })
}

export async function validateRequest(requestId: string, status: 'APPROVED' | 'REJECTED') {
  const authResult = await checkAuth(['MANAGER'])
  if (authResult.error) return null

  // Mettre à jour le statut de la demande
  return await db.serviceRequest.update({
    where: { id: requestId },
    data: {
      status
    }
  })
}