'use server'

import { db } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth/action'
import { UserRole } from '@prisma/client'

export async function getDashboardStats() {
  const authResult = await checkAuth([UserRole.MANAGER])
  if (authResult.error) return { error: authResult.error }

  try {
    const [pending, processing, completed] = await Promise.all([
      db.serviceRequest.count({
        where: { status: 'SUBMITTED' }
      }),
      db.serviceRequest.count({
        where: { status: 'IN_REVIEW' }
      }),
      db.serviceRequest.count({
        where: { status: 'COMPLETED' }
      })
    ])

    return {
      data: {
        pending,
        processing,
        completed
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { error: 'Failed to fetch dashboard stats' }
  }
}

export async function getQueueItems() {
  const authResult = await checkAuth([UserRole.MANAGER])
  if (authResult.error) return { error: authResult.error }

  try {
    const requests = await db.serviceRequest.findMany({
      where: {
        status: 'SUBMITTED',
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return { data: requests }
  } catch (error) {
    console.error('Error fetching queue items:', error)
    return { error: 'Failed to fetch queue items' }
  }
}

export async function getImportantAlerts() {
  const authResult = await checkAuth([UserRole.MANAGER])
  if (authResult.error) return { error: authResult.error }

  try {
    // TODO: Implémenter la logique des alertes
    // Par exemple : demandes urgentes, documents expirants, etc.
    return { data: [] }
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return { error: 'Failed to fetch alerts' }
  }
}