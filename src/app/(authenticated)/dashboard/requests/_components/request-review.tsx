import { FullServiceRequest } from '@/types/service-request';
import { ProfileReview } from '../../(admin)/_utils/components/profile/profile-review';
import { ServiceRequestReview } from './service-request-review';
import { getUserFullProfile } from '@/lib/user/getters';
import { BaseAgent } from '@/types/organization';

interface RequestReviewProps {
  request: FullServiceRequest;
  agents: BaseAgent[];
}

export default async function RequestReview({
  request,
  agents = [],
}: RequestReviewProps) {
  const fullProfile = await getUserFullProfile(request.submittedById);
  switch (request.serviceCategory) {
    case 'REGISTRATION':
    case 'CHILD_REGISTRATION':
      return (
        <ProfileReview
          request={{
            ...request,
            profile: fullProfile,
          }}
        />
      );
    default:
      return (
        <ServiceRequestReview
          request={{ ...request, profile: fullProfile }}
          agents={agents}
        />
      );
  }
}
