'use client';

import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-current-user';
import { SettingsTabs } from '@/components/organization/settings-tabs';
import { PageContainer } from '@/components/layouts/page-container';
import { hasAnyRole } from '@/lib/permissions/utils';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { UserRole } from '@/convex/lib/constants';

export default function OrganizationSettingsPage() {
  const t = useTranslations();
  const { user } = useCurrentUser();

  const organizationId = (
    user?.organizationId ?? user?.assignedOrganizationId
  ) as Id<'organizations'> | undefined;

  const organization = useQuery(
    api.functions.organization.getOrganization,
    organizationId ? { organizationId } : 'skip'
  );

  const countries = useQuery(api.functions.country.getActiveCountries);

  if (!user || !organizationId) {
    return <div>Non autorisé</div>;
  }

  if (!hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN', 'MANAGER'])) {
    return <div>Vous n&apos;êtes pas autorisé à accéder à cette page</div>;
  }

  if (!organization) {
    return <div>Organisation non trouvée</div>;
  }

  return (
    <PageContainer
      title={t('organization.title')}
      description={t('organization.settings.description')}
    >
      <SettingsTabs
        organization={{
          _id: organization._id,
          name: organization.name,
          metadata: organization.metadata as Record<string, unknown> | null,
          countries: organization.countries ?? [],
          services: organization.services ?? [],
          agents:
            organization.agents?.filter((agent) =>
              agent.roles?.includes(UserRole.Agent),
            ) ?? [],
          managers:
            organization.agents?.filter((agent) =>
              agent.roles?.includes(UserRole.Manager),
            ) ?? [],
        } as any}
        availableCountries={countries ?? []}
      />
    </PageContainer>
  );
}
