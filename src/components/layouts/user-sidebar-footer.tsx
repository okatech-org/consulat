'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useTranslations } from 'next-intl';

export function UserSidebarFooter() {
  const t = useTranslations('navigation');
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleLogout}>
            <LogOut className="size-4" />
            <span>{t('logout')}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
