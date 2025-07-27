'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { NotFoundComponent } from '@/components/ui/not-found';
import { Badge } from '@/components/ui/badge';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  Users,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useDateLocale } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ProfileLookupSheet } from '@/components/profile/profile-lookup-sheet';

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('sa.users');

  const { formatDate } = useDateLocale();

  const {
    data: user,
    isLoading,
    error,
  } = api.user.getById.useQuery({ id }, { enabled: !!id });

  if (isLoading) {
    return (
      <PageContainer title="Chargement...">
        <CardContainer>
          <LoadingSkeleton variant="grid" rows={3} columns={2} />
        </CardContainer>
      </PageContainer>
    );
  }

  if (error || !user) {
    return (
      <PageContainer title="Utilisateur non trouvé">
        <CardContainer>
          <NotFoundComponent />
        </CardContainer>
      </PageContainer>
    );
  }

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'destructive';
      case 'ADMIN':
        return 'default';
      case 'MANAGER':
        return 'secondary';
      case 'AGENT':
        return 'outline';
      default:
        return 'warning';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isStaffMember = ['ADMIN', 'MANAGER', 'AGENT'].includes(user.role);
  const isUser = user.role === 'USER';

  return (
    <PageContainer title={user.name || 'Utilisateur sans nom'}>
      <div className="space-y-6">
        {/* En-tête utilisateur */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold">{user.name || 'Nom non défini'}</h2>
                  <Badge variant={getRoleVariant(user.role)}>
                    {t(`form.role.options.${user.role.toLowerCase()}`)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {user.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                      {user.emailVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}

                  {user.phoneNumber && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{user.phoneNumber}</span>
                      {user.phoneNumberVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Créé le {formatDate(user.createdAt, 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            {isUser && user.profile && (
              <TabsTrigger value="profile">Profil consulaire</TabsTrigger>
            )}
            {(isUser || isStaffMember) && (
              <TabsTrigger value="requests">Demandes</TabsTrigger>
            )}
            {isStaffMember && (
              <TabsTrigger value="organization">Organisation</TabsTrigger>
            )}
          </TabsList>

          {/* Onglet Informations générales */}
          <TabsContent value="general">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Informations personnelles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Nom complet
                    </label>
                    <p className="mt-1">{user.name || '-'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="mt-1 flex items-center space-x-2">
                      <span>{user.email || '-'}</span>
                      {user.email &&
                        (user.emailVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ))}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Téléphone
                    </label>
                    <p className="mt-1 flex items-center space-x-2">
                      <span>{user.phoneNumber || '-'}</span>
                      {user.phoneNumber &&
                        (user.phoneNumberVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ))}
                    </p>
                  </div>

                  {user.country && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Pays lié
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <img
                          src={`https://flagcdn.com/${user.country.code.toLowerCase()}.svg`}
                          alt={user.country.name}
                          className="w-6 h-4 rounded object-cover"
                        />
                        <span>{user.country.name}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Système</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Rôle principal
                    </label>
                    <p className="mt-1">
                      <Badge variant={getRoleVariant(user.role)}>
                        {t(`form.role.options.${user.role.toLowerCase()}`)}
                      </Badge>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Rôles additionnels
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {t(`form.role.options.${role.toLowerCase()}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Créé le
                    </label>
                    <p className="mt-1">
                      {formatDate(user.createdAt, 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Dernière modification
                    </label>
                    <p className="mt-1">
                      {formatDate(user.updatedAt, 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Profil consulaire (pour les USER uniquement) */}
          {isUser && user.profile && (
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Profil consulaire</span>
                    </div>
                    <ProfileLookupSheet
                      profileId={user.profile.id}
                      triggerLabel="Voir le profil complet"
                      triggerVariant="outline"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Nom complet
                      </label>
                      <p className="mt-1">
                        {user.profile.firstName && user.profile.lastName
                          ? `${user.profile.firstName} ${user.profile.lastName}`
                          : '-'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Statut
                      </label>
                      <p className="mt-1">
                        <Badge
                          variant={
                            user.profile.status === 'VALIDATED' ? 'default' : 'warning'
                          }
                        >
                          {user.profile.status}
                        </Badge>
                      </p>
                    </div>

                    {user.profile.cardNumber && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Numéro de carte
                        </label>
                        <p className="mt-1 font-mono">{user.profile.cardNumber}</p>
                      </div>
                    )}

                    {user.profile.cardIssuedAt && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Carte émise le
                        </label>
                        <p className="mt-1">
                          {formatDate(user.profile.cardIssuedAt, 'dd/MM/yyyy')}
                        </p>
                      </div>
                    )}

                    {user.profile.cardExpiresAt && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Carte expire le
                        </label>
                        <p className="mt-1">
                          {formatDate(user.profile.cardExpiresAt, 'dd/MM/yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Onglet Demandes */}
          {(isUser || isStaffMember) && (
            <TabsContent value="requests">
              <div className="space-y-6">
                {/* Statistiques */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">
                            {user._count.submittedRequests}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Demandes soumises
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {isStaffMember && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Users className="h-8 w-8 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold">
                              {user._count.assignedRequests}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Demandes assignées
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {user.role === 'MANAGER' && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Users className="h-8 w-8 text-purple-500" />
                          <div>
                            <p className="text-2xl font-bold">
                              {user._count.managedAgents}
                            </p>
                            <p className="text-sm text-muted-foreground">Agents gérés</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Demandes récentes */}
                {user.submittedRequests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Demandes soumises récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user.submittedRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{request.service.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>{request.serviceCategory}</span>
                                <span>•</span>
                                <span>{formatDate(request.createdAt, 'dd/MM/yyyy')}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  request.priority === 'URGENT'
                                    ? 'destructive'
                                    : 'outline'
                                }
                              >
                                {request.priority}
                              </Badge>
                              <Badge variant="outline">{request.status}</Badge>
                              <Link
                                href={ROUTES.dashboard.service_requests(request.id)}
                                className={buttonVariants({
                                  variant: 'ghost',
                                  size: 'sm',
                                })}
                              >
                                Voir
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Demandes assignées pour le staff */}
                {isStaffMember && user.assignedRequests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Demandes assignées récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user.assignedRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{request.service.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>{request.serviceCategory}</span>
                                <span>•</span>
                                <span>{formatDate(request.createdAt, 'dd/MM/yyyy')}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  request.priority === 'URGENT'
                                    ? 'destructive'
                                    : 'outline'
                                }
                              >
                                {request.priority}
                              </Badge>
                              <Badge variant="outline">{request.status}</Badge>
                              <Link
                                href={ROUTES.dashboard.service_requests(request.id)}
                                className={buttonVariants({
                                  variant: 'ghost',
                                  size: 'sm',
                                })}
                              >
                                Traiter
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}

          {/* Onglet Organisation (pour le staff) */}
          {isStaffMember && (
            <TabsContent value="organization">
              <div className="space-y-6">
                {user.assignedOrganization && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building className="h-5 w-5" />
                        <span>Organisation assignée</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Nom
                          </label>
                          <p className="mt-1 font-medium">
                            {user.assignedOrganization.name}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Type
                          </label>
                          <p className="mt-1">
                            <Badge variant="outline">
                              {user.assignedOrganization.type}
                            </Badge>
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Statut
                          </label>
                          <p className="mt-1">
                            <Badge
                              variant={
                                user.assignedOrganization.status === 'ACTIVE'
                                  ? 'default'
                                  : 'warning'
                              }
                            >
                              {user.assignedOrganization.status}
                            </Badge>
                          </p>
                        </div>

                        <Link
                          href={ROUTES.sa.edit_organization(user.assignedOrganization.id)}
                          className={buttonVariants({ variant: 'outline' })}
                        >
                          Voir l&apos;organisation
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.managedOrganization && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Organisation gérée</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Nom
                          </label>
                          <p className="mt-1 font-medium">
                            {user.managedOrganization.name}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Type
                          </label>
                          <p className="mt-1">
                            <Badge variant="outline">
                              {user.managedOrganization.type}
                            </Badge>
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Statut
                          </label>
                          <p className="mt-1">
                            <Badge
                              variant={
                                user.managedOrganization.status === 'ACTIVE'
                                  ? 'default'
                                  : 'warning'
                              }
                            >
                              {user.managedOrganization.status}
                            </Badge>
                          </p>
                        </div>

                        <Link
                          href={ROUTES.sa.edit_organization(user.managedOrganization.id)}
                          className={buttonVariants({ variant: 'outline' })}
                        >
                          Gérer l&apos;organisation
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageContainer>
  );
}
