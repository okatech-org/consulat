import CardContainer from '@/components/layouts/card-container';
import {
  Gender,
  MaritalStatus,
  ProfileCategory,
  RequestStatus,
  User,
  WorkStatus,
} from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { hasAnyRole, hasPermission } from '@/lib/permissions/utils';
import { PageContainer } from '@/components/layouts/page-container';
import { tryCatch } from '@/lib/utils';
import { getCurrentUser } from '@/actions/user';
import { ProfilesTable } from './_components/profiles-table';
import { getOrganizationWithSpecificIncludes } from '@/actions/organizations';

interface GetProfilesOptions {
  search?: string;
  status?: RequestStatus[];
  category?: ProfileCategory[];
  gender?: Gender[];
  maritalStatus?: MaritalStatus[];
  workStatus?: WorkStatus[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: Date;
  endDate?: Date;
  organizationId?: string;
}

interface Props {
  searchParams: Record<keyof GetProfilesOptions, string | undefined>;
}

export default async function ProfilesPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const queryParams = await searchParams;
  const t = await getTranslations('requests');

  const isAdmin = user ? hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN']) : false;

  const organization = isAdmin
    ? await tryCatch(
        getOrganizationWithSpecificIncludes(user?.organizationId as string, ['agents']),
      )
    : undefined;

  const formattedQueryParams: GetProfilesOptions = {
    ...queryParams,
    status: queryParams.status?.split('_').map((status) => status as RequestStatus),
    category: queryParams.category
      ?.split('_')
      .map((category) => category as ProfileCategory),
    gender: queryParams.gender?.split('_').map((gender) => gender as Gender),
    maritalStatus: queryParams.maritalStatus
      ?.split('_')
      .map((status) => status as MaritalStatus),
    workStatus: queryParams.workStatus?.split('_').map((status) => status as WorkStatus),
    page: Number(queryParams.page || '1'),
    limit: Number(queryParams.limit || '10'),
    sortBy: queryParams.sortBy || 'createdAt',
    sortOrder: queryParams.sortOrder as 'asc' | 'desc',
    startDate: queryParams.startDate ? new Date(queryParams.startDate) : undefined,
    endDate: queryParams.endDate ? new Date(queryParams.endDate) : undefined,
    organizationId: queryParams.organizationId ?? user?.organizationId ?? undefined,
  };

  return (
    <PageContainer title={t('title')}>
      {user && hasPermission(user, 'profiles', 'view') && (
        <>
          <CardContainer>
            <ProfilesTable
              user={user}
              filters={formattedQueryParams}
              agents={(organization?.data?.agents as User[]) ?? []}
            />
          </CardContainer>
        </>
      )}
    </PageContainer>
  );
}
