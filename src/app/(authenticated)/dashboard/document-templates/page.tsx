'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { CreateDocumentTemplateFormSheet } from '@/components/document-generation/forms';
import { DocumentTemplateGrid } from '@/components/document-generation/document-template-grid';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { Id } from '@/convex/_generated/dataModel';

export default function DocumentTemplatesPage() {
  const { user } = useCurrentUser();
  const organizationId = user?.membership?.organizationId as
    | Id<'organizations'>
    | undefined;

  if (!organizationId) {
    return <div>Vous n&apos;appartenez à aucune organisation</div>;
  }

  return (
    <PageContainer
      title="Modèles de documents"
      action={<CreateDocumentTemplateFormSheet organizationId={organizationId} />}
    >
      <DocumentTemplateGrid templates={[]} />
    </PageContainer>
  );
}
