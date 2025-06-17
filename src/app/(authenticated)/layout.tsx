import { SidebarInset } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-background overflow-hidden">
        <SiteHeader />
        <div className="flex-1 relative">
          <div className="absolute py-6 pb-safe md:pb-6 inset-0 overflow-y-scroll container">
            {children}
          </div>
        </div>
        <BottomNavigation />
      </SidebarInset>
    </>
  );
}
