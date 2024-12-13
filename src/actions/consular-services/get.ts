'use server'

import { db } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth/action'
import { ConsularServiceType } from '@prisma/client'

export async function getAvailableServices(type?: ConsularServiceType) {
  try {
    const authResult = await checkAuth()
    if (authResult.error) {
      throw new Error(authResult.error)
    }

    const where = {
      isActive: true,
      ...(type && { type })
    }

    return await db.consularService.findMany({
      where,
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    throw new Error('Failed to fetch services')
  }
}

export async function getServiceRequest(requestId: string) {
  try {
    const authResult = await checkAuth()
    if (authResult.error || !authResult.user) return { error: authResult.error }

    const request = await db.serviceRequest.findUnique({
      where: {
        id: requestId,
        userId: authResult.user.id
      },
      include: {
        service: {
          include: {
            steps: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        documents: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!request) {
      throw new Error('Service request not found')
    }

    return request
  } catch (error) {
    console.error('Error fetching service request:', error)
    throw new Error('Failed to fetch service request')
  }
}

export async function getServiceById(serviceId: string) {
  try {
    return await db.consularService.findUnique({
      where: {
        id: serviceId
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching service:', error)
    throw new Error('Failed to fetch service')
  }
}