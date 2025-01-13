import { LayoutDashboard, FileText, Calendar, Users, Settings } from 'lucide-react'
import { NavMain } from "@/components/ui/nav-main"
import { NavUser } from "@/components/ui/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { ROUTES } from '@/schemas/routes'
import { getCurrentUser } from '@/actions/user'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function ManagerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = await getCurrentUser()
  const t = await getTranslations("navigation.manager")
  const userCountry = "France" // TODO: Get from user context

  const navigation = [
    {
      title: t('dashboard'),
      href: ROUTES.manager.dashboard,
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      title: t('requests'),
      href: ROUTES.manager.requests,
      icon: <FileText className="h-4 w-4" />
    },
    {
      title: t('appointments'),
      href: ROUTES.manager.appointments,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      title: t('users'),
      href: ROUTES.manager.users,
      icon: <Users className="h-4 w-4" />
    },
    {
      title: t('settings'),
      href: ROUTES.manager.settings,
      icon: <Settings className="h-4 w-4" />,
    }
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROUTES.base}>
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image
                    src="/images/logo_consulat_ga_512.jpeg"
                    alt="Consulat Logo"
                    width={128}
                    height={128}
                    priority
                    className={"rounded"}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Consulat</span>
                  <span className="truncate text-xs">{userCountry}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navigation} />
      </SidebarContent>

      {user && (
        <SidebarFooter>
          <NavUser
            user={{
              name: user.name ?? '',
              identifier: user?.email ?? '',
              avatar: undefined
            }}
          />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}