import { getCurrentUser } from '@/actions/user';
import { LoginForm } from '../_utils/login-form';
import { redirect } from 'next/navigation';
import { hasAnyRole } from '@/lib/permissions/utils';
import { ROUTES } from '@/schemas/routes';

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    const isAdmin = hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER']);
    if (isAdmin) {
      redirect(ROUTES.dashboard.base);
    }

    if (hasAnyRole(user, ['USER'])) {
      redirect(ROUTES.user.base);
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
