import { Prisma } from "@prisma/client"

export type FullProfile = Prisma.ProfileGetPayload<{
  include: {
    passport: true
    birthCertificate: true
    residencePermit: true
    address: true
    addressProof: true
    addressInGabon: true
    emergencyContact: true
  }
}>