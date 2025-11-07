'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  User,
  Calendar,
  Shield,
  FileText,
  Eye,
  MapPin,
  Clock,
  Plus,
} from 'lucide-react';
import { IntelligenceNotesSection } from '@/components/intelligence/intelligence-notes-section';
import { IntelNavigationBar } from '@/components/intelligence/intel-navigation-bar';
import { ROUTES } from '@/schemas/routes';
import { IntelProfileDetailsSheet } from '@/components/intelligence/intel-profile-details-sheet';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useState, useCallback, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCurrentUser } from '@/hooks/use-current-user';

interface ProfileIntelligenceDetailsPageProps {
  profileId: string;
}

export function ProfileIntelligenceDetailsPage({
  profileId,
}: ProfileIntelligenceDetailsPageProps) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const [isProfileViewed, setIsProfileViewed] = useState(false);
  const [lastActivity] = useState<Date>(new Date());

  const profileData = useQuery(api.functions.intelligence.getProfileDetails, {
    profileId: profileId as Id<'profiles'>,
  });
  const profile = profileData;
  const isLoading = profileData === undefined;

  useEffect(() => {
    if (profile && !isProfileViewed) {
      setTimeout(() => {
        setIsProfileViewed(true);
        toast.info('Profil consulté', {
          description: 'Accès enregistré dans les logs de surveillance',
        });
      }, 2000);
    }
  }, [profile, isProfileViewed]);

  const handleReturnToProfiles = useCallback(() => {
    toast.success('Retour à la liste des profils');
    router.push(ROUTES.intel.profiles);
  }, [router]);

  if (isLoading) {
    return (
      <>
        <IntelNavigationBar
          currentPage="Chargement..."
          breadcrumbs={[{ label: 'Profils consulaires', href: '/intel/profiles' }]}
        />
        <div className="animate-pulse space-y-6">
          <div
            className="h-32 rounded-3xl"
            style={{
              background: 'var(--bg-glass-primary)',
              border: '1px solid var(--border-glass-primary)',
              boxShadow: 'var(--shadow-glass)',
            }}
          ></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div
                className="h-64 rounded-2xl border-l-4"
                style={{
                  background: 'var(--bg-glass-primary)',
                  border: '1px solid var(--border-glass-primary)',
                  boxShadow: 'var(--shadow-glass)',
                  borderLeftColor: '#f59e0b',
                }}
              ></div>
            </div>
            <div>
              <div
                className="h-48 rounded-2xl"
                style={{
                  background: 'var(--bg-glass-primary)',
                  border: '1px solid var(--border-glass-primary)',
                  boxShadow: 'var(--shadow-glass)',
                }}
              ></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 text-center py-16">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Profil non trouvé
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Le profil demandé n&apos;existe pas ou vous n&apos;avez pas l&apos;autorisation
          de le consulter.
        </p>
        <Button
          onClick={handleReturnToProfiles}
          className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-600"
        >
          <ArrowLeft className="h-5 w-5 mr-3" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <>
        <IntelNavigationBar
          currentPage={`${profile.firstName} ${profile.lastName}`}
          breadcrumbs={[{ label: 'Profils consulaires', href: '/intel/profiles' }]}
        />

        <div className="space-y-6">
          {/* En-tête principal */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="relative p-6 lg:p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl group overflow-hidden"
              style={{
                background: 'var(--bg-glass-primary)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid var(--border-glass-primary)',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              {/* Barre de scan animée */}
              <div
                className="absolute top-0 left-0 h-1 opacity-0 group-hover:opacity-100"
                style={{
                  width: '100px',
                  background:
                    'linear-gradient(90deg, transparent, var(--accent-intel) 50%, transparent)',
                  animation: 'scan 2s infinite linear',
                }}
              />

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                  <Button
                    variant="outline"
                    onClick={handleReturnToProfiles}
                    className="hover:scale-105 transition-all self-start"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Retour</span>
                  </Button>

                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar
                      className="h-16 w-16 sm:h-20 sm:w-20 border-4 shadow-xl flex-shrink-0"
                      style={{ borderColor: 'var(--border-glass-secondary)' }}
                    >
                      <AvatarImage
                        src={
                          profile.identityPicture?.fileUrl || '/avatar-placeholder.png'
                        }
                        alt={`${profile.firstName} ${profile.lastName}`}
                      />
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h1
                        className="text-2xl sm:text-3xl font-bold truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {profile.firstName} {profile.lastName}
                      </h1>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Profil consulaire #{profileId.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-xs sm:text-sm">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Surveillance </span>Active
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs sm:text-sm">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Profil </span>Vérifié
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-6">
                  {profile.birthDate && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:shadow-lg"
                      style={{
                        background: 'var(--bg-glass-light)',
                        border: '1px solid var(--border-glass-secondary)',
                      }}
                    >
                      <Calendar
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-medium"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Date de naissance
                        </p>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {format(new Date(profile.birthDate), 'dd MMMM yyyy', {
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile.birthPlace && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:shadow-lg"
                      style={{
                        background: 'var(--bg-glass-light)',
                        border: '1px solid var(--border-glass-secondary)',
                      }}
                    >
                      <MapPin
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-medium"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Lieu de naissance
                        </p>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {profile.birthPlace}
                        </p>
                      </div>
                    </div>
                  )}

                  <div
                    className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:shadow-lg"
                    style={{
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-glass-secondary)',
                    }}
                  >
                    <Clock
                      className="h-5 w-5 flex-shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Dernière activité
                      </p>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {format(lastActivity, 'HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                {/* Section principale - 2/3 */}
                <div className="lg:col-span-2">
                  {/* Section Renseignements */}
                  <Card
                    className="relative group transition-all duration-300 hover:shadow-2xl border-l-4 overflow-hidden h-[500px] flex flex-col"
                    style={{
                      background: 'var(--bg-glass-primary)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid var(--border-glass-primary)',
                      boxShadow: 'var(--shadow-glass)',
                      borderLeftColor: '#f59e0b',
                    }}
                  >
                    {/* Barre de scan animée */}
                    <div
                      className="absolute top-0 left-0 h-1 opacity-0 group-hover:opacity-100"
                      style={{
                        width: '100px',
                        background:
                          'linear-gradient(90deg, transparent, var(--accent-intel) 50%, transparent)',
                        animation: 'scan 2s infinite linear',
                      }}
                    />

                    {/* Header avec badge et titre intégrés */}
                    <div
                      className="px-6 pt-5 pb-4 border-b flex-shrink-0"
                      style={{ borderColor: 'var(--border-glass-secondary)' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 px-3 py-1.5 text-xs font-bold rounded-full">
                          <Shield className="h-3 w-3 mr-1.5" />
                          Section Prioritaire
                        </Badge>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Centre de surveillance
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: 'rgba(245, 158, 11, 0.2)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                            }}
                          >
                            <FileText className="h-5 w-5" style={{ color: '#f59e0b' }} />
                          </div>
                          <div>
                            <h3
                              className="text-lg font-bold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              Renseignements
                            </h3>
                            <p
                              className="text-xs"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              Centre d&apos;analyse et de traitement
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-600 border"
                          onClick={() => {
                            // Déclencher l'ajout de note via un état local
                            const event = new CustomEvent('addIntelligenceNote', {
                              detail: { profileId },
                            });
                            window.dispatchEvent(event);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une note
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-6 flex-1 overflow-hidden">
                      <IntelligenceNotesSection
                        profileId={profileId}
                        currentUserId={currentUser?._id ?? ''}
                        allowDelete={true}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar - 1/3 */}
                <div>
                  {/* Actions Prioritaires */}
                  <Card
                    className="relative transition-all duration-300 hover:shadow-2xl border-r-4 h-[500px] flex flex-col"
                    style={{
                      background: 'var(--bg-glass-primary)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid var(--border-glass-primary)',
                      boxShadow: 'var(--shadow-glass)',
                      borderRightColor: '#3b82f6',
                    }}
                  >
                    {/* Header compact */}
                    <div
                      className="px-6 pt-5 pb-4 border-b flex-shrink-0"
                      style={{ borderColor: 'var(--border-glass-secondary)' }}
                    >
                      <h3
                        className="text-lg font-bold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Actions Prioritaires
                      </h3>
                    </div>
                    <CardContent className="p-6 space-y-5 flex flex-col flex-1 overflow-hidden">
                      {/* Actions Rapides */}
                      <div className="space-y-4">
                        <h4
                          className="font-bold text-sm uppercase tracking-wider"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Actions Rapides
                        </h4>

                        <div className="space-y-3">
                          <IntelProfileDetailsSheet
                            profileId={profileId}
                            triggerLabel="Voir le Profil Complet"
                            triggerVariant="outline"
                            triggerIcon={<User className="h-4 w-4" />}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              variant="outline"
                              size="default"
                              className="text-sm bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-600 hover:shadow-md transition-all duration-200"
                              onClick={() => toast.info('Fonction en développement')}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Export
                            </Button>

                            <Button
                              variant="outline"
                              size="default"
                              className="text-sm bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-600 hover:shadow-md transition-all duration-200"
                              onClick={() => toast.info('Fonction en développement')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Surveiller
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Séparateur */}
                      <div
                        className="h-px mt-auto"
                        style={{ background: 'var(--border-glass-secondary)' }}
                      />

                      {/* Statistiques du profil */}
                      <div className="space-y-4 flex-shrink-0">
                        <h5
                          className="font-bold text-xs uppercase tracking-wider"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Statistiques
                        </h5>

                        <div
                          className="p-5 rounded-xl space-y-4"
                          style={{
                            background: 'var(--bg-glass-light)',
                            border: '1px solid var(--border-glass-secondary)',
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span
                              className="text-xs font-medium"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Âge
                            </span>
                            <span
                              className="text-xs font-mono font-bold"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {profile.birthDate
                                ? (() => {
                                    const today = new Date();
                                    const birth = new Date(
                                      typeof profile.birthDate === 'number'
                                        ? profile.birthDate
                                        : profile.birthDate,
                                    );
                                    let age = today.getFullYear() - birth.getFullYear();
                                    const monthDiff = today.getMonth() - birth.getMonth();
                                    if (
                                      monthDiff < 0 ||
                                      (monthDiff === 0 &&
                                        today.getDate() < birth.getDate())
                                    ) {
                                      age--;
                                    }
                                    return `${age} ans`;
                                  })()
                                : 'N/A'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span
                              className="text-xs font-medium"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Statut
                            </span>
                            <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-xs font-medium">
                              Actif
                            </Badge>
                          </div>

                          <div className="flex justify-between items-center">
                            <span
                              className="text-xs font-medium"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Surveillance
                            </span>
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs font-medium">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Styles CSS pour animations cohérentes avec la page de liste */}
        <style>{`
        @keyframes scan {
          0% { 
            left: -100px;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% { 
            left: 100%;
            opacity: 0;
          }
        }
      `}</style>
      </>
    </TooltipProvider>
  );
}
