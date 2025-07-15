import { PageContainer } from '@/components/layouts/page-container';
import { getTranslations } from 'next-intl/server';
import { api } from '@/trpc/server';
import { DocumentsListClient } from '@/components/documents/documents-list-client';

// Cache de 5 minutes pour les documents
export const revalidate = 300;

export default async function DocumentsPage() {
  const t = await getTranslations('documents');

  // Récupération optimisée des premières données avec la nouvelle procédure
  const initialData = await api.documents.getUserDocumentsDashboard({
    limit: 20,
  });

  return (
    <PageContainer title={t('title')} description={t('description')}>
      <DocumentsListClient initialData={initialData} />
    </PageContainer>
  );
}
