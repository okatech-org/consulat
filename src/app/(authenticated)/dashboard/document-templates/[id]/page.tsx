import EditionForm from '@/components/document-generation/forms';
import { PageContainer } from '@/components/layouts/page-container';
import { ErrorCard } from '@/components/ui/error-card';

interface DocumentTemplatePageProps {
  params: {
    id: string;
  };
}

export default async function DocumentTemplatePage({
  params,
}: DocumentTemplatePageProps) {
  const awaitedParams = await params;
  const modelId = awaitedParams.id as string;

  if (!modelId) {
    return (
      <ErrorCard
        title={'Modèle de document non trouvé'}
        description={"Le modèle de document demandé n'existe pas"}
      />
    );
  }

  const template = undefined;

  if (!template) {
    return (
      <ErrorCard
        title={'Modèle de document non trouvé'}
        description={"Le modèle de document demandé n'existe pas"}
      />
    );
  }

  return (
    <PageContainer title={template?.name ?? 'Modèle de document'}>
      <EditionForm template={template} />
    </PageContainer>
  );
}
