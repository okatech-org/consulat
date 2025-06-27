'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbMenu } from '../layouts/breadcrumb-menu';
import { NotificationBell } from '../notifications/notification-bell';
import { ChatToggle } from '../chat/chat-toggle';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

export function SiteHeader() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith(ROUTES.dashboard.base) || pathname.startsWith(ROUTES.user.base);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {isDashboard && <BreadcrumbMenu />}
      </div>
      <div className="flex w-max items-center gap-4 px-4">
        {!isDashboard && <NotificationBell />}
        {!isDashboard && <ChatToggle />}
      </div>
    </header>
  );
}
