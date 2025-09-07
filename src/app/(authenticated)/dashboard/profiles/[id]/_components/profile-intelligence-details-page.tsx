'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Shield, User } from 'lucide-react';
import { IntelligenceNotesSection } from '@/components/intelligence/intelligence-notes-section';
import { ROUTES } from '@/schemas/routes';
import { ProfileTabs } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-tabs';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-role-data';
import { UserRole } from '@prisma/client';
import type { FullProfile } from '@/types';

interface ProfileIntelligenceDetailsPageProps {
  profileId: string;
}

export function ProfileIntelligenceDetailsPage({
  profileId,
}: ProfileIntelligenceDetailsPageProps) {
  const router = useRouter();
  const t = useTranslations('intelligence');
  const { user: currentUser } = useCurrentUser();
  const isIntelAgent = currentUser?.role === UserRole.INTEL_AGENT;

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

  // Préparer l'onglet intelligence si l'utilisateur est un agent de renseignement
  const additionalTabs = isIntelAgent
    ? [
        {
          id: 'intelligence',
          title: t('notes.title'),
          content: (
            <IntelligenceNotesSection
              profileId={profileId}
              currentUserId={profile.user?.id || ''}
            />
          ),
        },
      ]
    : undefined;

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

      {/* Utilisation de ProfileTabs avec onglet intelligence ajouté dynamiquement */}
      <ProfileTabs
        profile={profile as unknown as FullProfile}
        additionalTabs={additionalTabs}
        noTabs={false}
      />
    </div>
  );
}
