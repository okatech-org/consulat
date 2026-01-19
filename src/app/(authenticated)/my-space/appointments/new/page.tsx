'use client';

import { ROUTES } from '@/schemas/routes';
import { NewAppointmentForm } from '@/components/appointments/new-appointment-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageContainer } from '@/components/layouts/page-container';
import { useTranslations } from 'next-intl';
import { AppointmentType, OrganizationStatus } from '@/convex/lib/constants';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useSearchParams } from 'next/navigation';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { Id } from 'convex/_generated/dataModel';

export default function NewAppointmentPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('serviceRequestId') as Id<'requests'> | null;
  const appointmentType = searchParams.get('type') as AppointmentType | null;

  const { user } = useCurrentUser();
  const t = useTranslations('appointments');

  // Get user requests
  const userRequests = useQuery(
    api.functions.request.getAllRequests,
    user?.profileId ? { profileId: user.profileId } : 'skip',
  );

  // Get specific request if provided
  const specificRequest = useQuery(
    api.functions.request.getRequest,
    requestId ? { requestId } : 'skip',
  );

  // Get organization by country
  const organizations = useQuery(
    api.functions.organization.getAllOrganizations,
    user?.countryCode ? { status: OrganizationStatus.Active } : 'skip',
  );

  const organization = organizations?.find((org) =>
    org.countryCodes?.includes(user?.countryCode || ''),
  );

  const isLoading =
    userRequests === undefined ||
    (requestId && specificRequest === undefined) ||
    organizations === undefined;

  if (isLoading) {
    return (
      <PageContainer title={t('new.title')} description={t('new.description')}>
        <LoadingSkeleton variant="form" />
      </PageContainer>
    );
  }

  const preselectedData = specificRequest
    ? {
        request: specificRequest,
        type: appointmentType || AppointmentType.DocumentSubmission,
      }
    : undefined;

  return (
    <PageContainer
      title={t('new.title')}
      description={t('new.description')}
      action={
        <Link
          href={ROUTES.user.appointments}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-icon" />
          {t('new.back')}
        </Link>
      }
    >
      {!organization && (
        <h1>
          Pas d&apos;organisation trouvée pour ce pays. Veuillez contacter
          l&apos;administrateur.
        </h1>
      )}

      {organization && user && (
        <NewAppointmentForm
          serviceRequests={userRequests || []}
          countryCode={user.countryCode || ''}
          organizationId={organization._id}
          attendeeId={user._id}
          profileId={user.profileId!}
          preselectedData={preselectedData}
        />
      )}
    </PageContainer>
  );
}
