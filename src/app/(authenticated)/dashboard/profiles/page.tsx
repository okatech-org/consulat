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
import {
  getOrganizationById,
  getOrganizationWithSpecificIncludes,
} from '@/actions/organizations';
import { CountryCode } from '@/lib/autocomplete-datas';
import countries from '@/i18n/messages/fr/countries';
import { getCountries } from '@/actions/countries';

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
  residenceCountyCode?: CountryCode;
}

interface Props {
  searchParams: Record<keyof GetProfilesOptions, string | undefined>;
}

export default async function ProfilesPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const queryParams = await searchParams;
  const t = await getTranslations('requests');
  const isAgent = user?.roles.includes('AGENT');
  const isAdmin = user?.roles.includes('ADMIN');
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN');

  const getOrganizationId = () => {
    switch (true) {
      case isAgent:
        return user?.assignedOrganizationId;
      case isAdmin:
        return user?.organizationId;
      case isSuperAdmin:
        return '';
      default:
        return '';
    }
  };

  const organizationId = getOrganizationId() ?? '';

  const organization = await getOrganizationWithSpecificIncludes(organizationId, [
    'countries',
  ]);

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
    residenceCountyCode: queryParams.residenceCountyCode as CountryCode | undefined,
  };

  return (
    <PageContainer title={t('title')}>
      {user && hasPermission(user, 'profiles', 'view') && (
        <>
          <CardContainer>
            <ProfilesTable
              filters={formattedQueryParams}
              countries={organization?.countries ?? []}
            />
          </CardContainer>
        </>
      )}
    </PageContainer>
  );
}
