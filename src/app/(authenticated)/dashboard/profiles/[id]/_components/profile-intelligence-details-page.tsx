'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Calendar, Plus, Shield } from 'lucide-react';
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
import { useCurrentUser } from '@/hooks/use-role-data';

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
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Profil non trouvé</h2>
        <p className="text-muted-foreground mb-4">
          Le profil demandé n&apos;existe pas ou vous n&apos;avez pas l&apos;autorisation
          de le consulter.
        </p>
        <Button onClick={() => router.push('/profiles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(ROUTES.dashboard.profiles)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-muted-foreground">
            Profil gabonais - Consultation des renseignements
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Lecture seule
        </Badge>
      </div>

      {/* Mise en page principale */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Section Renseignements - Gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Renseignements
            </h2>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                  Ajouter une note
                </Button>
              </SheetTrigger>
              <SheetContent className="min-w-[50vw]">
                <SheetHeader>
                  <SheetTitle>Ajouter une note de renseignement</SheetTitle>
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
          </div>

          <IntelligenceNotesSection
            profileId={profileId}
            currentUserId={currentUser?.id || ''}
            allowDelete={true}
          />
        </div>

        {/* Section Informations de base - Droite (1/3) */}
        <div className="space-y-6">
          <CardContainer
            title={
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 bg-muted">
                  <AvatarImage
                    src={profile.identityPicture?.fileUrl || ''}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">Profil gabonais</p>
                </div>
              </div>
            }
          >
            <div className="space-y-3">
              {profile.birthDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date de naissance
                  </label>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(profile.birthDate), 'dd MMMM yyyy', {
                      locale: fr,
                    })}
                  </p>
                </div>
              )}

              {profile.birthPlace && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Lieu de naissance
                  </label>
                  <p className="text-sm">{profile.birthPlace}</p>
                </div>
              )}
            </div>

            <div className="pt-4">
              <ProfileLookupSheet
                profileId={profileId}
                triggerLabel="Voir le profil complet"
                triggerVariant="outline"
                triggerIcon={<User className="h-4 w-4" />}
              />
            </div>
          </CardContainer>
        </div>
      </div>
    </div>
  );
}
