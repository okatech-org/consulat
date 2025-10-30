'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { IntelSidebar } from '@/components/ui/intel-sidebar';
import { ROUTES } from '@/schemas/routes';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/convex/lib/constants';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push(ROUTES.user.base);
      return;
    }

    if (user?.roles?.includes(UserRole.User)) {
      router.push(ROUTES.user.base);
      return;
    }

    if (!user?.roles?.includes(UserRole.IntelAgent)) {
      router.push(ROUTES.dashboard.base);
    }
  }, [user, router]);

  return (
    <SidebarProvider>
      <IntelSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="pb-safe md:pb-6 container">{children}</div>
        <BottomNavigation />
      </SidebarInset>
    </SidebarProvider>
  );
}
