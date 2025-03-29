import CardContainer from '@/components/layouts/card-container';
import {
  Gender,
  MaritalStatus,
  ProfileCategory,
  RequestStatus,
  WorkStatus,
} from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { hasAnyRole } from '@/lib/permissions/utils';
import { PageContainer } from '@/components/layouts/page-container';
import { getCurrentUser } from '@/actions/user';
import { ProfilesTable } from './_components/profiles-table';
import { CountryCode } from '@/lib/autocomplete-datas';
import { getProfiles, GetProfilesOptions, PaginatedProfiles } from '@/actions/profiles';
import { tryCatch } from '@/lib/utils';

interface Props {
  searchParams: Record<keyof GetProfilesOptions, string | undefined>;
}

export default async function ProfilesPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const queryParams = await searchParams;
  const t = await getTranslations('requests');

  const formattedQueryParams: GetProfilesOptions = {
    ...queryParams,
    status: queryParams.status?.split(',').map((status) => status as RequestStatus),
    category: queryParams.category
      ?.split(',')
      .map((category) => category as ProfileCategory),
    gender: queryParams.gender?.split(',').map((gender) => gender as Gender),
    maritalStatus: queryParams.maritalStatus
      ?.split(',')
      .map((status) => status as MaritalStatus),
    workStatus: queryParams.workStatus?.split(',').map((status) => status as WorkStatus),
    page: Math.max(1, Number(queryParams.page || '1')),
    limit: Math.max(1, Number(queryParams.limit || '10')),
    sortBy: queryParams.sortBy || 'createdAt',
    sortOrder: queryParams.sortOrder as 'asc' | 'desc',
    startDate: queryParams.startDate ? new Date(queryParams.startDate) : undefined,
    endDate: queryParams.endDate ? new Date(queryParams.endDate) : undefined,
    organizationId: queryParams.organizationId ?? user?.organizationId ?? undefined,
    residenceCountyCode: queryParams.residenceCountyCode as CountryCode | undefined,
  };

  const result = await tryCatch(getProfiles(formattedQueryParams));

  let profilesData: PaginatedProfiles = { items: [], total: 0 };
  if (result.data) {
    profilesData = result.data;
  } else if (result.error) {
    console.error('Error fetching profiles:', result.error.message);
  }

  return (
    <PageContainer title={t('title')}>
      {user && hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN', 'AGENT']) && (
        <>
          <CardContainer>
            <ProfilesTable filters={formattedQueryParams} initialData={profilesData} />
          </CardContainer>
        </>
      )}
    </PageContainer>
  );
}
