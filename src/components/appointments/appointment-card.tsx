import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDateLocale } from '@/lib/utils';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentWithRelations } from '@/schemas/appointment';
import { cancelAppointment } from '@/actions/appointments';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { useState } from 'react';
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

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const t = useTranslations('appointments');
  const t_common = useTranslations('common');
  const t_inputs = useTranslations('inputs');
  const { formatDate } = useDateLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      case 'COMPLETED':
        return 'default';
      case 'MISSED':
        return 'destructive';
      case 'RESCHEDULED':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      const result = await cancelAppointment(appointment.id);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = () => {
    router.push(`${ROUTES.user.appointments}/reschedule/${appointment.id}`);
  };

  return (
    <CardContainer
      title={appointment.request?.service.name ?? t('type.options.OTHER')}
      subtitle={t_inputs(
        `serviceCategory.options.${appointment.request?.service.category ?? 'OTHER'}`,
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
            disabled={isLoading}
          >
            {t('actions.reschedule')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="mobile" disabled={isLoading}>
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
