import { Prisma, UserDocument } from '@prisma/client'

export type FullProfile = Prisma.ProfileGetPayload<{
  include: {
    passport: true,
    birthCertificate: true,
    residencePermit: true,
    addressProof: true,
    address: true,
    addressInGabon: true,
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
    identityPicture: true,
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
}>

export type FullUser = Prisma.UserGetPayload<{
  include: {
    profile: true
    phone: true
  }
}>

export type ProfileKey = keyof FullProfile

export type AppUserDocument = Omit<UserDocument, 'metadata'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null
}