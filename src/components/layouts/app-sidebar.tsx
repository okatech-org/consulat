import {
  LifeBuoy,
  Send, Home, FileText, User, Folder, LayoutDashboard, UsersRound,
} from 'lucide-react'

import { NavMain } from "@/components/ui/nav-main"
import { NavSecondary } from "@/components/ui/nav-secondary"
import { NavUser } from "@/components/ui/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ROUTES } from '@/schemas/routes'
import { UserRole } from '@prisma/client'
import { NavItem } from '@/types/navigation'
import { getCurrentUser } from '@/actions/user'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = await getCurrentUser()
  const t_nav = await getTranslations("navigation")
  const t_user = await getTranslations("user")
  const userCountry = "France"

  const userMenu: NavItem[] = [
    {
      title: t_user('nav.dashboard'),
      href: ROUTES.dashboard,
      icon: <Home />,
    },
    {
      title: t_user('nav.procedures'),
      href: ROUTES.services,
      icon: <FileText/>,
      items: [
        {
          title: t_user('nav.services'),
          href: ROUTES.services,
        },
        {
          title: t_user('nav.requests'),
          href: ROUTES.requests,
        }
      ]
    },
    {
      title: t_user('nav.components'),
      href: ROUTES.profile,
      icon: <User />,
    },
    {
      title: t_user('nav.components'),
      href: ROUTES.documents,
      icon: <Folder/>,
    }
  ]

  const adminMenu: NavItem[] = [
    {
      title: t_nav('dashboard'),
      href: ROUTES.admin_dashboard,
      icon: <LayoutDashboard/>,
    },
    {
      title: t_nav('profiles'),
      href: ROUTES.admin_profiles,
      icon: <UsersRound/>,
    }
  ]


  function getCurrentUserMenu(): NavItem[] {
    if (user?.role) {
      return menus[user.role]
    }
    return []
  }

  const navSecondary: NavItem[] = [{
    title: t_nav('assistance'),
    href: ROUTES.base,
    icon: <LifeBuoy />,
    isActive: false,
  },
    {
      title: t_nav('feedback'),
      href: ROUTES.base,
      icon: <Send/>,
      isActive: false,
    }]

  const menus = {
    [UserRole.USER]: userMenu,
    [UserRole.MANAGER]: adminMenu,
    [UserRole.SUPER_ADMIN]: adminMenu,
    [UserRole.ADMIN]: adminMenu,
  }

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
        <NavMain items={getCurrentUserMenu()} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      {user && <SidebarFooter>
        <NavUser user={{
          name: user.name ?? '',
          identifier: user?.email ?? '',
          avatar: undefined
        }} />
      </SidebarFooter>}
    </Sidebar>
  )
}