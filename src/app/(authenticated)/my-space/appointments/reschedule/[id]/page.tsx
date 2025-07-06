'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { ROUTES } from '@/schemas/routes';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { RescheduleAppointmentForm } from '@/components/appointments/reschedule-appointment-form';
import { ErrorCard } from '@/components/ui/error-card';
import { useAppointment } from '@/hooks/use-appointments';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function RescheduleAppointmentPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations('appointments');

  const { appointment, isLoading, error } = useAppointment(params.id);

  return (
    <PageContainer
      title={t('reschedule.title')}
      description={t('reschedule.description')}
      action={
        <Link
          href={ROUTES.user.appointments}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-icon" />
          {t('actions.back')}
        </Link>
      }
    >
      {isLoading && <LoadingSkeleton variant="grid" />}
      {(!appointment && !isLoading) ||
        (error && (
          <ErrorCard
            title={t('reschedule.error.not_found')}
            description={t('reschedule.error.not_found_description')}
          />
        ))}
      {appointment && !isLoading && (
        <RescheduleAppointmentForm appointment={appointment} />
      )}
    </PageContainer>
  );
}
