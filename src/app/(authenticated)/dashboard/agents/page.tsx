import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import AgentsPageClient from './page.client';

export default async function AgentsListingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(ROUTES.auth.login);
  }

  // Vérifier les permissions
  const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'];
  const hasPermission = currentUser.roles.some((role) => allowedRoles.includes(role));

  if (!hasPermission) {
    redirect('/unauthorized');
  }

  return <AgentsPageClient />;
}
