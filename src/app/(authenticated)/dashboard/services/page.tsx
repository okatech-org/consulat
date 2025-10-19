'use client';

import { useTranslations } from 'next-intl';
import { ServicesTable } from '@/components/organization/services-table';
import { PageContainer } from '@/components/layouts/page-container';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { OrganizationStatus } from '@/convex/lib/constants';

export default function ServicesPage() {
  const t = useTranslations('services');
  const organizations = useQuery(api.functions.organization.getAllOrganizations, {
    status: OrganizationStatus.Active,
  });

  return (
    <PageContainer
      title={t('title')}
      action={
        <Button asChild>
          <Link href={ROUTES.dashboard.services_new}>
            <Plus className="size-icon" />
            <span className={'hidden sm:inline'}>{t('actions.create')}</span>
          </Link>
        </Button>
      }
    >
      <ServicesTable organizations={organizations ?? []} />
    </PageContainer>
  );
}
