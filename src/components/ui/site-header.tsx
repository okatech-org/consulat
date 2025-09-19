'use client';

import { BreadcrumbMenu } from '../layouts/breadcrumb-menu';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';

export function SiteHeader() {
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith(ROUTES.dashboard.base) || pathname.startsWith(ROUTES.user.base);

  // Désactiver le breadcrumb automatique sur toutes les pages Intel (nous avons notre propre navigation)
  const isIntelPage = pathname.startsWith(ROUTES.intel.base);
  const showBreadcrumb = isDashboard && !isIntelPage;

  return (
    <header className="flex bg-background w-full z-10 h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4 w-full">
        {showBreadcrumb && <BreadcrumbMenu />}
      </div>
    </header>
  );
}
