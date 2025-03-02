import { notFound } from 'next/navigation';
import { getServiceRequest } from '@/actions/service-requests';
import { hasPermission } from '@/lib/permissions/utils';
import { getCurrentUser } from '@/actions/user';
import { RequestOverview } from '../_components/request-overview';
import RequestReview from '../_components/request-review';
import { getOrganizationAgents } from '@/actions/organizations';
import { getUserFullProfile, getUserFullProfileById } from '@/lib/user/getters';
import { tryCatch } from '@/lib/utils';

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

  const { data: request } = await tryCatch(getServiceRequest(awaitedParams.id));

  if (!request) {
    return notFound();
  }

  const profile = request.requestedForId
    ? await getUserFullProfileById(request.requestedForId)
    : await getUserFullProfile(user.id);

  if (!hasPermission(user, 'serviceRequests', 'view', request)) {
    return notFound();
  }

  const { data: agents = [] } = request.organizationId
    ? await getOrganizationAgents(request.organizationId)
    : { data: [] };

  if (review) {
    return <RequestReview request={request} agents={agents} />;
  }

  return (
    <div className="space-y-6">
      <RequestOverview
        request={{
          ...request,
          profile,
        }}
        user={user}
        agents={agents}
      />
    </div>
  );
}
