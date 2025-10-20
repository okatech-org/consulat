'use client';

import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { OrganizationsTable } from '@/components/organization/organizations-table';
import { CreateOrganizationButton } from '@/components/organization/create-organization-button';
import { useTranslations } from 'next-intl';

export default function OrganizationsPage() {
  const t = useTranslations('sa.organizations');

  return (
    <PageContainer title={t('title')} action={<CreateOrganizationButton />}>
      <CardContainer>
        <OrganizationsTable />
      </CardContainer>
    </PageContainer>
  );
}
