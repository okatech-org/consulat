import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import ChildProfilePageClient from './page.client';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.auth.login);
  }

  if (!id) {
    redirect(ROUTES.user.children);
  }

  return <ChildProfilePageClient profileId={id} />;
}
