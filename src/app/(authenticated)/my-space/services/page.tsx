import { PageContainer } from '@/components/layouts/page-container';
import { getTranslations } from 'next-intl/server';
import { ServicesListClient } from '@/components/services/services-list-client';
import { ServicesHeaderActions } from '@/components/services/services-header-actions';
import { api } from '@/trpc/server';

// Cache de 5 minutes pour les services
export const revalidate = 300;

export default async function ServicesPage() {
  const t = await getTranslations('services');

  // Récupération optimisée des premières données avec les nouvelles procédures
  const initialRequests = await api.services.getUserServiceRequestsDashboard({
    limit: 20,
  });

  return (
    <PageContainer
      title={t('title')}
      description={t('description')}
      action={<ServicesHeaderActions />}
    >
      <ServicesListClient initialData={initialRequests} />
    </PageContainer>
  );
}
