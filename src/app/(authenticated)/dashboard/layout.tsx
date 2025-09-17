import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { AppSidebar } from '@/components/ui/app-sidebar';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <SiteHeader />
        <div className="pt-14 pb-safe md:pb-6 container">{children}</div>
        <BottomNavigation />
      </SidebarInset>
    </SidebarProvider>
  );
}
