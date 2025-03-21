import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbMenu } from '@/components/layouts/breadcrumb-menu';
import { getCurrentUser } from '@/actions/user';
import { NavUser } from '@/components/layouts/nav-user';

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const headersList = await headers();
  const pathname = headersList.get('x-current-path') || '/';
  const fallbackUrl = `${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(pathname)}`;

  if (!currentUser) {
    redirect(fallbackUrl);
  }

  return (
    <SidebarProvider>
      <AppSidebar user={currentUser} />
      <SidebarInset className="overflow-x-hidden w-full">
        <header className="w-full h-14 bg-card shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex h-full justify-between container items-center">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <BreadcrumbMenu />
            </div>
            <NavUser user={currentUser} showFeedback={false} />
          </div>
        </header>
        <div className="container py-4 sm:py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
