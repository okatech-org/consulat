'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
import { SendMessageDialog } from './_components/send-message-dialog';
import type { Id } from '@/convex/_generated/dataModel';

export default function UserDetailsPage() {
  const { id } = useParams<{ id: Id<'users'> }>();
  const t = useTranslations('sa.users');

  const { formatDate } = useDateLocale();

  const user = useQuery(api.functions.user.getUserById, id ? { id } : 'skip');
  const isLoading = user === undefined;

  if (isLoading) {
    return (
      <PageContainer title="Chargement...">
        <CardContainer>
          <LoadingSkeleton variant="grid" rows={3} columns={2} />
        </CardContainer>
      </PageContainer>
    );
  }

  if (!user) {
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
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      case 'agent':
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

  const isStaffMember = user.roles?.some((role) =>
    ['admin', 'manager', 'agent'].includes(role as string),
  );
  const isUser = user.roles?.includes('user' as any);

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold">
                      {user.name || 'Nom non défini'}
                    </h2>
                    <Badge variant={getRoleVariant(user.roles?.[0] || 'user')}>
                      {t(
                        `form.role.options.${user.roles?.[0] || 'user'}`,
                      )}
                    </Badge>
                  </div>

                  <SendMessageDialog
                    user={{
                      id: user._id,
                      name: user.name,
                      email: (user.email ?? null) as string | null,
                      phoneNumber: (user.phoneNumber ?? null) as string | null,
                    }}
                  />
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
                    <span>Créé le {formatDate(new Date(user._creationTime), 'dd/MM/yyyy')}</span>
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
            {isUser && user.childProfiles.length > 0 && (
              <TabsTrigger value="childProfiles">Enfants ({user.childProfiles.length})</TabsTrigger>
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
                      <Badge variant={getRoleVariant(user.roles?.[0] || 'user')}>
                        {t(
                          `form.role.options.${user.roles?.[0] || 'user'}`,
                        )}
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
                          {t(`form.role.options.${role}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Créé le
                    </label>
                    <p className="mt-1">
                      {formatDate(new Date(user._creationTime), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Dernière modification
                    </label>
                    <p className="mt-1">
                      {formatDate(new Date(user._creationTime), 'dd/MM/yyyy HH:mm')}
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
                      profileId={user.profile._id}
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
                        {user.profile.personal?.firstName && user.profile.personal?.lastName
                          ? `${user.profile.personal.firstName} ${user.profile.personal.lastName}`
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
                            user.profile.status === 'active' ? 'default' : 'warning'
                          }
                        >
                          {user.profile.status}
                        </Badge>
                      </p>
                    </div>

                    {user.profile.consularCard?.cardNumber && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Numéro de carte
                        </label>
                        <p className="mt-1 font-mono">{user.profile.consularCard.cardNumber}</p>
                      </div>
                    )}

                    {user.profile.consularCard?.cardIssuedAt && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Carte émise le
                        </label>
                        <p className="mt-1">
                          {formatDate(new Date(user.profile.consularCard.cardIssuedAt), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    )}

                    {user.profile.consularCard?.cardExpiresAt && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Carte expire le
                        </label>
                        <p className="mt-1">
                          {formatDate(new Date(user.profile.consularCard.cardExpiresAt), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Onglet Enfants (Profils des enfants) */}
          {isUser && user.childProfiles.length > 0 && (
            <TabsContent value="childProfiles">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {user.childProfiles.map((childProfile) => (
                    <Card key={childProfile._id}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>
                            {childProfile.personal?.firstName} {childProfile.personal?.lastName}
                          </span>
                          <Badge
                            variant={
                              childProfile.status === 'active' ? 'default' : 'warning'
                            }
                          >
                            {childProfile.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {childProfile.personal?.birthDate && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Date de naissance
                            </label>
                            <p className="mt-1">
                              {formatDate(new Date(childProfile.personal.birthDate), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        )}

                        {childProfile.personal?.birthPlace && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Lieu de naissance
                            </label>
                            <p className="mt-1">{childProfile.personal.birthPlace}</p>
                          </div>
                        )}

                        {childProfile.personal?.gender && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Genre
                            </label>
                            <p className="mt-1 capitalize">{childProfile.personal.gender}</p>
                          </div>
                        )}

                        {childProfile.consularCard?.cardNumber && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Numéro de carte consulaire
                            </label>
                            <p className="mt-1 font-mono">{childProfile.consularCard.cardNumber}</p>
                          </div>
                        )}

                        {childProfile.consularCard?.cardIssuedAt && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Carte émise le
                            </label>
                            <p className="mt-1">
                              {formatDate(new Date(childProfile.consularCard.cardIssuedAt), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        )}

                        {childProfile.consularCard?.cardExpiresAt && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Carte expire le
                            </label>
                            <p className="mt-1">
                              {formatDate(new Date(childProfile.consularCard.cardExpiresAt), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        )}

                        {childProfile.parents && childProfile.parents.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Parent/Responsable
                            </label>
                            <p className="mt-1 text-sm">
                              {(childProfile.parents?.[0]?.role as string) || 'Non spécifié'}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
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

                  {user.roles?.includes('manager' as any) && (
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
                            key={request._id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{request.service?.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>{request.priority}</span>
                                <span>•</span>
                                <span>{formatDate(new Date(request.metadata?.submittedAt || request._creationTime), 'dd/MM/yyyy')}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  request.priority === 'urgent'
                                    ? 'destructive'
                                    : 'outline'
                                }
                              >
                                {request.priority}
                              </Badge>
                              <Badge variant="outline">{request.status}</Badge>
                              <Link
                                href={ROUTES.dashboard.service_requests(request._id)}
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
                            key={request._id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <p className="font-medium">{request.service?.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>{request.priority}</span>
                                <span>•</span>
                                <span>{formatDate(new Date(request.metadata?.submittedAt || request._creationTime), 'dd/MM/yyyy')}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  request.priority === 'urgent'
                                    ? 'destructive'
                                    : 'outline'
                                }
                              >
                                {request.priority}
                              </Badge>
                              <Badge variant="outline">{request.status}</Badge>
                              <Link
                                href={ROUTES.dashboard.service_requests(request._id)}
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
                                user.assignedOrganization.status === 'active'
                                  ? 'default'
                                  : 'warning'
                              }
                            >
                              {user.assignedOrganization.status}
                            </Badge>
                          </p>
                        </div>

                        <Link
                          href={ROUTES.sa.edit_organization(user.assignedOrganization._id)}
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
                                user.managedOrganization.status === 'active'
                                  ? 'default'
                                  : 'warning'
                              }
                            >
                              {user.managedOrganization.status}
                            </Badge>
                          </p>
                        </div>

                        <Link
                          href={ROUTES.sa.edit_organization(user.managedOrganization._id)}
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
