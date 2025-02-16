import { FullServiceRequest } from '@/types/service-request';
import { ProfileReview } from '../../(admin)/_utils/components/profile/profile-review';
import { ServiceRequestReview } from './service-request-review';
import { getUserFullProfile } from '@/lib/user/getters';
import { User } from '@prisma/client';

interface RequestReviewProps {
  request: FullServiceRequest;
  agents: User[];
}

export default async function RequestReview({
  request,
  agents = [],
}: RequestReviewProps) {
  const fullProfile = await getUserFullProfile(request.submittedById);
  switch (request.serviceCategory) {
    case 'REGISTRATION':
      return (
        <ProfileReview
          request={{
            ...request,
            profile: fullProfile,
          }}
          agents={agents}
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
