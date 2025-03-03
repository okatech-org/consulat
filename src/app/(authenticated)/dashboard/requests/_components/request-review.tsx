import { FullServiceRequest } from '@/types/service-request';
import { ProfileReview } from '../../(admin)/_utils/components/profile/profile-review';
import { ServiceRequestReview } from './service-request-review';
import { BaseAgent } from '@/types/organization';
import { ChildProfileReview } from '../../(admin)/_utils/components/profile/child-profile-review';
import { FullProfile } from '@/types';

interface RequestReviewProps {
  request: FullServiceRequest & { profile: FullProfile };
  agents: BaseAgent[];
}

export default async function RequestReview({
  request,
  agents = [],
}: RequestReviewProps) {
  switch (request.serviceCategory) {
    case 'REGISTRATION':
      if (request.profile.category === 'MINOR') {
        return (
          <ChildProfileReview
            request={{
              ...request,
              profile: request.profile,
            }}
          />
        );
      }
      return (
        <ProfileReview
          request={{
            ...request,
            profile: request.profile,
          }}
        />
      );
    default:
      return (
        <ServiceRequestReview
          request={{ ...request, profile: request.profile }}
          agents={agents}
        />
      );
  }
}
