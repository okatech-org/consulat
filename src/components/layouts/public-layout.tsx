"use client"

import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/convex/lib/constants';
  
export interface BaseLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: BaseLayoutProps) {
  const { user } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  if (user && pathname === '/') {
    const redirectUrl = getRedirectUrl(user.roles);
    router.push(redirectUrl);
  }
  return (
    <SidebarProvider>
      <PublicHeader />
      <SidebarInset className="w-dvw min-h-dvh relative overflow-x-hidden">
        <main className={'pt-16 flex size-full grow'}>{children}</main>
        <PublicFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}

function getRedirectUrl(roles: UserRole[]) {
  if (roles.includes(UserRole.IntelAgent)) {
    return '/intel';
  }
  if (roles.includes(UserRole.User)) {
    return '/my-space';
  }
  return '/dashboard';
}