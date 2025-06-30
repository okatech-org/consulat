import { getNotifications } from '@/actions/notifications';
import { getUserAppointments } from '@/actions/appointments';
import { getServiceRequestsByUser } from '@/actions/service-requests';
import { calculateProfileCompletion } from '@/lib/utils';
import { getUserFullProfileById } from '@/lib/user/getters';
import { PageContainer } from '@/components/layouts/page-container';
import { UserSpaceNavigation } from '@/components/layouts/user-space-navigation';
import { ProfileStatusCard } from '@/components/user/profile-status-card';
import { RequestsTimeline } from '@/components/user/requests-timeline';
import CardContainer from '@/components/layouts/card-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Bell, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

export default async function UserDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Fetch user profile
  const userProfile = await getUserFullProfileById(session.user.id);

  console.log({ userProfile, session });

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
  const serviceRequestsData = await getServiceRequestsByUser(session.user.id);

  // Transform service requests to match expected interface
  const serviceRequests = serviceRequestsData.map((request) => ({
    id: request.id,
    service: {
      name: request.service.name,
    },
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt?.toISOString(),
  }));

  // Fetch user appointments
  const appointmentsResponse = await getUserAppointments({ userId: session.user.id });
  const appointments = appointmentsResponse.data || {
    upcoming: [],
    past: [],
    cancelled: [],
  };

  // Fetch recent notifications
  const notifications = await getNotifications();
  const recentNotifications = notifications.slice(0, 3);

  // Déterminer les actions urgentes
  const urgentActions = [];

  // Profil incomplet
  if (profileCompletion < 75) {
    urgentActions.push({
      title: 'Compléter votre profil',
      description: `Il vous manque ${100 - profileCompletion}% pour finaliser`,
      href: ROUTES.user.profile,
      variant: 'urgent' as const,
    });
  }

  // Documents manquants critiques
  if (missingDocuments.length > 3) {
    urgentActions.push({
      title: 'Documents manquants',
      description: `${missingDocuments.length} documents à fournir`,
      href: ROUTES.user.documents,
      variant: 'important' as const,
    });
  }

  // Demandes avec actions requises
  const pendingRequests = serviceRequests.filter(
    (req) => req.status === 'REJECTED' || req.status === 'READY_FOR_PICKUP',
  );
  if (pendingRequests.length > 0) {
    urgentActions.push({
      title: 'Demandes nécessitant une action',
      description: `${pendingRequests.length} demande${pendingRequests.length > 1 ? 's' : ''} en attente`,
      href: ROUTES.user.requests,
      variant: 'important' as const,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <PageContainer className="max-w-7xl mx-auto">
        {/* Navigation contextuelle */}
        <UserSpaceNavigation className="mb-6" />

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Zone principale - Informations critiques */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero Zone - Statut du profil avec actions prioritaires */}
            <ProfileStatusCard
              profileCompletion={profileCompletion}
              profileStatus={userProfile?.status}
              missingDocuments={missingDocuments}
              userName={session.user.name || undefined}
              urgentActions={urgentActions}
              className="border-2 shadow-lg"
            />

            {/* Timeline des demandes */}
            <RequestsTimeline requests={serviceRequests} maxVisible={4} />

            {/* Prochains rendez-vous */}
            {appointments.upcoming.length > 0 && (
              <CardContainer
                title="Prochains rendez-vous"
                action={
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={ROUTES.user.appointments}
                      className="flex items-center gap-1"
                    >
                      <span>Voir tout</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                }
              >
                <div className="space-y-4">
                  {appointments.upcoming.slice(0, 2).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-md">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {appointment.request?.service?.name || 'Rendez-vous'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(appointment.date), 'dd MMM yyyy à HH:mm', {
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={ROUTES.user.appointments}>Gérer</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContainer>
            )}
          </div>

          {/* Sidebar - Notifications et actions rapides */}
          <div className="lg:col-span-4 space-y-6">
            {/* Notifications prioritaires */}
            <CardContainer
              title={
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {notifications.filter((n) => !n.read).length}
                    </Badge>
                  )}
                </div>
              }
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link href={ROUTES.user.notifications}>Voir tout</Link>
                </Button>
              }
            >
              <div className="space-y-3">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                        notification.read
                          ? 'bg-muted/50 border-border'
                          : 'bg-primary/5 border-primary/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm text-foreground line-clamp-1">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.createdAt), 'dd MMM', {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Aucune notification récente
                    </p>
                  </div>
                )}
              </div>
            </CardContainer>

            {/* Actions rapides */}
            <CardContainer title="Actions rapides">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={ROUTES.user.services}>
                    <FileText className="h-4 w-4 mr-2" />
                    Nouvelle demande
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={ROUTES.user.appointments}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Prendre rendez-vous
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={ROUTES.user.documents}>
                    <FileText className="h-4 w-4 mr-2" />
                    Mes documents
                  </Link>
                </Button>
              </div>
            </CardContainer>

            {/* Aide contextuelle */}
            <CardContainer
              title={<span className="text-blue-800">Besoin d'aide ?</span>}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            >
              <div className="space-y-3">
                <p className="text-sm text-blue-800">
                  Notre équipe est là pour vous accompagner dans vos démarches.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Guide d&apos;utilisation
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={ROUTES.user.feedback}>Contacter le support</Link>
                  </Button>
                </div>
              </div>
            </CardContainer>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
