'use server'

import { db } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth/action'
import { Prisma, Profile, RequestStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/schemas/routes'
import { FullProfile } from '@/types'

interface GetProfilesOptions {
  status?: RequestStatus
  search?: string
  orderBy?: {
    field: keyof Prisma.ProfileOrderByWithRelationInput
    direction: 'asc' | 'desc'
  }
}

export interface ProfilesResult {
  profiles: Profile[]
  total: number
  filters: {
    search?: string
    status?: RequestStatus
  }
}

export async function getProfiles(options?: GetProfilesOptions): Promise<ProfilesResult> {
  const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])
  if (authResult.error) {
    throw new Error(authResult.error)
  }

  // Construire la requête where
  const where: Prisma.ProfileWhereInput = {
    ...(options?.status && { status: options.status }),
    ...(options?.search && {
      OR: [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { nationality: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
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

export async function getProfileById(id: string): Promise<FullProfile | null> {
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
      identityPicture: true,
      emergencyContact: {
        include: {
          phone: {
            select: {
              number: true,
              countryCode: true
            }
          }
        }
      },
      phone: true,
      notes: {
        include: {
          author: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }

    }
  })
}

interface ValidateProfileInput {
  profileId: string
  status: RequestStatus
  notes?: string
}

export async function validateProfile(input: ValidateProfileInput) {
  try {
    const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN'])
    if (authResult.error || !authResult.user) {
      return { error: authResult.error }
    }

    // Vérifier que le profil existe
    const profile = await db.profile.findUnique({
      where: { id: input.profileId }
    })

    if (!profile) {
      return { error: 'Profile not found' }
    }

    // Mettre à jour le profil
    const updatedProfile = await db.profile.update({
      where: { id: input.profileId },
      data: {
        status: input.status,
        validationNotes: input.notes,
        validatedAt: new Date(),
        validatedBy: authResult.user.id
      },
    })

    // Revalider les pages concernées
    revalidatePath(ROUTES.admin_profiles)
    revalidatePath(`${ROUTES.admin_profiles}/${profile.id}/review`)

    return { success: true, data: updatedProfile }
  } catch (error) {
    console.error('Error validating profile:', error)
    return { error: 'Failed to validate profile' }
  }
}