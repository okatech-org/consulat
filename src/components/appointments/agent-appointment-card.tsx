'use client';

import { Appointment, AppointmentStatus } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Check, Clock, X } from 'lucide-react';
import { completeAppointment, missAppointment } from '@/actions/appointments';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AgentAppointmentCardProps {
  appointment: Appointment & {
    organization: {
      name: string;
    };
    request: {
      service: {
        name: string;
      };
    } | null;
  };
}

export function AgentAppointmentCard({ appointment }: AgentAppointmentCardProps) {
  const t = useTranslations('appointments');
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeAppointment(appointment.id);
      toast.success(t('status.completed'));
      router.refresh();
    } catch (error) {
      toast.error(t('error.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMiss = async () => {
    setIsLoading(true);
    try {
      await missAppointment(appointment.id);
      toast.success(t('status.missed'));
      router.refresh();
    } catch (error) {
      toast.error(t('error.failed'));
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
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <Badge
            variant="secondary"
            className={cn('mb-2', getStatusColor(appointment.status))}
          >
            {t(`status.${appointment.status.toLowerCase()}`)}
          </Badge>
          <h3 className="font-semibold">
            {appointment.request?.service.name ?? t('service.placeholder')}
          </h3>
          <p className="text-sm text-muted-foreground">{appointment.organization.name}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Clock className="size-4" />
          <p className="text-sm">
            {format(new Date(appointment.date), "EEEE d MMMM yyyy 'à' HH:mm", {
              locale: fr,
            })}
          </p>
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
            {t('actions.confirm')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleMiss}
            disabled={isLoading}
          >
            <X className="size-4" />
            {t('status.missed')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
