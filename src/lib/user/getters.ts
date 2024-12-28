import { Profile, User } from '@prisma/client'
import { db } from '@/lib/prisma'
import { FullProfile } from '@/types'

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    return await db.user.findFirst({
      where: {
        email: email,
      },
    })
  } catch {
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    return await db.user.findFirst({
      where: {
        id: id,
      },
    })
  } catch {
    return null
  }
}

export async function getUserByIdWithProfile(id: string): Promise<User & {
  profile: Profile | null
} | null> {
  try {
    return await db.user.findFirst({
      where: {
        id: id,
      },
      include: {
        profile: true,
      }
    })
  } catch {
    return null
  }
}

export async function getUserProfile(id: string) {
  try {
    return await db.profile.findFirst({
      where: {
        userId: id,
      },
    })
  } catch {
    return null
  }
}

export async function getUserFullProfile(id: string): Promise<FullProfile | null> {
  try {
    return db.profile.findFirst({
      where: {
        userId: id,
      },
      include: {
        passport: true,
        birthCertificate: true,
        residencePermit: true,
        addressProof: true,
        address: true,
        addressInGabon: true,
        emergencyContact: true,
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
  } catch(e) {
    console.error(e)
    return null
  }
}