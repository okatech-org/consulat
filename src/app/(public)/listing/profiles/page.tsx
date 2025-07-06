import type { Metadata } from 'next';
import ProfilesListPageClient from './page.client';

export const metadata: Metadata = {
  title: 'Profiles Consulaires | Consulat.ga',
  description: 'Liste des profiles consulaires accessibles publiquement',
};

export default function ProfilesListPage() {
  return <ProfilesListPageClient />;
}
