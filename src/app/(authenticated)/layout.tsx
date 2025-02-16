import { auth } from '@/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { getUserById } from '@/lib/user/getters';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import { BreadcrumbMenu } from '@/components/layouts/breadcrumb-menu';

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const dbUser = await getUserById(session?.user?.id);
  const headersList = await headers();
  const pathname = headersList.get('x-current-path') || '/';
  const fallbackUrl = `${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(pathname)}`;

  if (!session?.user) {
    redirect(fallbackUrl);
  }

  if (!dbUser) {
    redirect(fallbackUrl);
  }

  return (
    <SidebarProvider>
      <AppSidebar user={dbUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <BreadcrumbMenu />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
