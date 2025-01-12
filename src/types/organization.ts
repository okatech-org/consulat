import { OrganizationType, OrganizationStatus, Country, ConsularService, User } from '@prisma/client'

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  status: OrganizationStatus
  countries: Country[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any
  services?: ConsularService[]
  createdAt: Date
  updatedAt: Date
  User: User | null

  // Relations calculées
  _count?: {
    services: number
  }
}