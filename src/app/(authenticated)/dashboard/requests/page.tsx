import CardContainer from '@/components/layouts/card-container';
import { RequestStatus, ServiceCategory, ServicePriority, User } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { hasAnyRole, hasPermission } from '@/lib/permissions/utils';
import { GetRequestsOptions, getServiceRequests } from '@/actions/service-requests';
import { RequestsTable } from './_components/requests-table';
import { getOrganizationWithSpecificIncludes } from '@/actions/organizations';
import { PageContainer } from '@/components/layouts/page-container';
import { tryCatch } from '@/lib/utils';
import { getCurrentUser } from '@/actions/user';
import { PaginatedServiceRequests } from '@/types/service-request';

interface Props {
  searchParams: Record<keyof GetRequestsOptions, string | undefined>;
}

export default async function RequestsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const queryParams = await searchParams;
  const t = await getTranslations('requests');

  const isAdmin = user ? hasAnyRole(user, ['ADMIN']) : false;
  const isAgent = user ? hasAnyRole(user, ['AGENT']) : false;

  const organization = isAdmin
    ? await tryCatch(
        getOrganizationWithSpecificIncludes(user?.organizationId as string, ['agents']),
      )
    : undefined;

  const formattedQueryParams: GetRequestsOptions = {
    ...queryParams,
    status: queryParams.status?.split(',').map((status) => status as RequestStatus),
    priority: queryParams.priority
      ?.split(',')
      .map((priority) => priority as ServicePriority),
    serviceCategory: queryParams.serviceCategory
      ?.split(',')
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

  // Fetch service requests data
  let requestsData: PaginatedServiceRequests = {
    items: [],
    total: 0,
    page: formattedQueryParams.page || 1,
    limit: formattedQueryParams.limit || 10,
  };

  if (user) {
    const result = await tryCatch(getServiceRequests(formattedQueryParams));

    if (result.data) {
      requestsData = result.data;
    } else if (result.error) {
      console.error('Error fetching service requests:', result.error);
    }
  }

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
              initialData={requestsData}
            />
          </CardContainer>
        </>
      )}
    </PageContainer>
  );
}
