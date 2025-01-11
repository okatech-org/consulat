import { UserRole } from '@prisma/client'

interface RoleGuardProps {
  children: React.ReactNode
  roles: UserRole[]
  currentRole?: UserRole
  fallback?: React.ReactNode
}

export function RoleGuard({
                            children,
                            roles,
                            currentRole,
                            fallback
                          }: RoleGuardProps) {

  if (!currentRole || !roles.includes(currentRole)) {
    return fallback || null
  }

  return <>{children}</>
}