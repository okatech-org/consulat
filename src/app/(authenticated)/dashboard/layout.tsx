import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { ROUTES } from '@/schemas/routes';
import { auth } from '@/server/auth';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role = session?.user?.role;

  // Pour INTEL_AGENT, on n'affiche pas le chrome par défaut du dashboard
  if (role === 'INTEL_AGENT') {
    return (
      <RouteAuthGuard
        roles={['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN', 'INTEL_AGENT']}
        fallbackUrl={ROUTES.user.base}
      >
        <div className="bg-background min-h-screen">
          {children}
        </div>
      </RouteAuthGuard>
    );
  }

  return (
    <RouteAuthGuard
      roles={['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN', 'INTEL_AGENT']}
      fallbackUrl={ROUTES.user.base}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background">
          <SiteHeader />
          <div className="pt-14 pb-safe md:pb-6 container">
            {children}
          </div>
          <BottomNavigation />
        </SidebarInset>
      </SidebarProvider>
    </RouteAuthGuard>
  );
}
