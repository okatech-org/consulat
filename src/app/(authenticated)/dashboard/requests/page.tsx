'use client';

import CardContainer from '@/components/layouts/card-container';
import { PageContainer } from '@/components/layouts/page-container';
import { RequestStatus, ServiceCategory, ServicePriority, User } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getServiceRequests } from '@/actions/service-requests';
import { RequestsTable } from './_components/requests-table';
import { GetRequestsOptions } from '@/actions/service-requests';
import { PaginatedServiceRequests } from '@/types/service-request';
import { getOrganizationWithSpecificIncludes } from '@/actions/organizations';
import { tryCatch } from '@/lib/utils';
import { getCurrentUser } from '@/actions/user';
import { hasAnyRole, hasPermission } from '@/lib/permissions/utils';
import { SessionUser } from '@/types';

export default function RequestsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestsData, setRequestsData] = useState<PaginatedServiceRequests>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });

  // Format query parameters
  const formatQueryParams = useCallback(() => {
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const isAgent = user ? hasAnyRole(user, ['AGENT']) : false;

    return {
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
    } as GetRequestsOptions;
  }, [searchParams, user]);

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    loadUserData();
  }, []);

  // Load organization data if user is admin
  useEffect(() => {
    async function loadOrganizationData() {
      if (user && hasAnyRole(user, ['ADMIN']) && user.organizationId) {
        const result = await tryCatch(
          getOrganizationWithSpecificIncludes(user.organizationId, ['agents']),
        );
        if (result.data && result.data.agents) {
          setAgents(result.data.agents as unknown as User[]);
        }
      }
    }

    if (user) {
      loadOrganizationData();
    }
  }, [user]);

  // Fetch requests data
  useEffect(() => {
    async function fetchRequestsData() {
      if (!user) return;

      setIsLoading(true);
      const formattedParams = formatQueryParams();

      try {
        const result = await tryCatch(getServiceRequests(formattedParams));
        if (result.data) {
          setRequestsData(result.data);
        } else if (result.error) {
          console.error('Error fetching service requests:', result.error);
        }
      } catch (error) {
        console.error('Error in fetchRequestsData:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequestsData();
  }, [user, formatQueryParams]);

  if (!user) {
    return null;
  }

  return (
    <PageContainer title={t('requests.title')}>
      {user && hasPermission(user, 'serviceRequests', 'list') && (
        <CardContainer>
          <RequestsTable
            user={user}
            filters={formatQueryParams()}
            agents={agents}
            availableServiceCategories={Object.values(ServiceCategory)}
            initialData={requestsData}
            isLoading={isLoading}
            onRefresh={() => {
              // Trigger a refetch by changing page (this will trigger a URL change that rerenders the component)
              const params = new URLSearchParams(searchParams.toString());
              const currentPage = params.get('page') || '1';
              params.set('page', currentPage);
              router.push(`${pathname}?${params.toString()}`);
            }}
          />
        </CardContainer>
      )}
    </PageContainer>
  );
}
