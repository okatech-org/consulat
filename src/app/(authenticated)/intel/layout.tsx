import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { IntelSidebar } from '@/components/ui/intel-sidebar';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { ROUTES } from '@/schemas/routes';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteAuthGuard roles={['INTEL_AGENT']} fallbackUrl={ROUTES.user.base}>
      <SidebarProvider>
        <IntelSidebar />
        <SidebarInset className="bg-background">
          <SiteHeader />
          <div className="pt-14 pb-safe md:pb-6 container">{children}</div>
          <BottomNavigation />
        </SidebarInset>
      </SidebarProvider>
    </RouteAuthGuard>
  );
}
