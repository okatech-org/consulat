import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/actions/user';
import { RequestOverview } from '../_components/request-overview';
import RequestReview from '../_components/request-review';
import { getOrganizationAgents } from '@/actions/organizations';
import { api } from '@/trpc/server';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ review?: string }>;
}

export default async function ViewRequest({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  const awaitedParams = await params;
  const { review } = await searchParams;

  if (!user || !awaitedParams.id) {
    return notFound();
  }

  const request = await api.requests.getById({ id: awaitedParams.id });

  if (!request) {
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
      <RequestOverview request={request} user={user} agents={agents} />
    </div>
  );
}
