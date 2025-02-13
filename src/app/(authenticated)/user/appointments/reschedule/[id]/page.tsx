import { getAppointment } from '@/actions/appointments';
import { RescheduleAppointmentForm } from '@/components/appointments/reschedule-appointment-form';
import { ErrorCard } from '@/components/ui/error-card';
import { getTranslations } from 'next-intl/server';

interface RescheduleAppointmentPageProps {
  params: {
    id: string;
  };
}

export default async function RescheduleAppointmentPage({
  params,
}: RescheduleAppointmentPageProps) {
  const t = await getTranslations('appointments');
  const appointment = await getAppointment(params.id);

  if (!appointment) {
    return (
      <ErrorCard
        title={t('reschedule.error.not_found')}
        description={t('reschedule.error.not_found_description')}
      />
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('reschedule.title')}</h1>
        <p className="text-muted-foreground">{t('reschedule.description')}</p>
      </div>

      <RescheduleAppointmentForm appointment={appointment} />
    </div>
  );
}
