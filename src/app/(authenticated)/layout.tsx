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
import { env } from '@/lib/env';
import { TeamSwitcher } from '@/components/layouts/team-switcher';
import Image from 'next/image';
import Link from 'next/link';

const logo =
  env.NEXT_PUBLIC_ORG_LOGO ||
  'https://qld7pfnhxe.ufs.sh/f/yMD4lMLsSKvzLokCdOyRlrM9oTwuD7FqvYPzsEJWIQGeR1Vx';

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
      <SidebarInset className="overflow-hidden w-full flex flex-col relative pb-safe pt-16">
        <header className="w-full fixed left-0 right-0 top-0 px-4 z-50 h-16 bg-card shrink-0 border-b border-border items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex gap-4 w-full h-full justify-between items-center overflow-x-hidden">
            <div className="min-w-max">
              <TeamSwitcher
                teams={[
                  {
                    name: <span className="text-sm">Consulat</span>,
                    logo: (
                      <Link
                        href={ROUTES.base}
                        className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-white">
                          <Image
                            src={logo}
                            width={60}
                            height={60}
                            alt="Consulat.ga"
                            className="relative h-7 w-7 rounded-md transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </Link>
                    ),
                    plan: <span className="flex items-center gap-2">France</span>,
                  },
                ]}
              />
            </div>
            <div className="border-l border-border flex items-center gap-1 w-full max-w-[calc(100%-100px)] min-w-0">
              <Button disabled={isMobile} variant="ghost" className="!p-0" asChild>
                <SidebarTrigger />
              </Button>
              <BreadcrumbMenu />
            </div>
            <NavUser user={currentUser} showFeedback={false} />
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
