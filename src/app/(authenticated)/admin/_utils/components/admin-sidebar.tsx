import { LayoutDashboard, FileText, Settings, Globe, UsersIcon, Calendar, Users } from 'lucide-react';
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
import { getCurrentUser } from '@/actions/user';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { UserNav } from '@/components/layouts/user-nav';
import { ROUTES } from '@/schemas/routes';

export default async function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = await getCurrentUser();
  const t = await getTranslations('navigation.admin');
  const userCountry = 'France';

  const navigation = [
    {
      title: t('dashboard'),
      href: ROUTES.admin.base,
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: t('registrations'),
      href: ROUTES.admin.registrations,
      icon: <UsersIcon className="size-4" />,
    },
    {
      title: t('appointments'),
      href: ROUTES.admin.appointments,
      icon: <Calendar className="size-4" />,
    },
    {
      title: t('users'),
      href: ROUTES.admin.users,
      icon: <Users className="size-4" />,
    },
    {
      title: t('settings'),
      href: ROUTES.admin.settings,
      icon: <Settings className="size-4" />,
    },
  ];

  return (
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
                    className={'rounded object-center'}
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
          <SidebarTrigger className="rotate-180" />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
