'use server'

import { db } from '@/lib/prisma'
import { z } from 'zod'
import { EmailStatus } from '@prisma/client'

const emailSchema = z.object({
  email: z.string().email('Email invalide')
})

export async function subscribeToWaitlist(email: string) {
  try {
    // Valider l'email
    const { email: validatedEmail } = emailSchema.parse({ email })

    // Obtenir ou créer la liste d'email principale
    const emailList = await db.emailList.findFirst({
      orderBy: { createdAt: 'asc' }
    }) || await db.emailList.create({
      data: {}
    })

    // Vérifier si l'inscription existe déjà
    const existingSubscription = await db.subscription.findUnique({
      where: { email: validatedEmail }
    })

    if (existingSubscription) {
      if (existingSubscription.status === EmailStatus.UNSUBSCRIBED) {
        // Réactiver l'inscription
        await db.subscription.update({
          where: { email: validatedEmail },
          data: {
            status: EmailStatus.PENDING,
            emailListId: emailList.id
          }
        })
        return { success: true }
      }
      return { error: 'Cet email est déjà inscrit' }
    }

    await db.emailList.update({
      where: { id: emailList.id },
      data: {
        subscribers: {
          create: {
            email: validatedEmail,
            status: EmailStatus.CONFIRMED
          }
        }
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error subscribing to waitlist:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Email invalide' }
    }
    return { error: 'Une erreur est survenue' }
  }
}

// Fonction utilitaire pour obtenir des statistiques
export async function getWaitlistStats() {
  try {
    const stats = await db.subscription.groupBy({
      by: ['status'],
      _count: true
    })

    const totalSubscribers = await db.subscription.count()
    const pendingSubscribers = await db.subscription.count({
      where: { status: EmailStatus.PENDING }
    })
    const confirmedSubscribers = await db.subscription.count({
      where: { status: EmailStatus.CONFIRMED }
    })
    const unsubscribedSubscribers = await db.subscription.count({
      where: { status: EmailStatus.UNSUBSCRIBED }
    })

    return {
      total: totalSubscribers,
      pending: pendingSubscribers,
      confirmed: confirmedSubscribers,
      unsubscribed: unsubscribedSubscribers
    }
  } catch (error) {
    console.error('Error getting waitlist stats:', error)
    throw error
  }
}

// Fonction pour obtenir les inscriptions avec pagination
export async function getSubscriptions(params: {
  page?: number
  limit?: number
  status?: EmailStatus
}) {
  const { page = 1, limit = 10, status } = params
  const skip = (page - 1) * limit

  try {
    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.subscription.count({
        where: status ? { status } : undefined,
      })
    ])

    return {
      subscriptions,
      total,
      pages: Math.ceil(total / limit)
    }
  } catch (error) {
    console.error('Error getting subscriptions:', error)
    throw error
  }
}

// Fonction pour mettre à jour le statut d'une inscription
export async function updateSubscriptionStatus(
  email: string,
  status: EmailStatus
) {
  try {
    await db.subscription.update({
      where: { email },
      data: { status }
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating subscription status:', error)
    return { error: 'Une erreur est survenue' }
  }
}