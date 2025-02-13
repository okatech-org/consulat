import { getCurrentUser } from '@/actions/user';
import { AppointmentsTabs } from '@/components/appointments/appointments-tabs';
import { AppointmentsHeader } from '@/components/appointments/appointments-header';
import { getUserAppointments } from '@/actions/appointments';
import { ErrorCard } from '@/components/ui/error-card';

export default async function UserAppointmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return undefined;
  }

  const { error, data } = await getUserAppointments({ userId: user.id });

  if (error) {
    return <ErrorCard title="Erreur lors de la récupération des rendez-vous" />;
  }

  return (
    <div className="container space-y-8 py-6">
      <AppointmentsHeader />
      <div className="space-y-6">
        <AppointmentsTabs
          appointments={data ?? { upcoming: [], past: [], cancelled: [] }}
        />
      </div>
    </div>
  );
}
