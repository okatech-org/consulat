import { notFound } from 'next/navigation';

type Props = {
  params: {
    id: string;
  };
};

export default async function RequestReview({ params }: Props) {
  const awaitedParams = await params;

  if (!awaitedParams.id) {
    return notFound();
  }

  return (
    <div>
      <h1>Request Review</h1>
    </div>
  );
}
