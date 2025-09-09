'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbMenu } from '../layouts/breadcrumb-menu';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-role-data';

// Composant pour l'indicateur LIVE
function LiveIndicator() {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(239, 68, 68, 0.2)',
        color: '#ef4444',
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          background: '#ef4444',
          opacity: isActive ? 1 : 0.3,
          animation: 'live-pulse 1.5s infinite',
        }}
      />
      LIVE
    </div>
  );
}

export function SiteHeader() {
  const { user: currentUserData } = useCurrentUser();
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith(ROUTES.dashboard.base) ||
    pathname.startsWith(ROUTES.user.base) ||
    pathname.startsWith(ROUTES.intel.base);

  return (
    <header className="flex bg-background w-full z-10 h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4 w-full">
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        {isDashboard && <BreadcrumbMenu />}

        <div className="hidden md:flex items-center gap-4 min-w-max">
          <LiveIndicator />
          <div className="flex items-center gap-3 p-2 rounded-xl bg-glass-secondary backdrop-blur-8px border border-glass-secondary">
            <div
              className="size-6 rounded-full flex items-center justify-center text-white font-semibold text-xs bg-accent-intel bg-accent-warning"
              style={{
                background:
                  'linear-gradient(135deg, var(--accent-intel), var(--accent-warning))',
              }}
            >
              {currentUserData.name
                ? currentUserData.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'AG'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold color-primary">
                {currentUserData.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
