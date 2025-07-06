import ProfileFormPageClient from './page.client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modifier le profil | Consulat.ga',
  description: 'Modifiez votre profil consulaire',
};

export default function ProfileFormPage() {
  return <ProfileFormPageClient />;
}
