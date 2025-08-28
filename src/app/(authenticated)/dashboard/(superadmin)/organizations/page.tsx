import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { OrganizationsTable } from '@/components/organization/organizations-table';
import { CreateOrganizationButton } from '@/components/organization/create-organization-button';
import { getTranslations } from 'next-intl/server';

export default async function OrganizationsPage() {
  const t = await getTranslations('sa.organizations');

  return (
    <PageContainer title={t('title')} action={<CreateOrganizationButton />}>
      <CardContainer>
        <OrganizationsTable />
      </CardContainer>
    </PageContainer>
  );
}
