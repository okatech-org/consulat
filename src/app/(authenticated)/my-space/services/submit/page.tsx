'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { ServiceSubmissionForm } from '@/components/services/service-submission-form';
import { useTranslations } from 'next-intl';
import { ServiceErrorCard } from '@/components/services/service-error-card';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useSearchParams } from 'next/navigation';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import type { Id } from 'convex/_generated/dataModel';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function ServiceSubmissionPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId') as Id<'services'> | null;
  const t = useTranslations('services');
  const { user } = useCurrentUser();

  // Get service details
  const service = useQuery(
    api.functions.service.getService,
    serviceId ? { serviceId } : 'skip',
  );

  // Get user profile
  const userProfile = useQuery(
    api.functions.profile.getCurrentProfile,
    user ? {} : 'skip',
  );

  const isLoading = service === undefined || userProfile === undefined;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <LoadingSkeleton variant="form" />
      </div>
    );
  }

  if (!service || !userProfile || !serviceId) {
    return (
      <div className="container mx-auto py-6">
        <Link href={ROUTES.user.services}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('actions.backToServices')}
          </Button>
        </Link>
        <ServiceErrorCard backText={t('actions.backToServices')} />
      </div>
    );
  }

  return <ServiceSubmissionForm service={service} userProfile={userProfile} />;
}
