import CardContainer from '@/components/layouts/card-container';
import { RequestStatus, ServiceCategory, ServicePriority, User } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { hasAnyRole, hasPermission } from '@/lib/permissions/utils';
import { GetRequestsOptions } from '@/actions/service-requests';
import { RequestsTable } from './_components/requests-table';
import {
  getAvailableServiceCategories,
  getOrganizationWithSpecificIncludes,
} from '@/actions/organizations';
import { PageContainer } from '@/components/layouts/page-container';
import { tryCatch } from '@/lib/utils';
import { getCurrentUser } from '@/actions/user';
interface Props {
  searchParams: Record<keyof GetRequestsOptions, string | undefined>;
}

export default async function RequestsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const queryParams = await searchParams;
  const t = await getTranslations('requests');

  const isAdmin = user ? hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN']) : false;
  const isAgent = user ? hasAnyRole(user, ['AGENT']) : false;

  const organization = isAdmin
    ? await tryCatch(
        getOrganizationWithSpecificIncludes(user?.organizationId as string, ['agents']),
      )
    : undefined;

  const formattedQueryParams: GetRequestsOptions = {
    ...queryParams,
    status: queryParams.status?.split('_').map((status) => status as RequestStatus),
    priority: queryParams.priority
      ?.split('_')
      .map((priority) => priority as ServicePriority),
    serviceCategory: queryParams.serviceCategory
      ?.split('_')
      .map((category) => category as ServiceCategory),
    page: Number(queryParams.page || '1'),
    limit: Number(queryParams.limit || '10'),
    sortBy: queryParams.sortBy || 'createdAt',
    sortOrder: queryParams.sortOrder as 'asc' | 'desc',
    startDate: queryParams.startDate ? new Date(queryParams.startDate) : undefined,
    endDate: queryParams.endDate ? new Date(queryParams.endDate) : undefined,
    organizationId: queryParams.organizationId ?? user?.organizationId ?? undefined,
    assignedToId: isAgent ? user?.id : undefined,
  };

  return (
    <PageContainer title={t('title')}>
      {user && hasPermission(user, 'serviceRequests', 'list') && (
        <>
          <CardContainer>
            <RequestsTable
              user={user}
              filters={formattedQueryParams}
              agents={(organization?.data?.agents as User[]) ?? []}
              availableServiceCategories={Object.values(ServiceCategory)}
            />
          </CardContainer>
        </>
      )}
    </PageContainer>
  );
}
