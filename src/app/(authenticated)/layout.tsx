import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbMenu } from '@/components/layouts/breadcrumb-menu';
import { NavUser } from '@/components/layouts/nav-user';
import { checkUserExist, getCurrentUser } from '@/actions/user';
import { signOut } from 'next-auth/react';
import { SessionUser } from '@/types/user';

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const isUserExists = await checkUserExist(currentUser?.id ?? '');
  const headersList = await headers();
  const pathname = headersList.get('x-current-path') || '/';
  const fallbackUrl = `${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(pathname)}`;

  if (!currentUser) {
    redirect(fallbackUrl);
  }

  if (!isUserExists) {
    await signOut({ redirectTo: fallbackUrl ?? ROUTES.auth.login });
  }

  return (
    <SidebarProvider>
      <AppSidebar user={currentUser} />
      <SidebarInset className="w-dvwrelative overflow-x-hidden">
        <header className="flex h-12 mb-4 bg-card shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex justify-between items-center border-b border-b-1 h-12 bg-card gap-2 px-4 min-w-full z-[9] fixed">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <BreadcrumbMenu />
            </div>
            <div className="flex items-center gap-2">
              <NavUser user={currentUser as SessionUser} />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
