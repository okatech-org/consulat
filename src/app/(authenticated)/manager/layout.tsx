import { auth } from '@/auth'
import { RoleGuard } from '@/components/layouts/role-guard'
import { Unauthorized } from '@/components/layouts/unauthorized'
import { UserRole } from '@prisma/client'
import ManagerSidebar from './_utils/components/manager-sidebar'

export default async function ManagerLayout({
                                              children,
                                            }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  return (
    <RoleGuard
      roles={[UserRole.ADMIN, UserRole.MANAGER]}
      currentRole={session?.user.role}
      fallback={<Unauthorized />}
    >
      <ManagerSidebar />
      <main className={'min-h-screen w-screen overflow-auto overflow-x-hidden pb-24 pt-4 md:py-6'}>
        {children}
      </main>
    </RoleGuard>
  )
}