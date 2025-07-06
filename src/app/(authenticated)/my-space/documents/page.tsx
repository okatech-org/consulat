import { getUserDocumentsList } from '@/actions/documents';
import { DocumentsList } from '@/components/documents/documents-list';
import { PageContainer } from '@/components/layouts/page-container';
import { getTranslations } from 'next-intl/server';

export default async function DocumentsPage() {
  const t = await getTranslations('documents');
  const documents = await getUserDocumentsList();

  return (
    <PageContainer title={t('title')} description={t('description')}>
      <DocumentsList documents={documents} />
    </PageContainer>
  );
}
