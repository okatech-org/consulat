import { getRegistrations } from '@/actions/registrations';
import { RegistrationsTable } from '@/app/(authenticated)/admin/_utils/components/registrations-table';
import { getTranslations } from 'next-intl/server';
import { RequestStatus } from '@prisma/client';

interface SearchParams {
  search?: string;
  status?: RequestStatus;
  profileStatus?: RequestStatus;
  page?: string;
  limit?: string;
}

interface Props {
  searchParams: SearchParams;
}

export default async function RegistrationsPage({ searchParams }: Props) {
  const t = await getTranslations('admin.registrations');
  const queryParams = await searchParams;

  const { requests, total, filters } = await getRegistrations({
    search: queryParams.search,
    status: queryParams.status,
    profileStatus: queryParams.profileStatus,
    page: queryParams.page ? parseInt(queryParams.page) : 1,
    limit: queryParams.limit ? parseInt(queryParams.limit) : 100,
  });

  console.log({ requests: JSON.stringify(requests) });

  return (
    <div className="container space-y-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <RegistrationsTable requests={requests} />
    </div>
  );
}
