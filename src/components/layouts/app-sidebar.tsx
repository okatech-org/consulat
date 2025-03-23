'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NavMain } from '@/components/layouts/nav-main';
import { NavUser } from '@/components/layouts/nav-user';
import { TeamSwitcher } from '@/components/layouts/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import { CountryCode } from '@/lib/autocomplete-datas';
import { SessionUser } from '@/types/user';
import { useNavigation } from '@/hooks/use-navigation';

const logo =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  'https://qld7pfnhxe.ufs.sh/f/yMD4lMLsSKvzLokCdOyRlrM9oTwuD7FqvYPzsEJWIQGeR1Vx';

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: SessionUser;
}) {
  const t_countries = useTranslations('countries');
  const { menu } = useNavigation(user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-border">
        <TeamSwitcher
          teams={[
            {
              name: (
                <span className="flex items-center gap-2">
                  <span>Consulat</span>
                </span>
              ),
              logo: (
                <Link
                  href={ROUTES.base}
                  className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-white">
                    <Image
                      src={logo}
                      width={60}
                      height={60}
                      alt="Consulat.ga"
                      className="relative h-7 w-7 rounded-md transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
              ),
              plan: user.countryCode && (
                <span className="flex items-center gap-2">
                  {user.countryCode && t_countries(user.countryCode as CountryCode)}
                </span>
              ),
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menu} />
      </SidebarContent>
      <SidebarFooter className="py-6">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
