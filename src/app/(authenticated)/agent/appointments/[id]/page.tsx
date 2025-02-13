import { getAppointment } from '@/actions/appointments';
import { ErrorCard } from '@/components/ui/error-card';
import { getTranslations } from 'next-intl/server';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { cn } from '@/lib/utils';

interface AppointmentPageProps {
  params: {
    id: string;
  };
}

export default async function AppointmentPage({ params }: AppointmentPageProps) {
  const t = await getTranslations('appointments');
  const commonT = await getTranslations('common');
  const appointment = await getAppointment(params.id);

  if (!appointment) {
    return (
      <ErrorCard
        title={t('error.not_found')}
        description={t('error.not_found_description')}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'MISSED':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'PENDING':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      case 'RESCHEDULED':
        return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href={ROUTES.agent.appointments}>
            <ArrowLeft className="mr-2 size-4" />
            {t('actions.back')}
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('details.title')}</h1>
            <p className="text-muted-foreground">
              {t('details.subtitle', { id: appointment.id })}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn('text-base', getStatusColor(appointment.status))}
          >
            {commonT(`status.${appointment.status.toLowerCase()}`)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('details.service')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">
                {appointment.request?.service.name ?? t('service.placeholder')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {appointment.organization.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{t(`type.options.${appointment.type}`)}</Badge>
              <Badge variant="outline">
                {t('duration', { duration: appointment.duration })}
              </Badge>
            </div>
            {appointment.instructions && (
              <div className="rounded-lg border p-4">
                <p className="text-sm">{appointment.instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('details.attendee')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <User className="size-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {appointment.attendee.firstName} {appointment.attendee.lastName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('details.datetime')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Calendar className="size-4 text-muted-foreground" />
              <p>
                {format(new Date(appointment.date), 'EEEE d MMMM yyyy', {
                  locale: fr,
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="size-4 text-muted-foreground" />
              <p>
                {format(appointment.startTime, 'HH:mm')} -{' '}
                {format(appointment.endTime, 'HH:mm')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('details.location')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <MapPin className="size-4 text-muted-foreground" />
              <p>{appointment.organization.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
