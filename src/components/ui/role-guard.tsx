'use client'

import { UserRole } from '@prisma/client'
import { useCurrentUser } from '@/hooks/use-current-user'

type Props = {
  children: React.ReactNode
  roles: UserRole[]
}

export function RoleGuard({ roles, children }: Readonly<Props>) {
  const user = useCurrentUser()

  if (!user) {
    return null
  }

  if (!roles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}