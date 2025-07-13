'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbMenu } from '../layouts/breadcrumb-menu';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

export function SiteHeader() {
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith(ROUTES.dashboard.base) || pathname.startsWith(ROUTES.user.base);

  return (
    <header className="flex bg-background z-10 h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        {isDashboard && <BreadcrumbMenu />}
      </div>
    </header>
  );
}
