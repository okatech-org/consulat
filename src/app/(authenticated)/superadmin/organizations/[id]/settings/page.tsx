import { getOrganizations } from '@/app/(authenticated)/superadmin/_utils/actions/organizations';
import { getCountries } from '@/actions/countries';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SAOrganizationSettings } from '@/app/(authenticated)/superadmin/_utils/components/sa-organization-settings'; // Importer le nouveau composant
import CardContainer from '@/components/layouts/card-container';

export default async function OrganizationSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const [
    { data: organizations, error: organizationsError },
    { data: countries, error: countriesError },
  ] = await Promise.all([getOrganizations(), getCountries()]);
  const organization = organizations?.find((org) => org.id === params.id);

  const t = await getTranslations('superadmin.organizations');

  if (!organization || organizationsError || countriesError) {
    notFound();
  }

  return (
    <div className="container h-full space-y-6">
      <CardContainer title={<span>{t('title')}</span>} subtitle={organization.name}>
        <SAOrganizationSettings organization={organization} countries={countries ?? []} />
      </CardContainer>
    </div>
  );
}
