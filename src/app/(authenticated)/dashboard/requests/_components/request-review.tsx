import { ProfileReview } from '../../../../../components/profile/profile-review';
import { ServiceRequestReview } from './service-request-review';
import type { BaseAgent } from '@/types/organization';
import { ChildProfileReview } from '../../../../../components/profile/child-profile-review';
import type { RequestDetails } from '@/server/api/routers/requests/misc';

interface RequestReviewProps {
  request: RequestDetails;
  agents: BaseAgent[];
}

export default async function RequestReview({
  request,
  agents = [],
}: RequestReviewProps) {
  switch (request.serviceCategory) {
    case 'REGISTRATION':
      if (request.requestedFor?.category === 'MINOR') {
        return <ChildProfileReview request={request} />;
      }
      return <ProfileReview request={request} />;
    default:
      return <ServiceRequestReview request={request} agents={agents} />;
  }
}
