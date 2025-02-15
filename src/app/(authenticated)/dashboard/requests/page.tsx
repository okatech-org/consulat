import CardContainer from '@/components/layouts/card-container';
import { RequestStatus, ServiceCategory, ServicePriority, User } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/permissions/utils';
import { GetRequestsOptions } from '@/actions/service-requests';
import { RequestsTable } from './_components/requests-table';
import { getOrganizationWithSpecificIncludes } from '@/actions/organizations';
interface Props {
  searchParams: Record<keyof GetRequestsOptions, string | undefined>;
}

export default async function RequestsPage({ searchParams }: Props) {
  const session = await auth();
  const t = await getTranslations('dashboard.requests');
  const organization = session?.user?.organizationId
    ? await getOrganizationWithSpecificIncludes(session.user.organizationId, ['agents'])
    : undefined;

  const queryParams = await searchParams;

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
    organizationId:
      queryParams.organizationId ?? session?.user?.organizationId ?? undefined,
    assignedToId: queryParams.assignedToId,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      {session?.user && hasPermission(session.user, 'serviceRequests', 'list') && (
        <>
          <CardContainer>
            <RequestsTable
              user={session.user}
              filters={formattedQueryParams}
              agents={(organization?.data?.agents as User[]) ?? []}
            />
          </CardContainer>
        </>
      )}
    </div>
  );
}
