import { Request, Profile } from '@prisma/client'

export interface DashboardData {
  profile: Profile & {
    completionRate: number
  }
  documents: {
    valid: number
    expired: number
    pending: number
    recent: any[]
  }
  requests: {
    active: number
    completed: number
    recent: Request[]
  }
}

// src/types/stats.ts
export interface UserStats {
  documentsCount: number
  requestsCount: number
  profileCompletionRate: number
}