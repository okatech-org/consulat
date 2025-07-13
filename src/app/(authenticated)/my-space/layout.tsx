import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { UserSidebar } from '@/components/layouts/user-sidebar';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { ROUTES } from '@/schemas/routes';

export default async function MySpaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteAuthGuard roles={['USER']} fallbackUrl={ROUTES.auth.login}>
      <SidebarProvider>
        <UserSidebar />
        <SidebarInset className="bg-background overflow-hidden">
          <SiteHeader />
          <div className="flex-1 relative">
            <div className="absolute py-6 pb-safe md:pb-6 inset-0 overflow-y-scroll overflow-x-hidden container">
              {children}
            </div>
          </div>
          <BottomNavigation />
        </SidebarInset>
      </SidebarProvider>
    </RouteAuthGuard>
  );
}
