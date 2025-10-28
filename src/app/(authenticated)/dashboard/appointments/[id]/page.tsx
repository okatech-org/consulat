'use client';

import { ErrorCard } from '@/components/ui/error-card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layouts/page-container';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Id } from '@/convex/_generated/dataModel';
import { DisplayAddress } from '@/components/ui/display-address';
import { ProfileLookupSheet } from '@/components/profile/profile-lookup-sheet';
import { ParticipantRole } from '@/convex/lib/constants';

export default function AppointmentPage() {
  const params = useParams<{ id: Id<'appointments'> }>();
  const t = useTranslations('appointments');
  const commonT = useTranslations('common');
  const appointment = useQuery(api.functions.appointment.getAppointment, {
    appointmentId: params.id,
  });
  const service = useQuery(
    api.functions.service.getService,
    appointment?.serviceId ? { serviceId: appointment.serviceId } : 'skip',
  );
  const organization = useQuery(
    api.functions.organization.getOrganization,
    appointment?.organizationId ? { organizationId: appointment.organizationId } : 'skip',
  );

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

  const attendee = appointment.participants.find(
    (p) => p.role === ParticipantRole.Attendee,
  );

  return (
    <PageContainer
      title={t('details.title')}
      description={
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {t('details.subtitle', { id: appointment._id })}
          </p>
          <Badge
            variant="secondary"
            className={cn('text-base', getStatusColor(appointment.status))}
          >
            {commonT(`status.${appointment.status}`)}
          </Badge>
        </div>
      }
    >
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href={ROUTES.dashboard.appointments}>
            <ArrowLeft className="mr-2 size-4" />
            {t('actions.back')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('details.service')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">{service?.name}</h3>
              <p className="text-sm text-muted-foreground">{organization?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{t(`type.options.${appointment.type}`)}</Badge>
              <Badge variant="outline">
                {t('details.duration', { duration: appointment.startAt })}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {attendee && (
          <Card>
            <CardHeader>
              <CardTitle>{t('details.attendee')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileLookupSheet profileId={attendee.id as Id<'profiles'>} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('details.datetime')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Calendar className="size-4 text-muted-foreground" />
              <p>
                {format(new Date(appointment.startAt), 'EEEE d MMMM yyyy', {
                  locale: fr,
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="size-4 text-muted-foreground" />
              <p>
                {format(appointment.startAt, 'HH:mm')} -{' '}
                {format(appointment.endAt, 'HH:mm')}
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
              <DisplayAddress address={appointment.location} />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
