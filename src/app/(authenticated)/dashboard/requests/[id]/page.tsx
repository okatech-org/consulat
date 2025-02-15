import { notFound } from 'next/navigation';
import { getServiceRequest } from '@/actions/service-requests';
import { hasPermission } from '@/lib/permissions/utils';
import { getCurrentUser } from '@/actions/user';
import { RequestOverview } from '../_components/request-overview';
import RequestReview from '../_components/request-review';
import { getOrganizationAgents } from '@/actions/organizations';
import { User } from '@prisma/client';

interface Props {
  params: { id: string };
  searchParams: { review?: string };
}

export default async function ViewRequest({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  const awaitedParams = await params;
  const { review } = await searchParams;

  if (!user || !awaitedParams.id) {
    return notFound();
  }

  const request = await getServiceRequest(awaitedParams.id);

  if (!request) {
    return notFound();
  }

  if (!hasPermission(user, 'serviceRequests', 'view', request)) {
    return notFound();
  }

  let agents: User[] = [];
  if (hasPermission(user, 'serviceRequests', 'update') && request.organizationId) {
    const { data } = await getOrganizationAgents(request.organizationId);
    agents = data || [];
  }

  if (review) {
    return <RequestReview request={request} />;
  }

  return (
    <div className="space-y-6">
      <RequestOverview request={request} user={user} agents={agents} />
    </div>
  );
}
