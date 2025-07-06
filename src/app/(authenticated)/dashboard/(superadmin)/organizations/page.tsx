import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import OrganizationsPageClient from './page.client';

export default async function OrganizationsPage() {
  // Vérifier l'authentification et les permissions
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.auth.login);
  }

  if (!user.roles?.includes('SUPER_ADMIN')) {
    redirect(ROUTES.dashboard.base);
  }

  // Déléguer le rendu à la version client
  return <OrganizationsPageClient />;
}
