'use client';

import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-current-user';
import { SettingsTabs } from '@/components/organization/settings-tabs';
import { PageContainer } from '@/components/layouts/page-container';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function OrganizationSettingsPage() {
  const t = useTranslations();
  const { user } = useCurrentUser();

  const organization = useQuery(
    api.functions.organization.getOrganization,
    user?.membership?.organizationId
      ? { organizationId: user.membership.organizationId }
      : 'skip',
  );

  if (!user) {
    return <div>Non autorisé</div>;
  }

  if (!organization) {
    return <div>Organisation non trouvée</div>;
  }

  return (
    <PageContainer
      title={t('organization.title')}
      description={t('organization.settings.description')}
    >
      <SettingsTabs organization={organization} />
    </PageContainer>
  );
}
