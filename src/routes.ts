import { ROUTES } from '@/schemas/routes'
import { UserRole } from '@prisma/client'

export const publicRoutes = [
  ROUTES.base,
  ROUTES.privacy_policy,
  ROUTES.terms,
  ROUTES.registration,
] as const

export const authRoutes = [
  ROUTES.login,
  ROUTES.auth_error,
] as const

export const apiAuthPrefix = '/api/auth'

export const DEFAULT_AUTH_REDIRECT = ROUTES.dashboard

export const roleRoutes = [
  {
    path: ROUTES.admin,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
  },
  {
    path: ROUTES.dashboard,
    roles: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]
  }
] as const