'use client';

import { RescheduleAppointmentForm } from '@/components/appointments/reschedule-appointment-form';
import { ErrorCard } from '@/components/ui/error-card';
import { useAppointment } from '@/hooks/use-appointments';
import { useTranslations } from 'next-intl';

interface RescheduleAppointmentPageClientProps {
  appointmentId: string;
}

export default function RescheduleAppointmentPageClient({
  appointmentId,
}: RescheduleAppointmentPageClientProps) {
  const t = useTranslations('appointments');
  const { appointment, isLoading, error } = useAppointment(appointmentId);

  if (error) {
    return (
      <ErrorCard
        title={t('reschedule.error.not_found')}
        description={t('reschedule.error.not_found_description')}
      />
    );
  }

  if (isLoading) {
    return null; // Le skeleton est géré par Suspense
  }

  if (!appointment) {
    return (
      <ErrorCard
        title={t('reschedule.error.not_found')}
        description={t('reschedule.error.not_found_description')}
      />
    );
  }

  return <RescheduleAppointmentForm appointment={appointment} />;
}
