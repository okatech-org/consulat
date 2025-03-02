import { FullServiceRequest } from '@/types/service-request';
import { ProfileReview } from '../../(admin)/_utils/components/profile/profile-review';
import { ServiceRequestReview } from './service-request-review';
import { getUserFullProfile } from '@/lib/user/getters';
import { BaseAgent } from '@/types/organization';
import { ChildProfileReview } from '../../(admin)/_utils/components/profile/child-profile-review';

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
      if (fullProfile?.category === 'MINOR') {
        return (
          <ChildProfileReview
            request={{
              ...request,
              profile: fullProfile,
            }}
          />
        );
      }
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
