import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { UserSidebar } from '@/components/layouts/user-sidebar';
import { UserBottomNavigation } from '@/components/ui/user-bottom-navigation';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { ROUTES } from '@/schemas/routes';
import { api } from '@/trpc/server';
import { ProfileProvider } from '@/contexts/profile-context';

export const metadata = {
  title: 'Mon Espace Consulaire',
  description: 'Gérez vos demandes et accédez à tous vos services consulaires',
};

export default async function MySpaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await api.profile.getCurrent();

  return (
    <RouteAuthGuard roles={['USER']} fallbackUrl={ROUTES.auth.login}>
      <ProfileProvider profile={profile}>
        <SidebarProvider>
          <UserSidebar />
          <SidebarInset className="bg-background overflow-hidden">
            <SiteHeader />
            <div className="absolute pt-14 pb-safe md:pb-6! inset-0 overflow-y-scroll overflow-x-hidden container">
              {children}
            </div>
            <UserBottomNavigation />
          </SidebarInset>
        </SidebarProvider>
      </ProfileProvider>
    </RouteAuthGuard>
  );
}
