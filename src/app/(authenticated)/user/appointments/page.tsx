import { getCurrentUser } from '@/actions/user';
import { AppointmentsTabs } from '@/components/appointments/appointments-tabs';
import { AppointmentsHeader } from '@/components/appointments/appointments-header';
import { ROUTES } from '@/schemas/routes';
import { redirect } from 'next/navigation';

export default async function UserAppointmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.login);
  }

  return (
    <div className="container space-y-8 py-6">
      <AppointmentsHeader />
      <div className="space-y-6">
        <AppointmentsTabs />
      </div>
    </div>
  );
}
