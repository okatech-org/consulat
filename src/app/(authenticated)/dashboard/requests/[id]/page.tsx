import { notFound } from 'next/navigation';
import { getServiceRequest } from '@/actions/service-requests';
import { hasPermission } from '@/lib/permissions/utils';
import { getCurrentUser } from '@/actions/user';
import { RequestOverview } from '../_components/request-overview';

interface Props {
  params: { id: string };
}

export default async function ViewRequest({ params }: Props) {
  const user = await getCurrentUser();
  const awaitedParams = await params;

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

  return (
    <div className="space-y-6">
      <RequestOverview request={request} user={user} />
    </div>
  );
}
