import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import ChildrenPageClient from './page.client';

export default async function ChildrenPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.auth.login);
  }

  return <ChildrenPageClient />;
}
