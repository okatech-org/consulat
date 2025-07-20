import { ProfileReview } from '../../../../../components/profile/profile-review';
import { ServiceRequestReview } from './service-request-review';
import { ChildProfileReview } from '../../../../../components/profile/child-profile-review';
import type { RequestDetails } from '@/server/api/routers/requests/types';

interface RequestReviewProps {
  request: NonNullable<RequestDetails>;
}

export default function RequestReview({ request }: RequestReviewProps) {
  switch (request.serviceCategory) {
    case 'REGISTRATION':
      if (request.requestedFor?.category === 'MINOR') {
        return <ChildProfileReview request={request} />;
      }
      return <ProfileReview request={request} />;
    default:
      return <ServiceRequestReview request={request} />;
  }
}
