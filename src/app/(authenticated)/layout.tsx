import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { MenuBarMobile } from '@/components/ui/menu-bar-mobile'
import AppSidebar from '@/components/layouts/app-sidebar'
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
            <AppSidebar/>
            <main className={'min-h-screen w-screen overflow-auto overflow-x-hidden bg-muted pb-24 pt-4 md:py-6'}>
              {children}
            </main>
            <MenuBarMobile />
          </SidebarProvider>
        </ServerAuthGuard>
      </SessionProvider>
  )
}