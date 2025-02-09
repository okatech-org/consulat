import { getOrganizationById } from '@/actions/organizations';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import * as React from 'react';
import { SettingsTabs } from '@/components/organization/settings-tabs';

export default async function OrganizationSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const { data: organization, error: organizationError } = await getOrganizationById(id);

  const t = await getTranslations();

  if (organizationError) {
    notFound();
  }

  return (
    <div className="container space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('organization.title')}</h1>
        <p className="text-muted-foreground">{t('organization.settings.description')}</p>
      </div>

      {organization && (
        <SettingsTabs
          organization={{
            ...organization,
            countries: organization.countries ?? [],
            services: organization.services ?? [],
            agents: organization.agents ?? [],
          }}
        />
      )}
    </div>
  );
}
