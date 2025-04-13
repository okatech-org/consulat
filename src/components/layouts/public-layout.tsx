import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: BaseLayoutProps) {
  return (
    <SidebarProvider>
      <PublicHeader />
      <SidebarInset className="w-dvw min-h-dvh relative overflow-x-hidden">
        <main className={'pt-20 flex size-full grow'}>{children}</main>
        <PublicFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
