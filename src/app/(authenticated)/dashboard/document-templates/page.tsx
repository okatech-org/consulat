import { PageContainer } from '@/components/layouts/page-container';
import { getDocumentTemplates } from '@/actions/document-generation';
import { getCurrentUser } from '@/actions/user';
import { CreateDocumentTemplateFormSheet } from '@/components/document-generation/forms';
import { DocumentTemplateGrid } from '@/components/document-generation/document-template-grid';

export default async function DocumentTemplatesPage() {
  const currentUser = await getCurrentUser();
  const organizationId =
    currentUser?.organizationId ?? currentUser?.assignedOrganizationId;

  if (!organizationId) {
    return <div>Vous n&apos;appartenez à aucune organisation</div>;
  }

  const templates = await getDocumentTemplates(organizationId);

  return (
    <PageContainer
      title="Modèles de documents"
      action={<CreateDocumentTemplateFormSheet organizationId={organizationId} />}
    >
      <DocumentTemplateGrid templates={templates} />
    </PageContainer>
  );
}
