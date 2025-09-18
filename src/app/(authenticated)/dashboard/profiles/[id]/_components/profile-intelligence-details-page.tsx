'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  User,
  Calendar,
  Plus,
  Shield,
  FileText,
  Eye,
  ChevronRight,
  Home,
} from 'lucide-react';
import { IntelligenceNotesSection } from '@/components/intelligence/intelligence-notes-section';
import { ROUTES } from '@/schemas/routes';
import { ProfileLookupSheet } from '@/components/profile/profile-lookup-sheet';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { IntelligenceNoteForm } from '@/components/intelligence/intelligence-note-form';
import CardContainer from '@/components/layouts/card-container';
import { useCurrentUser } from '@/hooks/use-current-user';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';

interface ProfileIntelligenceDetailsPageProps {
  profileId: string;
}

export function ProfileIntelligenceDetailsPage({
  profileId,
}: ProfileIntelligenceDetailsPageProps) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  const { data: profile, isLoading } = api.intelligence.getProfileDetails.useQuery({
    profileId,
  });

  if (isLoading) {
    return (
      <IntelAgentLayout
        title="Chargement..."
        description="Analyse du profil en cours"
        currentPage="profiles"
        backButton={true}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted animate-pulse rounded"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </IntelAgentLayout>
    );
  }

  if (!profile) {
    return (
      <IntelAgentLayout
        title="Profil introuvable"
        description="Le profil demandé n'a pas été trouvé"
        currentPage="profiles"
        backButton={true}
      >
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Profil non trouvé</h2>
          <p className="text-muted-foreground mb-4">
            Le profil demandé n&apos;existe pas ou vous n&apos;avez pas
            l&apos;autorisation de le consulter.
          </p>
          <Button onClick={() => router.push(ROUTES.dashboard.profiles)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </IntelAgentLayout>
    );
  }

  return (
    <IntelAgentLayout
      title="" // Désactiver le header par défaut
      description=""
      currentPage="profiles"
      backButton={false}
    >
      {/* Header personnalisé avec meilleure ergonomie */}
      <div className="mb-8">
        {/* Breadcrumb élégant */}
        <div
          className="flex items-center gap-2 text-sm mb-4 p-3 rounded-lg"
          style={{
            background: 'var(--bg-glass-light)',
            border: '1px solid var(--border-glass-secondary)',
          }}
        >
          <Home
            className="h-4 w-4 cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: 'var(--accent-intel)' }}
            onClick={() => router.push('/intel')}
          />
          <ChevronRight className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
          <span
            className="cursor-pointer hover:opacity-70 transition-opacity font-medium"
            style={{ color: 'var(--accent-intel)' }}
            onClick={() => router.push('/intel/profiles')}
          >
            Profils consulaires
          </span>
          <ChevronRight className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
          <span
            className="font-medium truncate max-w-[200px]"
            style={{ color: 'var(--text-secondary)' }}
            title={`${profile.firstName} ${profile.lastName}`}
          >
            {profile.firstName} {profile.lastName}
          </span>
        </div>

        {/* En-tête principal amélioré */}
        <div
          className="relative p-6 rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '2px solid var(--accent-intel)',
            boxShadow: 'var(--shadow-glass), 0 0 40px rgba(59, 130, 246, 0.15)',
          }}
        >
          {/* Animation de scan */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
              animation: 'scan-animation 4s ease-in-out infinite',
            }}
          />

          {/* Contenu de l'en-tête */}
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Bouton retour et avatar */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(ROUTES.dashboard.profiles)}
                  className="flex items-center gap-2 font-medium transition-all hover:scale-105"
                  style={{
                    background: 'var(--bg-glass-secondary)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border-glass-primary)',
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Retour</span>
                </Button>

                <Avatar className="h-24 w-24 bg-muted border-4 border-white/30 shadow-lg">
                  <AvatarImage
                    src={profile.identityPicture?.fileUrl || ''}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                </Avatar>
              </div>

              {/* Informations principales */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h1
                      className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <p
                      className="text-lg mb-3"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Profil gabonais - Consultation des renseignements
                    </p>
                  </div>

                  {/* Badges de statut */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1.5 text-sm font-medium hover:bg-blue-200 transition-colors">
                      <Shield className="h-4 w-4 mr-2" />
                      Surveillance Active
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700 bg-green-50 px-3 py-1.5 text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Profil Vérifié
                    </Badge>
                  </div>
                </div>

                {/* Informations rapides en grille */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.birthDate && (
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        background: 'var(--bg-glass-light)',
                        border: '1px solid var(--border-glass-secondary)',
                      }}
                    >
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: 'var(--accent-intel)', opacity: 0.1 }}
                      >
                        <Calendar
                          className="h-4 w-4"
                          style={{ color: 'var(--accent-intel)' }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-xs font-medium uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Date de naissance
                        </p>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: 'var(--text-secondary)' }}
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
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        background: 'var(--bg-glass-light)',
                        border: '1px solid var(--border-glass-secondary)',
                      }}
                    >
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: 'var(--accent-warning)', opacity: 0.1 }}
                      >
                        <FileText
                          className="h-4 w-4"
                          style={{ color: 'var(--accent-warning)' }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-xs font-medium uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Lieu de naissance
                        </p>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {profile.birthPlace}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout en grille 2/3 - 1/3 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Section Principale (2/3) - RENSEIGNEMENTS MISE EN AVANT */}
        <div className="xl:col-span-2 space-y-6">
          {/* Section RENSEIGNEMENTS PRIORITAIRE */}
          <div
            className="relative p-6 rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-glass-secondary)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '1px solid var(--border-glass-primary)',
              boxShadow: 'var(--shadow-glass)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold flex items-center gap-3"
                style={{ color: 'var(--text-primary)' }}
              >
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--accent-intel), var(--accent-warning))',
                  }}
                >
                  <Shield className="h-6 w-6 text-white" />
                </div>
                Renseignements
              </h2>

              <Badge
                variant="outline"
                className="px-3 py-1 text-xs font-medium border-blue-200 text-blue-700 bg-blue-50"
              >
                Section Prioritaire
              </Badge>
            </div>

            <IntelligenceNotesSection
              profileId={profileId}
              currentUserId={currentUser?.id || ''}
              allowDelete={true}
            />
          </div>
        </div>

        {/* Sidebar d'actions (1/3) */}
        <div className="space-y-6">
          {/* Actions principales avec boutons gradient */}
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{
              background: 'var(--bg-glass-primary)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid var(--border-glass-primary)',
              boxShadow: 'var(--shadow-glass)',
            }}
          >
            <h3
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Plus className="h-5 w-5" />
              Actions Prioritaires
            </h3>

            <div className="space-y-3">
              {/* Bouton AJOUTER UNE NOTE - Mise en avant */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    className="w-full text-white font-semibold transition-all duration-300 hover:scale-105"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--accent-intel), var(--accent-warning))',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une Note
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:min-w-[50vw] sm:max-w-[90vw]">
                  <SheetHeader>
                    <SheetTitle className="text-xl">
                      Ajouter une note de renseignement
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <IntelligenceNoteForm
                      profileId={profileId}
                      onSuccess={() => {
                        // Le composant IntelligenceNotesSection se rafraîchira automatiquement
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <ProfileLookupSheet
                profileId={profileId}
                triggerLabel="Voir le Profil Complet"
                triggerVariant="outline"
                triggerIcon={<User className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Informations de base */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: 'var(--bg-glass-secondary)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid var(--border-glass-primary)',
              boxShadow: 'var(--shadow-glass)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Informations de Base
            </h3>

            <div className="space-y-4">
              {profile.birthDate && (
                <div>
                  <label
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Date de naissance
                  </label>
                  <p
                    className="text-sm font-medium flex items-center gap-2 mt-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Calendar className="h-4 w-4" />
                    {format(new Date(profile.birthDate), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              )}

              {profile.birthPlace && (
                <div>
                  <label
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Lieu de naissance
                  </label>
                  <p
                    className="text-sm font-medium mt-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {profile.birthPlace}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Styles CSS pour l'animation de scan optimisée */}
      <style jsx>{`
        @keyframes scan-animation {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(300%);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scan-animation {
            animation: none !important;
          }
        }
      `}</style>
    </IntelAgentLayout>
  );
}
