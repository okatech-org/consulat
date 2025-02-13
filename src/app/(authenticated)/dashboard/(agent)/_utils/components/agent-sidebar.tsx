import { LayoutDashboard, Calendar, FileText, Users } from 'lucide-react';
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
import { MenuBarMobile } from '@/components/ui/menu-bar-mobile';

export default async function AgentSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = await getCurrentUser();
  const t = await getTranslations('navigation.agent');
  const t_nav = await getTranslations('navigation');
  const userCountry = 'France'; // TODO: Get from user context

  const navigation = [
    {
      title: t('dashboard'),
      href: ROUTES.dashboard.base,
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: t('appointments'),
      href: ROUTES.dashboard.appointments,
      icon: <Calendar className="size-4" />,
    },
    {
      title: t('requests'),
      href: ROUTES.dashboard.requests,
      icon: <FileText className="size-4" />,
    },
    {
      title: t('users'),
      href: ROUTES.dashboard.users,
      icon: <Users className="size-4" />,
    },
  ];

  // Les 2 premiers éléments pour le menu rapide
  const quickMenu = navigation.slice(0, 2);

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
            <SidebarTrigger className="rotate-180 size-6" />
          </SidebarFooter>
        )}
      </Sidebar>

      <MenuBarMobile
        quickMenu={quickMenu}
        extendedMenu={navigation}
        title={t_nav('menu')}
        description={t('dashboard')}
      />
    </>
  );
}
