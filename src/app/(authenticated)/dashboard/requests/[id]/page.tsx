import { notFound } from 'next/navigation';

type Props = {
  params: {
    id: string;
  };
};

export default async function RegistrationReview({ params }: Props) {
  const awaitedParams = await params;

  if (!awaitedParams.id) {
    return notFound();
  }

  return (
    <div className="container">
      <pre>{JSON.stringify(awaitedParams, null, 2)}</pre>
    </div>
  );
}
