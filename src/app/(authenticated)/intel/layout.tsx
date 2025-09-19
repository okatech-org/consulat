import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { IntelSidebar } from '@/components/ui/intel-sidebar';
import { ROUTES } from '@/schemas/routes';
import { getCurrentUser } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.user.base);
  }

  if (user?.roles?.includes('USER')) {
    redirect(ROUTES.user.base);
  }

  if (!user?.roles?.includes('INTEL_AGENT')) {
    redirect(ROUTES.dashboard.base);
  }
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
