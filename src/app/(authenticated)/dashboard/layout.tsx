import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { getCurrentUser } from '@/lib/auth/utils';
import { ROUTES } from '@/schemas/routes';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.auth.login);
  }

  if (user?.roles?.includes('INTEL_AGENT')) {
    redirect(ROUTES.intel.base);
  }

  if (user?.roles?.includes('USER')) {
    redirect(ROUTES.user.base);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background overflow-hidden">
        <SiteHeader />
        <div className="absolute pt-14 pb-safe md:pb-6! inset-0 overflow-y-scroll overflow-x-hidden container">
          {children}
        </div>
        <BottomNavigation />
      </SidebarInset>
    </SidebarProvider>
  );
}
