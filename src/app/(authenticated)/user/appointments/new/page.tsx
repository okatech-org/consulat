import { getCurrentUser } from '@/actions/user';
import { getAvailableServices } from '@/actions/appointments';
import { getOrganizationByCountry } from '@/actions/organizations';
import { ROUTES } from '@/schemas/routes';
import { redirect } from 'next/navigation';
import { NewAppointmentForm } from '@/components/appointments/new-appointment-form';

export default async function NewAppointmentPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.login);
  }

  const [services, organization] = await Promise.all([
    getAvailableServices(user.countryCode ?? ''),
    getOrganizationByCountry(user.countryCode ?? ''),
  ]);

  if (!organization) {
    // TODO: Handle no organization found for country
    return null;
  }

  return (
    <div className="container py-6">
      <div className="mx-auto max-w-2xl">
        <NewAppointmentForm
          services={services}
          countryCode={user.countryCode ?? ''}
          organizationId={organization.id}
        />
      </div>
    </div>
  );
}
