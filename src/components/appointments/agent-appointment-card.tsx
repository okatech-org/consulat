'use client';

import { AppointmentStatus } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Check, Clock, ExternalLink, User, X } from 'lucide-react';
import { completeAppointment, missAppointment } from '@/actions/appointments';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { AppointmentWithRelations } from '@/schemas/appointment';

interface AgentAppointmentCardProps {
  appointment: AppointmentWithRelations;
}

export function AgentAppointmentCard({ appointment }: AgentAppointmentCardProps) {
  const t = useTranslations('appointments');
  const commonT = useTranslations('common');
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeAppointment(appointment.id);
      toast({
        title: commonT('status.completed'),
        variant: 'success',
      });
      router.refresh();
    } catch {
      toast({
        title: commonT('error.unknown'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMiss = async () => {
    setIsLoading(true);
    try {
      await missAppointment(appointment.id);
      toast({
        title: commonT('status.missed'),
        variant: 'success',
      });
      router.refresh();
    } catch {
      toast({
        title: commonT('error.unknown'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case AppointmentStatus.CANCELLED:
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case AppointmentStatus.COMPLETED:
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case AppointmentStatus.MISSED:
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case AppointmentStatus.PENDING:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      case AppointmentStatus.RESCHEDULED:
        return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'confirmed';
      case AppointmentStatus.CANCELLED:
        return 'cancelled';
      case AppointmentStatus.COMPLETED:
        return 'completed';
      case AppointmentStatus.MISSED:
        return 'missed';
      case AppointmentStatus.PENDING:
        return 'pending';
      case AppointmentStatus.RESCHEDULED:
        return 'rescheduled';
      default:
        return 'pending';
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
            {commonT(`status.${getStatusText(appointment.status)}`)}
          </Badge>
          <h3 className="font-semibold">
            {t('appointmentWith', {
              name: `${appointment.attendee?.firstName ?? ''} ${appointment.attendee?.lastName ?? 'N/A'}`,
            })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {appointment.request?.service.name ?? t('type.options.OTHER')}
          </p>
          {appointment.attendee && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              <span>
                {appointment.attendee.firstName} {appointment.attendee.lastName}
              </span>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={`${ROUTES.agent.appointments}/${appointment.id}`}>
            <ExternalLink className="size-4" />
            <span className="sr-only">{commonT('actions.view')}</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Clock className="size-4 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm">
              {format(new Date(appointment.date), 'EEEE d MMMM yyyy', {
                locale: fr,
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(appointment.startTime, 'HH:mm')} -{' '}
              {format(appointment.endTime, 'HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{t(`type.options.${appointment.type}`)}</Badge>
          <Badge variant="outline">{appointment.duration} min</Badge>
        </div>
      </CardContent>
      {appointment.status === AppointmentStatus.CONFIRMED && (
        <CardFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleComplete}
            disabled={isLoading}
          >
            <Check className="size-4" />
            {commonT('status.completed')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleMiss}
            disabled={isLoading}
          >
            <X className="size-4" />
            {commonT('status.missed')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
