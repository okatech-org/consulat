import { getOrganizations } from '@/actions/organizations';
import { OrganizationsTable } from '@/components/organization/organizations-table';
import { OrganizationDialog } from '@/components/organization/organization-dialog';
import { getCountries } from '@/actions/countries';
import { CreateOrganizationButton } from '@/components/organization/create-organization-button';
import { getTranslations } from 'next-intl/server';
import CardContainer from '@/components/layouts/card-container';
import { PageContainer } from '@/components/layouts/page-container';
import { tryCatch } from '@/lib/utils';
import { Country } from '@prisma/client';
export default async function OrganizationsPage() {
  const { data: organizations } = await tryCatch(getOrganizations());
  const { data: countries } = await tryCatch(getCountries());
  const t = await getTranslations('sa.organizations');

  return (
    <PageContainer
      title={t('title')}
      action={<CreateOrganizationButton countries={(countries as Country[]) ?? []} />}
    >
      <CardContainer>
        <OrganizationsTable
          countries={countries ?? []}
          organizations={organizations ?? []}
        />
        <OrganizationDialog countries={(countries as Country[]) ?? []} />
      </CardContainer>
    </PageContainer>
  );
}
