import { ServiceCategory } from '@/convex/lib/constants';
import { ServiceRequestReview } from './service-request-review';
import type { Doc } from '@/convex/_generated/dataModel';
import { ProfileReview } from '@/components/profile/profile-review';
import { ChildProfileReview } from '@/components/profile/child-profile-review';

interface RequestReviewProps {
  request: NonNullable<Doc<'requests'>>;
}

export default function RequestReview({ request }: RequestReviewProps) {
  // Check if this is a registration request based on service category
  if (request.metadata.service?.category === ServiceCategory.Registration) {
    // Check if it's a child profile based on the isChildProfile flag in metadata
    if (request.metadata.profile?.isChildProfile) {
      return <ChildProfileReview request={request} />;
    }

    return <ProfileReview request={request} />;
  }

  return <ServiceRequestReview request={request} />;
}
