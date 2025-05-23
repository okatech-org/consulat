import { getCurrentUser } from '@/actions/user';
import { getOrganizationByCountry } from '@/actions/organizations';
import { ROUTES } from '@/schemas/routes';
import { redirect } from 'next/navigation';
import { NewAppointmentForm } from '@/components/appointments/new-appointment-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getServiceRequest, getServiceRequestsByUser } from '@/actions/service-requests';
import type { FullServiceRequest } from '@/types/service-request';
import { PageContainer } from '@/components/layouts/page-container';
import { getTranslations } from 'next-intl/server';
import { AppointmentType } from '@prisma/client';

interface NewAppointmentPageProps {
  searchParams: {
    serviceRequestId?: string;
    type?: AppointmentType;
    serviceId?: string;
  };
}

export default async function NewAppointmentPage({
  searchParams,
}: NewAppointmentPageProps) {
  const awaitedSearchParams = await searchParams;
  const user = await getCurrentUser();
  const t = await getTranslations('appointments');

  if (!user) {
    redirect(ROUTES.auth.login);
  }

  // Récupérer les informations pré-remplies si disponibles
  let preselectedData:
    | {
        request?: FullServiceRequest;
        type?: AppointmentType;
      }
    | undefined;
  if (awaitedSearchParams.serviceRequestId) {
    const request = await getServiceRequest(awaitedSearchParams.serviceRequestId);
    if (request) {
      preselectedData = {
        request,
        type: awaitedSearchParams.type,
      };
    }
  }

  const [serviceRequests, organization] = await Promise.all([
    getServiceRequestsByUser(user.id) as Promise<FullServiceRequest[]>,
    getOrganizationByCountry(user.countryCode ?? ''),
  ]);

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

      {organization && (
        <NewAppointmentForm
          serviceRequests={serviceRequests}
          countryCode={user.countryCode ?? ''}
          organizationId={organization.id}
          attendeeId={user.id}
          preselectedData={preselectedData}
        />
      )}
    </PageContainer>
  );
}
