import { getRegistrations, GetRegistrationsOptions } from '@/actions/registrations';
import { RegistrationsTable } from '@/app/(authenticated)/admin/_utils/components/registrations-table';
import { getTranslations } from 'next-intl/server';

interface Props {
  searchParams: GetRegistrationsOptions;
}

export default async function RegistrationsPage({ searchParams }: Props) {
  const t = await getTranslations('admin.registrations');
  const queryParams = await searchParams;

  const { requests, total, filters } = await getRegistrations(queryParams);

  return (
    <div className="container space-y-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <RegistrationsTable requests={requests} total={total} filters={filters} />
    </div>
  );
}
