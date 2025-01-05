'use server'

import { db } from '@/lib/prisma'
import { checkAuth } from '@/lib/auth/action'

export interface DashboardStatsValues {
  totalProfiles: number
  activeProfiles: number
  pendingReviews: number
  validatedProfiles: number
  expiredDocuments: number
  expiringSoon: number
  reviewsTrend: number
  validationTrend: number
  recentActivities: Array<{
    id: string
    type: 'PROFILE_CREATED' | 'PROFILE_UPDATED' | 'PROFILE_VALIDATED' | 'DOCUMENT_UPLOADED'
    user: {
      name: string | null
      image: string | null
    }
    createdAt: Date
    metadata?: {
      profileId?: string
      documentType?: string
    }
  }>
  pendingTasks: Array<{
    id: string
    type: 'PROFILE_REVIEW' | 'DOCUMENT_VALIDATION'
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    title: string
    description: string
    createdAt: Date
  }>
}

export async function getDashboardStats(): Promise<DashboardStatsValues | null> {
  try {
    const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN', 'MANAGER'])
    if (authResult.error) {
      return null
    }

    // Récupérer toutes les statistiques en parallèle
    const [
      totalProfiles,
      activeProfiles,
      pendingReviews,
      validatedProfiles,
      expiredDocuments,
      expiringSoon,
      recentActivities,
      pendingTasks
    ] = await Promise.all([
      // Statistiques générales
      db.profile.count(),
      db.profile.count({
        where: { status: 'VALIDATED' }
      }),
      db.profile.count({
        where: { status: 'SUBMITTED' }
      }),
      db.profile.count({
        where: { status: 'VALIDATED' }
      }),
      db.userDocument.count({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      }),
      db.userDocument.count({
        where: {
          expiresAt: {
            gt: new Date(),
            lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
          }
        }
      }),

      // Activités récentes
      db.profile.findMany({
        where: {
          updatedAt: {
            gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
          }
        },
        take: 5,
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }),

      // Tâches en attente
      db.profile.findMany({
        where: {
          status: 'SUBMITTED'
        },
        take: 5,
        orderBy: {
          submittedAt: 'asc'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          submittedAt: true
        }
      })
    ])

    // Transformer les profils en tâches
    const formattedTasks = pendingTasks.map(profile => ({
      id: profile.id,
      type: 'PROFILE_REVIEW' as const,
      priority: 'HIGH' as const,
      title: `Revue du profil de ${profile.firstName} ${profile.lastName}`,
      description: 'Profil en attente de validation',
      createdAt: profile.submittedAt || new Date()
    }))

    // Transformer les profils en activités
    const formattedActivities = recentActivities.map(profile => ({
      id: profile.id,
      type: 'PROFILE_UPDATED' as const,
      user: profile.user,
      createdAt: profile.updatedAt,
      metadata: {
        profileId: profile.id
      }
    }))

    return {
      totalProfiles,
      activeProfiles,
      pendingReviews,
      validatedProfiles,
      expiredDocuments,
      expiringSoon,
      reviewsTrend: -5, // À calculer selon vos besoins
      validationTrend: 10, // À calculer selon vos besoins
      recentActivities: formattedActivities,
      pendingTasks: formattedTasks
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
}