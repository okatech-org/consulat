'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDateLocale } from '@/lib/utils';
import { AppointmentStatus } from '@/convex/lib/constants';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { toast } from 'sonner';
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
import type { Doc } from '@/convex/_generated/dataModel';

interface AppointmentCardProps {
  appointment: Doc<'appointments'>;
  onUpdate?: () => void;
}

export function AppointmentCard({ appointment, onUpdate }: AppointmentCardProps) {
  const t = useTranslations('appointments');
  const t_common = useTranslations('common');
  const { formatDate } = useDateLocale();
  const router = useRouter();
  const cancelAppointment = useMutation(api.functions.appointment.cancelAppointment);

  const getStatusColor = (status: string) => {
    switch (status) {
      case AppointmentStatus.Confirmed:
        return 'default';
      case AppointmentStatus.Cancelled:
        return 'outline';
      case AppointmentStatus.Completed:
        return 'default';
      case AppointmentStatus.Missed:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleCancel = async () => {
    try {
      await cancelAppointment({ appointmentId: appointment._id });
      toast.success(t('notifications.appointment_cancelled'));
      router.refresh();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast.error(error?.message || t('notifications.cancel_failed'));
    }
  };

  const handleReschedule = () => {
    router.push(ROUTES.user.appointment_reschedule(appointment._id));
  };

  return (
    <CardContainer
      title={t(`types.${appointment.type}`)}
      subtitle={formatDate(new Date(appointment.startAt), 'PPP')}
      action={
        <Badge variant={getStatusColor(appointment.status)}>
          {t_common(`status.${appointment.status}`)}
        </Badge>
      }
      contentClass="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Calendar className="size-4 text-muted-foreground" />
        <span>{formatDate(new Date(appointment.startAt), 'PPP')}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <span>
          {formatDate(new Date(appointment.startAt), 'HH:mm')} -{' '}
          {formatDate(new Date(appointment.endAt), 'HH:mm')}
        </span>
      </div>
      {appointment.location && (
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" />
          <span>
            {appointment.location.city}, {appointment.location.country}
          </span>
        </div>
      )}
      {appointment.status === AppointmentStatus.Confirmed && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="mobile" onClick={handleReschedule}>
            {t('actions.reschedule')}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructiveOutline" size="mobile">
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
