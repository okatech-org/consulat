import { auth } from "@/auth"
import { UserRole } from "@prisma/client"
import { getTranslations } from 'next-intl/server'

export type ActionResult<T> = {
  data?: T
  error?: string
}

// Type utilitaire pour les actions protégées
export type ProtectedAction<TInput, TOutput> = (
  input: TInput
) => Promise<ActionResult<TOutput>>

export async function withAuth<TInput, TOutput>(
  action: (input: TInput) => Promise<TOutput>,
  roles?: UserRole[]
): Promise<ProtectedAction<TInput, TOutput>> {
  const t = await getTranslations('errors')

  return async (input: TInput) => {
    try {
      const session = await auth()

      if (!session?.user) {
        return {
          error: t('auth.unauthorized')
        }
      }

      if (roles && !roles.includes(session.user.role)) {
        return {
          error: t('auth.forbidden')
        }
      }

      const result = await action(input)
      return { data: result }
    } catch (error) {
      console.error("Action error:", error)
      return {
        error: t('common.unknown_error')
      }
    }
  }
}

// Helper function pour la vérification d'auth
export async function checkAuth(roles?: UserRole[]) {
  const t = await getTranslations('errors')
  const session = await auth()

  if (!session?.user) {
    return {
      error: t('auth.unauthorized')
    }
  }

  if (roles && !roles.includes(session.user.role)) {
    return {
      error: t('auth.forbidden')
    }
  }

  return { user: session.user }
}