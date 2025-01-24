import { LayoutDashboard, Globe, Building2, Settings, Users } from 'lucide-react';

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

export default async function SuperAdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = await getCurrentUser();
  const t = await getTranslations('navigation.super_admin');
  const userCountry = 'France';

  const navigation = [
    {
      title: t('dashboard'),
      href: ROUTES.superadmin.base,
      icon: <LayoutDashboard className="size-icon" />,
    },
    {
      title: t('countries'),
      href: ROUTES.superadmin.countries,
      icon: <Globe className="size-icon" />,
    },
    {
      title: t('organizations'),
      href: ROUTES.superadmin.organizations,
      icon: <Building2 className="size-icon" />,
    },
    {
      title: t('services'),
      href: ROUTES.superadmin.services,
      icon: <Settings className="size-icon" />,
    },
    {
      title: t('users'),
      href: ROUTES.superadmin.users,
      icon: <Users className="size-icon" />,
    },
  ];

  return (
    <Sidebar collapsible={'icon'} variant="floating" {...props}>
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
          <UserNav user={user} />
          <SidebarTrigger className="rotate-180 !size-8" />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
