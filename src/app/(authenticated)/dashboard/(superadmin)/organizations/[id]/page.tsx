'use client';

import { SettingsTabs } from '@/components/organization/settings-tabs';
import { UserRole } from '@prisma/client';
import { useParams } from 'next/navigation';
import { NotFoundComponent } from '@/components/ui/not-found';
import { PageContainer } from '@/components/layouts/page-container';
import { api } from '@/trpc/react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useTranslations } from 'next-intl';

export default function OrganizationSettingsPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const { data: organization, isLoading } = api.organizations.getById.useQuery({ id });

  if (isLoading) {
    return (
      <PageContainer title="Paramètre des organismes">
        <LoadingSkeleton variant="grid" rows={3} columns={3} />
      </PageContainer>
    );
  }

  if (!organization && !isLoading) {
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
      {organization && (
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
          }}
        />
      )}
    </PageContainer>
  );
}
