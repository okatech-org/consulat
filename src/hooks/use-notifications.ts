// src/hooks/use-notifications.ts

import { useEffect, useState } from 'react'
import { getUnreadNotificationsCount, markNotificationAsRead } from '@/actions/notifications'

export function useNotifications() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCount = async () => {
      setIsLoading(true)
      try {
        const result = await getUnreadNotificationsCount()
        setCount(result.count)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (notificationId: string) => {
    const result = await markNotificationAsRead(notificationId)
    if (result.success) {
      setCount(prev => Math.max(0, prev - 1))
    }
    return result
  }

  return {
    unreadCount: count,
    isLoading,
    markAsRead
  }
}