import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';
import RequestDetailPageClient from './page.client';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ review?: string }>;
}

export default async function ViewRequest({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  const awaitedParams = await params;
  const { review } = await searchParams;

  if (!user || !awaitedParams.id) {
    redirect('/auth/login');
  }

  return <RequestDetailPageClient requestId={awaitedParams.id} showReview={!!review} />;
}
