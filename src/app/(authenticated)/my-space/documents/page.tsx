'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { useTranslations } from 'next-intl';
import { DocumentsListClient } from '@/components/documents/documents-list-client';

export default function DocumentsPage() {
  const t = useTranslations('documents');

  return (
    <PageContainer title={t('title')} description={t('description')}>
      <DocumentsListClient />
    </PageContainer>
  );
}
