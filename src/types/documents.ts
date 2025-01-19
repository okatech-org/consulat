import { DocumentStatus } from '@prisma/client'

export interface UserDocumentUpdate {
  issuedAt?: Date
  expiresAt?: Date
  status?: DocumentStatus
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
}

export interface UserDocumentActions {
  onUpload: (file: File) => Promise<void>
  onDelete: () => Promise<void>
  onUpdate: (data: UserDocumentUpdate) => Promise<void>
}