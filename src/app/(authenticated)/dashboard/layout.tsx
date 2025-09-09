import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { ROUTES } from '@/schemas/routes';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteAuthGuard
      roles={['ADMIN', 'AGENT', 'MANAGER', 'SUPER_ADMIN']}
      fallbackUrl={ROUTES.user.base}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background">
          <SiteHeader />
          <div className="pt-14 pb-safe md:pb-6 container">{children}</div>
          <BottomNavigation />
        </SidebarInset>
      </SidebarProvider>
    </RouteAuthGuard>
  );
}
