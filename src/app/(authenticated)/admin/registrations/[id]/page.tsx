import { getRegistrationRequestDetailsById } from '@/actions/registrations';
import { ProfileReview } from '@/app/(authenticated)/admin/_utils/components/profile/profile-review';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    id: string;
  };
};

export default async function RegistrationReview({ params }: Props) {
  const awaitedParams = await params;
  const details = await getRegistrationRequestDetailsById(awaitedParams.id);

  if (!details) {
    return notFound();
  }

  return (
    <div className="container">
      <ProfileReview request={details} />;
    </div>
  );
}
