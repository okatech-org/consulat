import { getTranslations } from 'next-intl/server';
import { getOrganizations } from '@/actions/organizations';
import { ServicesTable } from '@/components/organization/services-table';
import { PageContainer } from '@/components/layouts/page-container';
import { tryCatch } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

export default async function ServicesPage() {
  const [{ data: organizations, error: organizationsError }] = await Promise.all([
    tryCatch(getOrganizations()),
  ]);

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
      {organizationsError ? (
        <div className="text-destructive">{t('messages.error.fetch')}</div>
      ) : (
        <ServicesTable organizations={organizations ?? []} />
      )}
    </PageContainer>
  );
}
