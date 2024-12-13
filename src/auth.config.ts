import type { NextAuthConfig } from 'next-auth'
import { CredentialsAuthProvider } from '@/lib/auth/credentials-provider'
export default {
  trustHost: true,
  providers: [
    CredentialsAuthProvider(),
  ],
} satisfies NextAuthConfig