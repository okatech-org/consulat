'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  FileText,
  Shield,
  Phone,
  Mail,
} from 'lucide-react';
import { IntelligenceNotesSection } from '@/components/intelligence/intelligence-notes-section';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProfileIntelligenceDetailsPageProps {
  profileId: string;
}

export function ProfileIntelligenceDetailsPage({
  profileId,
}: ProfileIntelligenceDetailsPageProps) {
  const router = useRouter();

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
        <Button variant="outline" size="sm" onClick={() => router.push('/profiles')}>
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

      {/* Informations personnelles */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nom complet
                </label>
                <p className="text-sm">
                  {profile.firstName} {profile.lastName}
                </p>
              </div>

              {profile.birthDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date de naissance
                  </label>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(profile.birthDate), 'dd MMMM yyyy', { locale: fr })}
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

              {profile.birthCountry && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Pays de naissance
                  </label>
                  <p className="text-sm">{profile.birthCountry}</p>
                </div>
              )}

              {profile.nationality && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nationalité
                  </label>
                  <p className="text-sm">{profile.nationality}</p>
                </div>
              )}

              {profile.gender && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Sexe
                  </label>
                  <p className="text-sm">
                    {profile.gender === 'MALE' ? 'Masculin' : 'Féminin'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contact et localisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {profile.user?.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.user.email}
                  </p>
                </div>
              )}

              {profile.phoneNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Téléphone
                  </label>
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {profile.phoneNumber}
                  </p>
                </div>
              )}

              {profile.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Adresse
                  </label>
                  <p className="text-sm">
                    {profile.address.firstLine && `${profile.address.firstLine}, `}
                    {profile.address.secondLine && `${profile.address.secondLine}, `}
                    {profile.address.city && `${profile.address.city}, `}
                    {profile.address.country}
                  </p>
                </div>
              )}

              {profile.residentContact && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Contact résident
                  </label>
                  <p className="text-sm">
                    {profile.residentContact.firstName} {profile.residentContact.lastName}
                    {profile.residentContact.phoneNumber &&
                      ` - ${profile.residentContact.phoneNumber}`}
                  </p>
                </div>
              )}

              {profile.homeLandContact && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Contact au pays
                  </label>
                  <p className="text-sm">
                    {profile.homeLandContact.firstName} {profile.homeLandContact.lastName}
                    {profile.homeLandContact.phoneNumber &&
                      ` - ${profile.homeLandContact.phoneNumber}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profile.identityPicture && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Photo d&apos;identité</p>
                  <p className="text-xs text-muted-foreground">Document d'identité</p>
                </div>
              </div>
            )}

            {profile.passport && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Passeport</p>
                  <p className="text-xs text-muted-foreground">Document de voyage</p>
                </div>
              </div>
            )}

            {profile.birthCertificate && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Acte de naissance</p>
                  <p className="text-xs text-muted-foreground">Document civil</p>
                </div>
              </div>
            )}

            {profile.residencePermit && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Titre de séjour</p>
                  <p className="text-xs text-muted-foreground">Document de résidence</p>
                </div>
              </div>
            )}

            {profile.addressProof && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Justificatif de domicile</p>
                  <p className="text-xs text-muted-foreground">Preuve d&apos;adresse</p>
                </div>
              </div>
            )}

            {!profile.identityPicture &&
              !profile.passport &&
              !profile.birthCertificate &&
              !profile.residencePermit &&
              !profile.addressProof && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun document disponible</p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Autorités parentales */}
      {profile.parentAuthorities && profile.parentAuthorities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Autorités parentales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.parentAuthorities.map((authority, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {authority.parentUser?.name || 'Utilisateur inconnu'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {authority.role === 'FATHER' && 'Père'}
                      {authority.role === 'MOTHER' && 'Mère'}
                      {authority.role === 'LEGAL_GUARDIAN' && 'Tuteur légal'}
                    </p>
                  </div>
                  {authority.parentUser?.email && (
                    <p className="text-xs text-muted-foreground">
                      {authority.parentUser.email}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Section Renseignements */}
      <IntelligenceNotesSection
        profileId={profileId}
        currentUserId={profile.user?.id || ''}
      />
    </div>
  );
}
