import { FullServiceRequest } from '@/types/service-request';
import { ProfileReview } from '../../(admin)/_utils/components/profile/profile-review';
import { ServiceRequestReview } from './service-request-review';
import { getUserFullProfile } from '@/lib/user/getters';

interface RequestReviewProps {
  request: FullServiceRequest;
}

export default async function RequestReview({ request }: RequestReviewProps) {
  const fullProfile = await getUserFullProfile(request.submittedById);
  switch (request.serviceCategory) {
    case 'REGISTRATION':
      return (
        <ProfileReview
          request={{
            ...request,
            profile: fullProfile,
          }}
        />
      );
    default:
      return <ServiceRequestReview request={request} />;
  }
}
