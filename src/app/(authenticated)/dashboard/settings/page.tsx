import { getOrganizationById } from '@/actions/organizations';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import * as React from 'react';
import { getCurrentUser } from '@/actions/user';
import { SettingsTabs } from '@/components/organization/settings-tabs';
import { PageContainer } from '@/components/layouts/page-container';

export default async function OrganizationSettingsPage() {
  const user = await getCurrentUser();
  const t = await getTranslations();

  if (!user?.organizationId) {
    notFound();
  }

  const { data: organization, error } = await getOrganizationById(user.organizationId);

  if (!organization || error) {
    notFound();
  }

  return (
    <PageContainer
      title={t('organization.title')}
      description={t('organization.settings.description')}
    >
      <SettingsTabs
        organization={{
          ...organization,
          metadata: organization.metadata as Record<string, unknown> | null,
          countries: organization.countries ?? [],
          services: organization.services ?? [],
          agents: organization.agents ?? [],
        }}
      />
    </PageContainer>
  );
}
