import {
  LayoutDashboard,
  Globe,
  Building2,
  Settings,
  Users,
  FileText,
  Calendar,
  Bell,
} from 'lucide-react';

import { NavMain } from '@/components/ui/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ROUTES } from '@/schemas/routes';
import { getCurrentUser } from '@/actions/user';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { UserNav } from '@/components/layouts/user-nav';
import { UserRole } from '@prisma/client';
import { ServerRoleGuard } from '@/lib/permissions/utils';

export default async function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = await getCurrentUser();
  const t = await getTranslations('navigation');

  const SuperAdminNavigation = [
    {
      title: t('super_admin.dashboard'),
      href: ROUTES.dashboard.base,
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: t('super_admin.countries'),
      href: ROUTES.sa.countries,
      icon: <Globe className="size-4" />,
    },
    {
      title: t('super_admin.organizations'),
      href: ROUTES.sa.organizations,
      icon: <Building2 className="size-4" />,
    },
    {
      title: t('super_admin.services'),
      href: ROUTES.dashboard.services,
      icon: <Settings className="size-4" />,
    },
    {
      title: t('super_admin.users'),
      href: ROUTES.dashboard.users,
      icon: <Users className="size-4" />,
    },
  ];

  const AdminNavigation = [
    {
      title: t('admin.dashboard'),
      href: ROUTES.dashboard.base,
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: t('admin.registrations'),
      href: ROUTES.dashboard.appointments,
      icon: <Calendar className="size-4" />,
    },
    {
      title: t('admin.requests'),
      href: ROUTES.dashboard.requests,
      icon: <FileText className="size-4" />,
    },
    {
      title: t('admin.settings'),
      href: ROUTES.dashboard.settings,
      icon: <Settings className="size-4" />,
    },
  ];

  const AgentNavigation = [
    {
      title: t('agent.dashboard'),
      href: ROUTES.dashboard.base,
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: t('agent.appointments'),
      href: ROUTES.dashboard.appointments,
      icon: <Calendar className="size-4" />,
    },
    {
      title: t('agent.requests'),
      href: ROUTES.dashboard.requests,
      icon: <FileText className="size-4" />,
    },
    {
      title: t('agent.notifications'),
      href: ROUTES.dashboard.notifications,
      icon: <Bell className="size-4" />,
    },
  ];

  const menus: Record<UserRole, typeof SuperAdminNavigation> = {
    [UserRole.SUPER_ADMIN]: SuperAdminNavigation,
    [UserRole.ADMIN]: AdminNavigation,
    [UserRole.AGENT]: AgentNavigation,
    MANAGER: [],
    USER: [],
  };

  return (
    <>
      <Sidebar collapsible={'icon'} variant="inset" {...props}>
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
                      className={'rounded'}
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Consulat</span>
                    <span className="truncate text-xs">{user?.countryCode}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <ServerRoleGuard roles={[UserRole.SUPER_ADMIN]} user={user}>
            <NavMain items={menus[UserRole.SUPER_ADMIN]} />
          </ServerRoleGuard>
          <ServerRoleGuard roles={[UserRole.ADMIN]} user={user}>
            <NavMain items={menus[UserRole.ADMIN]} />
          </ServerRoleGuard>
          <ServerRoleGuard roles={[UserRole.AGENT]} user={user}>
            <NavMain items={menus[UserRole.AGENT]} />
          </ServerRoleGuard>
        </SidebarContent>
        {user && (
          <SidebarFooter>
            <UserNav user={user} />
            <SidebarTrigger className="rotate-180 !size-8" />
          </SidebarFooter>
        )}
      </Sidebar>
    </>
  );
}
