import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { SidebarInset } from '@/components/ui/sidebar';
import { getCurrentUser } from '@/actions/user';
import { SiteHeader } from '@/components/site-header';
import { AppSidebar } from '@/components/ui/app-sidebar';

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
    <>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="container py-4 flex flex-1 flex-col gap-2">{children}</div>
        </div>
      </SidebarInset>
    </>
  );
}
