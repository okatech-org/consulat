import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ServerAuthGuard } from '@/components/layouts/server-auth-guard'

export default async function AuthenticatedLayout({
                                                    children,
                                                  }: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
      <SessionProvider session={session}>
        <ServerAuthGuard>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ServerAuthGuard>
      </SessionProvider>
  )
}