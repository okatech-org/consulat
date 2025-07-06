import type { Metadata } from 'next';
import ProfilePageClient from './page.client';
import { api } from '@/trpc/server';

interface ProfilePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const profileId = awaitedParams.id;

  try {
    const profile = await api.publicProfiles.getById({ id: profileId });

    return {
      title: `${profile.firstName} ${profile.lastName} | Consulat.ga`,
      description: `Profil consulaire de ${profile.firstName} ${profile.lastName}`,
    };
  } catch {
    return { title: 'Profil non trouvé' };
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const awaitedParams = await params;
  const profileId = awaitedParams.id;

  return <ProfilePageClient profileId={profileId} />;
}
