import { getCurrentUser } from '@/actions/user';
import { AppointmentsTabs } from '@/components/appointments/appointments-tabs';
import { ROUTES } from '@/schemas/routes';
import { redirect } from 'next/navigation';
import { getAvailableServices } from '../_utils/actions/appointments';

export default async function UserAppointmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.login);
  }

  const services = await getAvailableServices(user.countryId ?? '');

  return (
    <div className="container space-y-6">
      <AppointmentsTabs user={user} services={services} />
    </div>
  );
}
