import { getOrganizationById } from '@/actions/organizations';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SettingsTabs } from '@/components/organization/settings-tabs';
import { getActiveCountries } from '@/actions/countries';
import { UserRole } from '@prisma/client';

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

  const countries = await getActiveCountries();

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
            metadata: organization.metadata as Record<string, unknown> | null,
            countries: organization.countries ?? [],
            services: organization.services ?? [],
            agents:
              organization.agents.filter((agent) => agent.role === UserRole.AGENT) ?? [],
            managers:
              organization.agents.filter((agent) => agent.role === UserRole.MANAGER) ??
              [],
          }}
          availableCountries={countries ?? []}
        />
      )}
    </div>
  );
}
