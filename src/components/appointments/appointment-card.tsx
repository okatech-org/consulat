import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DisplayDate } from '@/lib/utils';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentWithRelations } from '@/schemas/appointment';

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const t = useTranslations('appointments');
  const t_common = useTranslations('common');

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">
              {appointment.request?.service.name ?? t('type.options.OTHER')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t_common(
                `service_categories.${appointment.request?.service.category ?? 'OTHER'}`,
              )}
            </p>
          </div>
          <Badge variant={getStatusColor(appointment.status)}>
            {t_common(`status.${appointment.status.toLowerCase()}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span>{DisplayDate(appointment.date, 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <span>
              {DisplayDate(appointment.startTime, 'HH:mm')} -{' '}
              {DisplayDate(appointment.endTime, 'HH:mm')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <span>{appointment.organization.name}</span>
          </div>
          {appointment.agent && (
            <p className="text-sm text-muted-foreground">
              {t('agent')}: {appointment.agent.firstName} {appointment.agent.lastName}
            </p>
          )}
          {appointment.instructions && (
            <p className="text-sm text-muted-foreground">{appointment.instructions}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {appointment.status === 'CONFIRMED' && (
          <>
            <Button variant="outline" size="sm">
              {t('actions.reschedule')}
            </Button>
            <Button variant="destructive" size="sm">
              {t('actions.cancel')}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
