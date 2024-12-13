import { Prisma, DocumentType } from '@prisma/client'

export type ConsulateWithRelations = Prisma.ConsulateGetPayload<{
  include: {
    users: true
    countries: true
    requests: true
    address: true
  }
}>

export interface ConsulateStats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  averageProcessingTime: number
  requestsByType: Record<DocumentType, number>
}