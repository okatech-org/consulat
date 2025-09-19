import { getOrganizationById } from '@/actions/organizations';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth/utils';
import { SettingsTabs } from '@/components/organization/settings-tabs';
import { PageContainer } from '@/components/layouts/page-container';
import { getActiveCountries } from '@/actions/countries';
import { ServerRoleGuard } from '@/lib/permissions/utils';
import { UserRole } from '@prisma/client';
import { getOrganizationIdFromUser } from '@/lib/utils';

export default async function OrganizationSettingsPage() {
  const [t, user, countries] = await Promise.all([
    getTranslations(),
    getCurrentUser(),
    getActiveCountries(),
  ]);

  const organizationId = getOrganizationIdFromUser(user);

  if (!organizationId || !user) {
    notFound();
  }

  const { data: organization, error } = await getOrganizationById(organizationId);

  if (!organization || error) {
    notFound();
  }

  return (
    <PageContainer
      title={t('organization.title')}
      description={t('organization.settings.description')}
    >
      <ServerRoleGuard
        roles={['ADMIN', 'SUPER_ADMIN', 'MANAGER']}
        user={user}
        fallback={<div>Vous n&apos;êtes pas autorisé à accéder à cette page</div>}
      >
        <SettingsTabs
          organization={{
            ...organization,
            metadata: organization.metadata as Record<string, unknown> | null,
            countries: organization.countries ?? [],
            services: organization.services ?? [],
            agents:
              organization.agents.filter((agent) =>
                agent.roles?.includes(UserRole.AGENT),
              ) ?? [],
            managers:
              organization.agents.filter((agent) =>
                agent.roles?.includes(UserRole.MANAGER),
              ) ?? [],
          }}
          availableCountries={countries}
        />
      </ServerRoleGuard>
    </PageContainer>
  );
}
