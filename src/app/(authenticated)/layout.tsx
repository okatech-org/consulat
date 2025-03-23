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
      <SidebarInset className="overflow-x-hidden w-full">
        <header className="w-full h-14 bg-card shrink-0 border-b border-border items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex h-full justify-between container items-center">
            <div className="flex items-center gap-2 w-full max-w-[calc(100%-100px)]">
              <Button disabled={isMobile} variant="ghost" className="!p-0" asChild>
                <SidebarTrigger />
              </Button>
              <BreadcrumbMenu />
            </div>
            <NavUser user={currentUser} showFeedback={false} />
          </div>
        </header>
        <div className={cn('container py-4 sm:py-8', isMobile && 'pb-safe')}>
          {children}
        </div>
        <BottomNavigation user={currentUser} />
      </SidebarInset>
    </SidebarProvider>
  );
}
