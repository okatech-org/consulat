'use client';

import { SettingsTabs } from '@/components/organization/settings-tabs';
import { useParams } from 'next/navigation';
import { NotFoundComponent } from '@/components/ui/not-found';
import { PageContainer } from '@/components/layouts/page-container';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useTranslations } from 'next-intl';
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function OrganizationSettingsPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: Id<'organizations'> }>();
  const organization = useQuery(
    api.functions.organization.getOrganization,
    id ? { organizationId: id } : 'skip',
  );

  if (organization === undefined) {
    return (
      <PageContainer title="Paramètre des organismes">
        <LoadingSkeleton variant="grid" rows={3} columns={3} />
      </PageContainer>
    );
  }

  if (!organization) {
    return (
      <PageContainer title="Organisme non trouvé">
        <NotFoundComponent />
      </PageContainer>
    );
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
