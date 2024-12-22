'use server'

import { db } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth/action'
import { Prisma, RequestStatus } from '@prisma/client'

export async function getProfilesForValidation() {
  const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN'])
  if (authResult.error) {
    throw new Error(authResult.error)
  }

  return db.profile.findMany({
    where: {
      status: RequestStatus.SUBMITTED
    },
    include: {
      passport: true,
      birthCertificate: true,
      residencePermit: true,
      addressProof: true,
      address: true,
      addressInGabon: true,
      emergencyContact: true,
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })
}

interface GetProfilesOptions {
  status?: RequestStatus
  search?: string
  orderBy?: {
    field: keyof Prisma.ProfileOrderByWithRelationInput
    direction: 'asc' | 'desc'
  }
}

export async function getProfiles(options?: GetProfilesOptions) {
  const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN'])
  if (authResult.error) {
    throw new Error(authResult.error)
  }

  // Construire la requête where
  const where: Prisma.ProfileWhereInput = {
    ...(options?.status && {
      status: options.status
    }),
    ...(options?.search && {
      OR: [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { nationality: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search, mode: 'insensitive' } },
      ]
    })
  }

  // Construire l'ordre
  const orderBy: Prisma.ProfileOrderByWithRelationInput =
    options?.orderBy
      ? { [options.orderBy.field]: options.orderBy.direction }
      : { updatedAt: 'desc' }

  try {
    const [profiles, total] = await Promise.all([
      db.profile.findMany({
        where,
        include: {
          passport: true,
          birthCertificate: true,
          residencePermit: true,
          addressProof: true,
          address: true,
          addressInGabon: true,
          emergencyContact: true,
        },
        orderBy
      }),
      db.profile.count({ where })
    ])

    return {
      profiles,
      total,
      filters: {
        search: options?.search,
        status: options?.status
      }
    }
  } catch (error) {
    console.error('Error fetching profiles:', error)
    throw new Error('Failed to fetch profiles')
  }
}

export async function getProfileById(id: string) {
  const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN'])
  if (authResult.error) {
    throw new Error(authResult.error)
  }

  return db.profile.findUnique({
    where: { id },
    include: {
      passport: true,
      birthCertificate: true,
      residencePermit: true,
      addressProof: true,
      address: true,
      addressInGabon: true,
      emergencyContact: true,
    }
  })
}