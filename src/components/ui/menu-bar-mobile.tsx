'use client'

import { useCurrentUser } from '@/hooks/use-current-user'
import { useTranslations } from 'next-intl'
import { ROUTES } from '@/schemas/routes'
import {
  Calendar,
  FileText, FolderOpen,
  LayoutDashboard,
  Settings,
  User,
  Users,
} from 'lucide-react'
import { UserRole } from '@prisma/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavItem } from '@/types/navigation'
import { cn } from '@/lib/utils'

export function MenuBarMobile() {
  const path = usePathname()
  const user = useCurrentUser()
  const t = useTranslations("common")
  const t_admin= useTranslations('admin')

  const userMenu: NavItem[] = [
    {
      title: t('nav.components'),
      href: ROUTES.profile,
      icon: <User className={"size-5"}/>,
    },
    {
      title: t('nav.procedures'),
      icon: <FileText className={"size-5"}/>,
      href: ROUTES.services
    },
    {
      title: t('nav.appointments'),
      icon: <Calendar className={"size-5"} />,
      href: ROUTES.appointments
    },
    {
      title: t('nav.components'),
      icon: <FolderOpen className={"size-5"} />,
      href: ROUTES.documents
    },
    {
      title: t('nav.settings'),
      icon: <Settings className={"size-5"} />,
      href: ROUTES.settings
    }
  ]

  const adminMenu: NavItem[] = [
    {
      title: t_admin('nav.dashboard'),
      href: ROUTES.admin_dashboard,
      icon: <LayoutDashboard/>,
    },
    {
      title: t_admin('nav.users'),
      href: ROUTES.admin_users,
      icon: <Users/>,
    },
    {
      title: t_admin('nav.requests'),
      href: ROUTES.admin_requests,
      icon: <FileText/>,
    },
    {
      title: t_admin('nav.settings'),
      href: ROUTES.admin_settings,
      icon: <Settings/>,
    }
  ]


  function getCurrentUserMenu(): NavItem[] {
    if (user?.role) {
      return menus[user.role]
    }
    return []
  }

  const menus = {
    [UserRole.USER]: userMenu,
    [UserRole.MANAGER]: adminMenu,
    [UserRole.SUPER_ADMIN]: adminMenu,
    [UserRole.ADMIN]: adminMenu,
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 block md:hidden">
      <nav className="border-t bg-background px-2 py-3">
        <div className="flex items-center justify-around">
          {getCurrentUserMenu().map((item) => {
            const isActive = path === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                <span className="text-xs">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}