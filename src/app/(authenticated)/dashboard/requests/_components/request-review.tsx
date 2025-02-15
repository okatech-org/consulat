import { FullServiceRequest } from '@/types/service-request';
interface RequestReviewProps {
  request: FullServiceRequest;
}

export default function RequestReview({ request }: RequestReviewProps) {
  return (
    <div>
      <h1>Request Review</h1>
      <pre>{JSON.stringify(request, null, 2)}</pre>
    </div>
  );
}
