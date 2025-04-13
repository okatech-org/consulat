import { getTranslations } from 'next-intl/server';
import { getNotifications } from '@/actions/notifications';
import { getUserAppointments } from '@/actions/appointments';
import { getServiceRequestsByUser } from '@/actions/service-requests';
import { calculateProfileCompletion } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowRight, Calendar, Clock, FileText, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserFullProfileById } from '@/lib/user/getters';
import { auth } from '@/auth';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';

export default async function UserDashboard() {
  const t_common = await getTranslations('common');
  const t = await getTranslations('user.dashboard');
  const t_profile = await getTranslations('profile.dashboard');
  const t_dashboard = await getTranslations('dashboard');
  const t_notifications = await getTranslations('notifications');

  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Fetch user profile
  const userProfile = await getUserFullProfileById(session.user.profileId ?? '');

  // Calculate profile completion percentage
  const profileCompletion = userProfile ? calculateProfileCompletion(userProfile) : 0;

  // Get missing documents
  const missingDocuments = [];
  if (userProfile) {
    if (!userProfile.identityPicture) missingDocuments.push('identity_photo');
    if (!userProfile.passport) missingDocuments.push('passport');
    if (!userProfile.birthCertificate) missingDocuments.push('birth_certificate');
    if (!userProfile.residencePermit) missingDocuments.push('residence_permit');
    if (!userProfile.addressProof) missingDocuments.push('proof_of_address');
  }

  // Fetch user service requests
  const serviceRequests = await getServiceRequestsByUser(session.user.id);

  // Fetch user appointments
  const appointmentsResponse = await getUserAppointments({ userId: session.user.id });
  const appointments = appointmentsResponse.data || {
    upcoming: [],
    past: [],
    cancelled: [],
  };

  // Fetch recent notifications
  const notifications = await getNotifications();
  const recentNotifications = notifications.slice(0, 5);

  return (
    <PageContainer
      title={t('title')}
      description={t_profile('welcome', {
        name: session.user.name || '',
      })}
      action={
        <Button asChild>
          <Link href={ROUTES.user.profile}>
            <UserIcon className="size-icon" />
            <span className={'ml-1 hidden sm:inline'}>
              {t_profile('actions.complete_profile')}
            </span>
          </Link>
        </Button>
      }
    >
      <div className="grid lg:grid-cols-6 gap-6">
        <div className="flex flex-col gap-4 lg:col-span-4">
          {/* Profile Status */}
          <CardContainer
            title={t_profile('stats.profile.title')}
            subtitle={
              userProfile?.status
                ? t_common(`status.${userProfile.status}`)
                : t_dashboard('sections.profile.status.pending')
            }
            footerContent={
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={ROUTES.user.profile}>
                  {t_profile('actions.complete_profile')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t_profile('stats.profile.completion')}</span>
                  <span className="font-medium">{profileCompletion}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>

              {missingDocuments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t_dashboard('sections.profile.missing_fields')}
                  </p>
                  <ul className="text-sm space-y-1">
                    {missingDocuments.slice(0, 3).map((doc, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-destructive/70" />
                        <span>
                          {/* @ts-expect-error - Using string literal for translation key */}
                          {t_dashboard(`sections.profile.fields.${doc}`)}
                        </span>
                      </li>
                    ))}
                    {missingDocuments.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        {t_dashboard('sections.profile.and_more', {
                          count: missingDocuments.length - 3,
                        })}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContainer>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recent Requests */}
            <CardContainer
              title={t_profile('stats.requests.title')}
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href={ROUTES.user.requests}>{t_profile('actions.see_all')}</Link>
                </Button>
              }
              headerClass="pb-2"
              footerContent={
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={ROUTES.user.requests}>
                    {t_profile('actions.track_requests')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              }
              className="w-full"
            >
              <div className="space-y-4">
                {serviceRequests.length > 0 ? (
                  <div className="space-y-4">
                    {serviceRequests.slice(0, 3).map((request) => (
                      <div
                        key={request.id}
                        className="flex items-start space-x-3 border-b pb-3 last:border-0"
                      >
                        <div className="rounded-md bg-primary/10 p-2">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{request.service.name}</p>
                            <Badge
                              variant={
                                request.status === 'COMPLETED'
                                  ? 'success'
                                  : [
                                        'VALIDATED',
                                        'CARD_IN_PRODUCTION',
                                        'READY_FOR_PICKUP',
                                        'APPOINTMENT_SCHEDULED',
                                      ].includes(request.status)
                                    ? 'default'
                                    : 'secondary'
                              }
                              className="min-w-max"
                            >
                              {t_common(`status.${request.status}`)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(request.createdAt), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Aucune donnée</p>
                  </div>
                )}
              </div>
            </CardContainer>

            {/* Upcoming Appointments */}
            <CardContainer
              title={t_profile('stats.appointments.title')}
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href={ROUTES.user.appointments}>
                    {t_profile('actions.see_all')}
                  </Link>
                </Button>
              }
              headerClass="pb-2"
              footerContent={
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={ROUTES.user.appointments}>
                    {t_profile('stats.appointments.schedule')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              }
              className="w-full"
            >
              <div className="space-y-4">
                {appointments.upcoming.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.upcoming.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-start space-x-3 border-b pb-3 last:border-0"
                      >
                        <div className="rounded-md bg-primary/10 p-2">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            {appointment.request?.service?.name ||
                              t('appointments.title')}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>
                              {format(new Date(appointment.date), 'dd MMM yyyy')} -{' '}
                              {format(new Date(appointment.startTime), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      {t_profile('stats.appointments.no_upcoming')}
                    </p>
                  </div>
                )}
              </div>
            </CardContainer>
          </div>
        </div>

        {/* Recent Notifications */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t_notifications('title')}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.user.notifications}>{t_profile('actions.see_all')}</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {recentNotifications.length > 0 ? (
              <div className="flex flex-col gap-4">
                {recentNotifications.map((notification) => (
                  <CardContainer
                    key={notification.id}
                    className={notification.read ? 'bg-card/50' : 'shadow-md'}
                    title={
                      <div className="flex justify-between gap-1">
                        <span className="text-base">{notification.title}</span>
                        {!notification.read && (
                          <Badge variant="info" className="min-w-max">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                    }
                    subtitle={
                      <span className="text-xs">
                        {format(new Date(notification.createdAt), 'dd MMM yyyy - HH:mm')}
                      </span>
                    }
                    headerClass="pb-2"
                  >
                    <p className="text-sm">{notification.message}</p>
                  </CardContainer>
                ))}
              </div>
            ) : (
              <CardContainer>
                <div className="text-center py-6">
                  <p className="text-muted-foreground">{t_notifications('empty')}</p>
                </div>
              </CardContainer>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
