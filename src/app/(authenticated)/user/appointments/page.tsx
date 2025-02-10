import { getCurrentUser } from '@/actions/user';
import { AppointmentsTabs } from '@/components/appointments/appointments-tabs';
import { NewAppointmentForm } from '@/components/appointments/new-appointment-form';
import { ROUTES } from '@/schemas/routes';
import { redirect } from 'next/navigation';
import { getAvailableServices } from '../_utils/actions/appointments';
import { getOrganizationByCountry } from '@/actions/organizations';

export default async function UserAppointmentsPage() {
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
    <div className="container space-y-8 py-6">
      <div className="grid gap-8 md:grid-cols-[1fr_350px]">
        <div className="order-2 md:order-1">
          <AppointmentsTabs user={user} services={services} />
        </div>
        <div className="order-1 md:order-2">
          <NewAppointmentForm
            services={services}
            countryCode={user.countryCode ?? ''}
            organizationId={organization.id}
          />
        </div>
      </div>
    </div>
  );
}
