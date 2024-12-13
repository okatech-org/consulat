'use server'

import { db } from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user'

export async function getUserServiceRequests() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    return await db.serviceRequest.findMany({
      where: {
        userId: user.id,
      },
      include: {
        service: true,
        appointment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  } catch (error) {
    console.error('Error fetching service requests:', error)
    return []
  }
}