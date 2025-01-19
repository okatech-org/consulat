import { db } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  profileId?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        profileId: params.profileId
      }
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}