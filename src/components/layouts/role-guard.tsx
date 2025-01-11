'use client'

import { useCurrentUser } from '@/hooks/use-current-user'
import { UserRole } from '@prisma/client'

interface RoleGuardProps {
  children: React.ReactNode
  roles: UserRole[]
  fallback?: React.ReactNode
}

export function RoleGuard({
                            children,
                            roles,
                            fallback
                          }: RoleGuardProps) {
  const user = useCurrentUser()

  if (!user || !roles.includes(user.role)) {
    return fallback || null
  }

  return <>{children}</>
}