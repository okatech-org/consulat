import { RegistrationForm } from '@/components/registration/form'
import { ServerAuthGuard } from '@/components/layouts/server-auth-guard'
import { auth } from '@/auth'
import { SessionProvider } from 'next-auth/react'

export default async function RegistrationPage() {
  const session = await auth()
  return (
    <SessionProvider session={session}>
      <ServerAuthGuard>
        <main className={'min-h-screen w-screen overflow-auto overflow-x-hidden bg-muted py-6 pt-14'}>
          <div className="container flex flex-col py-6">
            <RegistrationForm />
          </div>
        </main>
      </ServerAuthGuard>
    </SessionProvider>
  )
}