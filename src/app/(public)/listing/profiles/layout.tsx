import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profiles Consulaires | Consulat.ga',
  description: 'Liste des profiles consulaires accessibles publiquement',
};

export default function ProfilesListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
