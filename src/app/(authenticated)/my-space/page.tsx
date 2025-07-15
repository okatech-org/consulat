import { getCurrentUser } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { UnifiedDashboard } from './components/unified-dashboard';
import { PageContainer } from '@/components/layouts/page-container';

export const metadata = {
  title: 'Mon Espace Consulaire',
  description: 'Gérez vos demandes et accédez à tous vos services consulaires',
};

export default async function MySpacePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <PageContainer>
      <UnifiedDashboard userId={user.id} />
    </PageContainer>
  );
}
