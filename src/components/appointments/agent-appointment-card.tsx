'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Check, Clock, ExternalLink, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AppointmentStatus } from '@/convex/lib/constants';
import type { Doc } from '@/convex/_generated/dataModel';

interface AgentAppointmentCardProps {
  appointment: Doc<'appointments'> & {
    attendee?: { name: string } | null;
    service?: { name: string } | null;
  };
}

export function AgentAppointmentCard({ appointment }: AgentAppointmentCardProps) {
  const t = useTranslations('appointments');
  const commonT = useTranslations('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const completeAppointmentMutation = useMutation(
    api.functions.appointment.completeAppointment,
  );
  const missAppointmentMutation = useMutation(api.functions.appointment.missAppointment);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeAppointmentMutation({ appointmentId: appointment._id });
      toast.success(commonT('status.COMPLETED'));
      router.refresh();
    } catch (error) {
      toast.error(commonT('error.unknown'));
      console.error('Error completing appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMiss = async () => {
    setIsLoading(true);
    try {
      await missAppointmentMutation({ appointmentId: appointment._id });
      toast.success(commonT('status.MISSED'));
      router.refresh();
    } catch (error) {
      toast.error(commonT('error.unknown'));
      console.error('Error marking appointment as missed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Confirmed:
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case AppointmentStatus.Cancelled:
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case AppointmentStatus.Completed:
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case AppointmentStatus.Missed:
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case AppointmentStatus.Pending:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      case AppointmentStatus.Rescheduled:
        return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="space-y-2">
          <Badge
            variant="secondary"
            className={cn('mb-2', getStatusColor(appointment.status))}
          >
            {commonT(`status.${appointment.status}`)}
          </Badge>
          <h3 className="font-semibold">
            {t('appointmentWith', {
              name: `${appointment.attendee?.name ?? 'N/A'}`,
            })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {appointment.service?.name ?? t('type.options.OTHER')}
          </p>
          {appointment.attendee && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              <span>{appointment.attendee.name}</span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          asChild
          className="shrink-0"
          size="mobile"
          leftIcon={<ExternalLink />}
        >
          <Link href={`${ROUTES.dashboard.appointments}/${appointment._id}`}>
            <span>{'Voir les détails'}</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Clock className="size-4 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm">
              {format(new Date(appointment.startAt), 'EEEE d MMMM yyyy', {
                locale: fr,
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(appointment.startAt), 'HH:mm')} -{' '}
              {format(new Date(appointment.endAt), 'HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{t(`type.options.${appointment.type}`)}</Badge>
          <Badge variant="outline">
            {Math.round((appointment.endAt - appointment.startAt) / (1000 * 60))} min
          </Badge>
        </div>
      </CardContent>
      {appointment.status === AppointmentStatus.Confirmed && (
        <CardFooter className="gap-2">
          <Button
            variant="outline"
            size="mobile"
            leftIcon={<Check />}
            onClick={handleComplete}
            disabled={isLoading}
            loading={isLoading}
          >
            {commonT('status.COMPLETED')}
          </Button>
          <Button
            variant="outline"
            size="mobile"
            leftIcon={<X />}
            onClick={handleMiss}
            disabled={isLoading}
            loading={isLoading}
          >
            {commonT('status.MISSED')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
