import { PageContainer } from '@/components/layouts/page-container';
import { getTranslations } from 'next-intl/server';
import { DocumentsListClient } from '@/components/documents/documents-list-client';

export default async function DocumentsPage() {
  const t = await getTranslations('documents');

  return (
    <PageContainer title={t('title')} description={t('description')}>
      <DocumentsListClient />
    </PageContainer>
  );
}
