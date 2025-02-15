import { FullServiceRequest } from '@/types/service-request';
import { ProfileReview } from '../../(admin)/_utils/components/profile/profile-review';
import { ServiceRequestReview } from './service-request-review';

interface RequestReviewProps {
  request: FullServiceRequest;
}

export default async function RequestReview({ request }: RequestReviewProps) {
  switch (request.serviceCategory) {
    case 'REGISTRATION':
      return (
        <ProfileReview
          request={{
            ...request,
            profile: request.submittedBy.profile!,
          }}
        />
      );
    default:
      return <ServiceRequestReview request={request} />;
  }
}
