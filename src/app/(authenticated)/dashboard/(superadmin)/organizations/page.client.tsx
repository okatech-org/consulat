'use client';

import { useTranslations } from 'next-intl';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { OrganizationsTable } from '@/components/organization/organizations-table';
import { CreateOrganizationButton } from '@/components/organization/create-organization-button';
import { useOrganizations, useOrganizationsStats } from '@/hooks/use-organizations';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function OrganizationsPageClient() {
  const t = useTranslations('sa.organizations');

  // Utiliser les hooks tRPC
  const { organizations, isLoading, isError, error, refetch } = useOrganizations();

  const { stats, isLoading: isLoadingStats } = useOrganizationsStats();

  // Gestion des erreurs
  if (isError) {
    return (
      <PageContainer title={t('title')}>
        <CardContainer>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || t('messages.error.fetch')}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => refetch()} variant="outline">
              {t('actions.retry')}
            </Button>
          </div>
        </CardContainer>
      </PageContainer>
    );
  }

  // Affichage du loading
  if (isLoading) {
    return (
      <PageContainer
        title={t('title')}
        action={<CreateOrganizationButton countries={[]} />}
      >
        <CardContainer>
          <LoadingSkeleton />
        </CardContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={t('title')}
      action={<CreateOrganizationButton countries={[]} />}
    >
      <CardContainer>
        {!isLoadingStats && stats && (
          <div className="mb-4 text-sm text-muted-foreground">
            {stats.totalOrganizations} organisations total • {stats.activeOrganizations}{' '}
            actives • {stats.inactiveOrganizations} inactives
          </div>
        )}
        <OrganizationsTable organizations={organizations} countries={[]} />
      </CardContainer>
    </PageContainer>
  );
}
