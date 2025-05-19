import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbMenu } from '@/components/layouts/breadcrumb-menu';
import { getCurrentUser } from '@/actions/user';
import { NavUser } from '@/components/layouts/nav-user';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const headersList = await headers();
  const isMobile = headersList.get('x-is-mobile') === 'true';
  const pathname = headersList.get('x-current-path') || '/';
  const fallbackUrl = `${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(pathname)}`;

  if (!currentUser) {
    redirect(fallbackUrl);
  }

  return (
    <SidebarProvider>
      <AppSidebar user={currentUser} />
      <SidebarInset className="overflow-hidden w-full flex flex-col relative pb-safe pt-[64px]">
        <header className="fixed top-0 z-50 w-full h-16 bg-card shrink-0 border-b border-border items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex w-full h-full justify-between items-center px-4">
            <div className="flex items-center gap-2 w-full">
              <Button disabled={isMobile} variant="ghost" className="!p-0" asChild>
                <SidebarTrigger />
              </Button>
              <BreadcrumbMenu />
            </div>
            <div className="min-w-max">
              <NavUser user={currentUser} showFeedback={false} />
            </div>
          </div>
        </header>
        <div
          className={cn('container overflow-y-auto relative grow py-4 sm:py-8 min-h-dvh')}
        >
          {children}
        </div>
        <BottomNavigation user={currentUser} />
      </SidebarInset>
    </SidebarProvider>
  );
}
