import { getCurrentUser } from '@/actions/user'
import { db } from '@/lib/prisma'

export async function getUnreadNotificationsCount() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { count: 0 }
    }

    const count = await db.notification.count({
      where: {
        userId: user.id,
        read: false
      }
    })

    return { count }
  } catch (error) {
    console.error('Error fetching notification count:', error)
    return { count: 0 }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    await db.notification.update({
      where: {
        id: notificationId,
        userId: user.id
      },
      data: {
        read: true
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { error: 'Failed to mark notification as read' }
  }
}