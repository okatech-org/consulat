import { type Provider } from 'next-auth/providers'
import { db } from '@/lib/prisma'
import { validateOTP } from '@/lib/user/otp'
import { extractNumber } from '@/lib/utils'

export interface AuthPayload {
  identifier: string
  type: 'EMAIL' | 'PHONE'
  otp: string
  callbackUrl?: string
}

export const CredentialsAuthProvider = (): Provider => ({
  id: 'credentials',
  name: 'Credentials',
  type: 'credentials',
  credentials: {
    identifier: { type: 'text' },
    type: { type: 'text' },
    otp: { type: 'text' },
    callbackUrl: { type: 'text' },
  },
  async authorize(credentials) {
    try {
      if (!credentials) throw new Error('No credentials')

      const { identifier, type, otp } = credentials as unknown as AuthPayload

      if (!identifier || !otp) {
        throw new Error('Missing credentials')
      }

      const isValid = await validateOTP({
        identifier,
        otp,
        type,
      })

      if (!isValid) {
        return null
      }

      // Trouver ou créer l'utilisateur
      const userWhere = type === 'EMAIL'
        ? { email: identifier }
        : { phone: extractNumber(identifier) }

      let user = await db.user.findFirst({
        where: userWhere
      })

      if (!user) {
        user = await db.user.create({
          data: {
            ...(type === 'EMAIL'
              ? { email: identifier }
              : { phone: {
                create: extractNumber(identifier)
                }
            }),
            emailVerified: type === 'EMAIL' ? new Date() : null,
            phoneVerified: type === 'PHONE' ? new Date() : null,
          },
        })
      }

      return user
    } catch (error) {
      console.error('Auth Error:', error)
      return null
    }
  }
})