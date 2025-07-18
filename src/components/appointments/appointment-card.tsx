'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDateLocale } from '@/lib/utils';
import { AppointmentStatus, ServiceCategory } from '@prisma/client';
import { useAppointments } from '@/hooks/use-appointments';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import CardContainer from '../layouts/card-container';
import type { AppointmentListItem } from '@/server/api/routers/appointments/misc';

interface AppointmentCardProps {
  appointment: AppointmentListItem;
  onUpdate?: () => void;
}

export function AppointmentCard({ appointment, onUpdate }: AppointmentCardProps) {
  const t = useTranslations('appointments');
  const t_common = useTranslations('common');
  const t_inputs = useTranslations('inputs');
  const { formatDate } = useDateLocale();
  const router = useRouter();
  const { cancelAppointment } = useAppointments();

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default';
      case 'CANCELLED':
        return 'outline';
      case 'COMPLETED':
        return 'default';
      case 'MISSED':
        return 'outline';
      case 'RESCHEDULED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleCancel = () => {
    cancelAppointment.mutate({ id: appointment.id });
    // Appeler onUpdate après la mutation pour rafraîchir les données
    if (onUpdate) {
      // Petit délai pour laisser la mutation se terminer
      setTimeout(onUpdate, 500);
    }
  };

  const handleReschedule = () => {
    router.push(ROUTES.user.appointment_reschedule(appointment.id));
  };

  return (
    <CardContainer
      title={appointment.service?.name ?? t('type.options.OTHER')}
      subtitle={t_inputs(
        `serviceCategory.options.${appointment.service?.category ?? 'OTHER'}` as ServiceCategory,
      )}
      action={
        <Badge variant={getStatusColor(appointment.status)}>
          {t_common(`status.${appointment.status}`)}
        </Badge>
      }
      contentClass="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Calendar className="size-4 text-muted-foreground" />
        <span>{formatDate(appointment.date, 'PPP')}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <span>
          {formatDate(appointment.startTime, 'HH:mm')} -{' '}
          {formatDate(appointment.endTime, 'HH:mm')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-muted-foreground" />
        <span>{appointment.organization.name}</span>
      </div>
      {appointment.agent && (
        <p className="text-sm text-muted-foreground">
          {t('agent')}: {appointment.agent.name}
        </p>
      )}
      {appointment.instructions && (
        <p className="text-sm text-muted-foreground">{appointment.instructions}</p>
      )}
      {appointment.status === 'CONFIRMED' && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="mobile"
            onClick={handleReschedule}
            disabled={cancelAppointment.isLoading}
          >
            {t('actions.reschedule')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructiveOutline"
                size="mobile"
                disabled={cancelAppointment.isLoading}
              >
                {t('actions.cancel')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('cancel.title')}</AlertDialogTitle>
                <AlertDialogDescription>{t('cancel.description')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('actions.back')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  {t('actions.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </CardContainer>
  );
}
