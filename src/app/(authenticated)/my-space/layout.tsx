'use client';

import { Suspense } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { UserSidebar } from '@/components/layouts/user-sidebar';
import { UserBottomNavigation } from '@/components/ui/user-bottom-navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { UserRole } from '@/convex/lib/constants';
import { PageContainer } from '@/components/layouts/page-container';

/**export const metadata = {
  title: 'Mon Espace Consulaire',
  description: 'Gérez vos demandes et accédez à tous vos services consulaires',
};*/

export default function MySpaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Suspense
        fallback={
          <PageContainer className="h-full w-full flex flex-col gap-2 items-center justify-center">
            <Spinner />
          </PageContainer>
        }
      >
        <Guard>
          <UserSidebar />
          <SidebarInset className="bg-background overflow-hidden">
            <SiteHeader />
            <div className="absolute pt-14 pb-safe md:pb-6! inset-0 overflow-y-scroll overflow-x-hidden container">
              {children}
            </div>
            <UserBottomNavigation />
          </SidebarInset>
        </Guard>
      </Suspense>
    </SidebarProvider>
  );
}

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <PageContainer className="h-full w-full flex flex-col gap-2 items-center justify-center">
        <Spinner />
      </PageContainer>
    );
  }

  if (!user || !user.roles.includes(UserRole.User)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">
            Vous n&apos;êtes pas autorisé à accéder à cette page
          </h1>
          <p className="text-sm text-muted-foreground">
            Veuillez vous connecter pour accéder à cette page
          </p>
          <Link href={ROUTES.base}>
            <Button variant="outline">Retour à l&apos;accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
