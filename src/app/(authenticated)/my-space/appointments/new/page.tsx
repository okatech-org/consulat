import { getCurrentUser } from '@/actions/user';
import { getAvailableServices } from '@/actions/appointments';
import { getOrganizationByCountry } from '@/actions/organizations';
import { ROUTES } from '@/schemas/routes';
import { redirect } from 'next/navigation';
import { NewAppointmentForm } from '@/components/appointments/new-appointment-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getRegistrationRequestDetailsById } from '@/actions/registrations';

interface NewAppointmentPageProps {
  searchParams: {
    serviceRequestId?: string;
    type?: string;
    serviceId?: string;
  };
}

function NewAppointmentHeader() {
  const t = useTranslations('appointments');

  return (
    <>
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.user.appointments}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('new.back')}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{t('new.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('new.description')}</p>
      </div>
    </>
  );
}

export default async function NewAppointmentPage({
  searchParams,
}: NewAppointmentPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(ROUTES.auth.login);
  }

  // Récupérer les informations pré-remplies si disponibles
  let preselectedData;
  if (searchParams.serviceRequestId) {
    const request = await getRegistrationRequestDetailsById(
      searchParams.serviceRequestId,
    );
    if (request) {
      preselectedData = {
        serviceId: request.serviceId,
        type: searchParams.type || 'WITHDRAW',
        requestId: request.id,
      };
    }
  } else if (searchParams.serviceId) {
    preselectedData = {
      serviceId: searchParams.serviceId,
      type: searchParams.type,
    };
  }

  const [services, organization] = await Promise.all([
    getAvailableServices(user.countryCode ?? ''),
    getOrganizationByCountry(user.countryCode ?? ''),
  ]);

  if (!organization) {
    return <div>No organization found for country</div>;
  }

  return (
    <div className="container space-y-8 py-6">
      <NewAppointmentHeader />
      <div className="mx-auto max-w-2xl">
        <NewAppointmentForm
          services={services}
          countryCode={user.countryCode ?? ''}
          organizationId={organization.id}
          attendeeId={user.id}
          preselectedData={preselectedData}
        />
      </div>
    </div>
  );
}
