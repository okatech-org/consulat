import { db } from '@/lib/prisma'
import { FullProfile, FullUser } from '@/types'

export async function getUserById(id: string): Promise<FullUser | null> {
  try {
    return await db.user.findFirst({
      where: {
        id: id,
      },
      include: {
        phone: true,
        profile: true
      }
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
        identityPicture: true,
        emergencyContact: {
          include: {
            phone: true
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
  } catch(e) {
    console.error(e)
    return null
  }
}