import { GetRegistrationsOptions } from '@/actions/registrations';
import CardContainer from '@/components/layouts/card-container';
import { RequestStatus } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { RegistrationsTable } from '../(admin)/_utils/components/registrations-table';

interface Props {
  searchParams: GetRegistrationsOptions & { status?: string; profileStatus?: string };
}

export default async function RegistrationsPage({ searchParams }: Props) {
  const t = await getTranslations('admin.registrations');
  const queryParams = await searchParams;

  return (
    <>
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <CardContainer>
        <RegistrationsTable
          filters={{
            ...queryParams,
            status: queryParams.status
              ?.split('_')
              .map((status) => status as RequestStatus),
            profileStatus: queryParams.profileStatus
              ?.split('_')
              .map((status) => status as RequestStatus),
          }}
        />
      </CardContainer>
    </>
  );
}
