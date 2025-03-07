import { SessionProvider } from 'next-auth/react';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { ROUTES } from '@/schemas/routes';
import { headers } from 'next/headers';
import { RegistrationForm } from '@/components/registration/registration-form';
import { auth } from '@/auth';
import { getActiveCountries } from '@/actions/countries';

export default async function RegistrationPage() {
  const session = await auth();
  const countries = await getActiveCountries();
  const currentUser = session?.user;
  const headersList = await headers();
  const pathname = headersList.get('x-current-path') || '/';
  const fallbackUrl = `${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(pathname)}`;

  return (
    <SessionProvider session={session}>
      <RouteAuthGuard fallbackUrl={fallbackUrl} user={currentUser}>
        <main
          className={
            'min-h-screen w-screen overflow-auto overflow-x-hidden bg-muted py-6 pt-14'
          }
        >
          <div className="container flex flex-col py-6">
            <RegistrationForm availableCountries={countries} />
          </div>
        </main>
      </RouteAuthGuard>
    </SessionProvider>
  );
}
