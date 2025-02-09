import { getOrganizations } from '@/actions/organizations';
import { OrganizationsTable } from '@/components/organization/organizations-table';
import { OrganizationDialog } from '@/components/organization/organization-dialog';
import { getCountries } from '@/actions/countries';
import { CreateOrganizationButton } from '@/components/organization/create-organization-button';
import { getTranslations } from 'next-intl/server';
import CardContainer from '@/components/layouts/card-container';

export default async function OrganizationsPage() {
  const { data: organizations } = await getOrganizations();
  const { data: countries } = await getCountries();
  const t = await getTranslations('sa.organizations');

  return (
    <div className="container space-y-6">
      <CardContainer
        title={<span>{t('title')}</span>}
        action={<CreateOrganizationButton countries={countries ?? []} />}
      >
        <OrganizationsTable
          countries={countries ?? []}
          organizations={organizations ?? []}
        />
        <OrganizationDialog countries={countries ?? []} />
      </CardContainer>
    </div>
  );
}
