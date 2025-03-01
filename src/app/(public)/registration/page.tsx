import { RegistrationForm } from '@/app/(public)/registration/_utils/components/registration-form';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { RouteAuthGuard } from '@/components/layouts/route-auth-guard';
import { ROUTES } from '@/schemas/routes';
import { headers } from 'next/headers';
export default async function RegistrationPage() {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get('x-current-path') || '/';
  const fallbackUrl = `${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(pathname)}`;

  return (
    <SessionProvider session={session}>
      <RouteAuthGuard
        fallbackUrl={fallbackUrl}
        roles={[UserRole.USER]}
        currentUserRole={session?.user?.roles[0]}
      >
        <main
          className={
            'min-h-screen w-screen overflow-auto overflow-x-hidden bg-muted py-6 pt-14'
          }
        >
          <div className="container flex flex-col py-6">
            <RegistrationForm />
          </div>
        </main>
      </RouteAuthGuard>
    </SessionProvider>
  );
}
