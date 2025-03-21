import { getTranslations } from 'next-intl/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { getNotifications } from '@/actions/notifications';
import { getUserAppointments } from '@/actions/appointments';
import { getServiceRequestsByUser } from '@/actions/service-requests';
import { calculateProfileCompletion } from '@/lib/utils';
import { format } from 'date-fns';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  User,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserFullProfileById } from '@/lib/user/getters';
import { auth } from '@/auth';
import { PageContainer } from '@/components/layouts/page-container';

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

  // Count requests by status
  const pendingRequests = serviceRequests.filter((req) =>
    ['DRAFT', 'SUBMITTED', 'PENDING', 'PENDING_COMPLETION'].includes(req.status),
  ).length;

  const processingRequests = serviceRequests.filter((req) =>
    [
      'VALIDATED',
      'CARD_IN_PRODUCTION',
      'READY_FOR_PICKUP',
      'APPOINTMENT_SCHEDULED',
    ].includes(req.status),
  ).length;

  const completedRequests = serviceRequests.filter((req) =>
    ['COMPLETED'].includes(req.status),
  ).length;

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
      <div className="space-y-8">
        {/* Overview Stats */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('overview.title')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t_profile('stats.profile.title')}
              value={`${profileCompletion}%`}
              description={t_profile('stats.profile.completion')}
              icon={User}
              className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-blue-500 dark:text-blue-400"
            />
            <StatsCard
              title={t('overview.pending_requests')}
              value={pendingRequests}
              icon={Clock}
              className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-amber-500 dark:text-amber-400"
            />
            <StatsCard
              title={t('overview.processing_requests')}
              value={processingRequests}
              icon={FileText}
              className="bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-indigo-500 dark:text-indigo-400"
            />
            <StatsCard
              title={t('overview.completed_requests')}
              value={completedRequests}
              icon={CheckCircle}
              className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-green-500 dark:text-green-400"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Status */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t_profile('stats.profile.title')}</CardTitle>
              <CardDescription>
                {userProfile?.status
                  ? t_common(`status.${userProfile.status}`)
                  : t_dashboard('sections.profile.status.pending')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={ROUTES.user.profile}>
                  {t_profile('actions.complete_profile')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Requests */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{t_profile('stats.requests.title')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={ROUTES.user.requests}>{t_profile('actions.see_all')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={ROUTES.user.requests}>
                  {t_profile('actions.track_requests')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{t_profile('stats.appointments.title')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={ROUTES.user.appointments}>
                  {t_profile('actions.see_all')}
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          {appointment.request?.service?.name || t('appointments.title')}
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
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={ROUTES.user.appointments}>
                  {t_profile('stats.appointments.schedule')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Notifications */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t_notifications('title')}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.user.notifications}>{t_profile('actions.see_all')}</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {recentNotifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={notification.read ? 'bg-card/50' : 'shadow-md'}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        {!notification.read && (
                          <Badge variant="info" className="ml-2">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        {format(new Date(notification.createdAt), 'dd MMM yyyy - HH:mm')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{notification.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-6">
                  <p className="text-muted-foreground">{t_notifications('empty')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
