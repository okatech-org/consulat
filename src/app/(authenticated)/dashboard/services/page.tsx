import { getTranslations } from 'next-intl/server';
import { ServicesTable } from '@/components/organization/services-table';
import { PageContainer } from '@/components/layouts/page-container';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { api } from '@/trpc/server';

export default async function ServicesPage() {
  const organizations = await api.organizations.getList();

  console.log('organizations', organizations);

  const t = await getTranslations('services');

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
      <ServicesTable organizations={organizations?.items ?? []} />
    </PageContainer>
  );
}
