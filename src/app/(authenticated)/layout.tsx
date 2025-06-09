import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { SidebarInset } from '@/components/ui/sidebar';
import { getCurrentUser } from '@/actions/user';
import { SiteHeader } from '@/components/ui/site-header';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  return (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset className="overflow-x-hidden pb-16 md:pb-0">
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="container py-4 flex flex-1 flex-col gap-2">{children}</div>
        </div>
        <BottomNavigation user={currentUser} />
      </SidebarInset>
    </>
  );
}
