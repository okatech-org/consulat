import { Prisma, UserDocument } from '@prisma/client'

export type FullProfile = Prisma.ProfileGetPayload<{
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
}>

export type ProfileKey = keyof FullProfile

export type AppUserDocument = Omit<UserDocument, 'metadata'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>
}