import { ReactNode } from 'react';

import { PublicHeader } from '@/components/public/header';

import { PublicFooter } from '@/components/public/footer';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function ListingLayout({ children }: { children: ReactNode }) {
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
