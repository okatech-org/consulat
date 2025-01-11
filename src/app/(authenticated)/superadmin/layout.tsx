import { auth } from '@/auth'
import { RoleGuard } from '@/components/layouts/role-guard'
import { Unauthorized } from '@/components/layouts/unauthorized'
import { UserRole } from '@prisma/client'
import SuperAdminSidebar from '@/app/(authenticated)/superadmin/_utils/sa-sidebar'
import { MenuBarMobile } from '@/components/ui/menu-bar-mobile'

export default async function SuperAdminLayout({
                                                    children,
                                                  }: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <RoleGuard roles={[UserRole.SUPER_ADMIN]} currentRole={session?.user.role} fallback={<Unauthorized />}>
      <SuperAdminSidebar />
      <main className={'min-h-screen w-screen overflow-auto overflow-x-hidden bg-muted pb-24 pt-4 md:py-6'}>
        {children}
      </main>
      <MenuBarMobile />
    </RoleGuard>
)
}