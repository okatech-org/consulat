'use client';

import { FullProfile } from '@/types/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  HomeIcon,
  FileText,
  UserCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDateLocale } from '@/lib/utils';

// Helper function to get initials from a name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

interface ProfileViewProps {
  profile: FullProfile;
  hasFullAccess?: boolean;
}

export function ProfileView({ profile, hasFullAccess = false }: ProfileViewProps) {
  const { formatDate } = useDateLocale();

  // Basic info available to everyone
  const basicInfo = (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          {profile.identityPicture ? (
            <AvatarImage
              src={profile.identityPicture.fileUrl}
              alt={`${profile.firstName} ${profile.lastName}`}
            />
          ) : (
            <AvatarFallback className="text-xl">
              {getInitials(`${profile.firstName} ${profile.lastName}`)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {profile.firstName} {profile.lastName}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{profile.residenceCountyCode}</span>
          </div>
          {profile.birthDate && (
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(profile.birthDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Contact info for authenticated users
  const contactInfo =
    profile.email || profile.phoneNumber ? (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations de contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
          )}
          {profile.phoneNumber && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phoneNumber}</span>
            </div>
          )}
        </CardContent>
      </Card>
    ) : null;

  // Full profile for admins with country access or super admin
  const fullProfile = hasFullAccess ? (
    <div className="mt-6 space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personnel</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="family">Famille</TabsTrigger>
          <TabsTrigger value="professional">Professionnel</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.gender && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Genre</span>
                  <span>{profile.gender}</span>
                </div>
              )}
              {profile.birthPlace && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Lieu de naissance</span>
                  <span>{profile.birthPlace}</span>
                </div>
              )}
              {profile.birthCountry && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Pays de naissance</span>
                  <span>{profile.birthCountry}</span>
                </div>
              )}
              {profile.nationality && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Nationalité</span>
                  <span>{profile.nationality}</span>
                </div>
              )}
              {profile.maritalStatus && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">État civil</span>
                  <span>{profile.maritalStatus}</span>
                </div>
              )}
              {profile.acquisitionMode && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Mode d&apos;acquisition</span>
                  <span>{profile.acquisitionMode}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex flex-col gap-1 border-b pb-2">
                  <span className="font-medium">Adresse</span>
                  <div className="flex items-center gap-2">
                    <HomeIcon className="h-4 w-4 text-muted-foreground" />
                    <address className="not-italic text-sm">
                      {profile.address.firstLine}
                      {profile.address.secondLine && <>, {profile.address.secondLine}</>}
                      <br />
                      {profile.address.zipCode && <>{profile.address.zipCode}, </>}
                      {profile.address.city}, {profile.address.country}
                    </address>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.passport && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Passeport</span>
                  <Badge>{profile.passport.status}</Badge>
                </div>
              )}
              {profile.birthCertificate && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Acte de naissance</span>
                  <Badge>{profile.birthCertificate.status}</Badge>
                </div>
              )}
              {profile.residencePermit && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Permis de séjour</span>
                  <Badge>{profile.residencePermit.status}</Badge>
                </div>
              )}
              {profile.addressProof && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Justificatif de domicile</span>
                  <Badge>{profile.addressProof.status}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations familiales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.fatherFullName && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Nom du père</span>
                  <span>{profile.fatherFullName}</span>
                </div>
              )}
              {profile.motherFullName && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Nom de la mère</span>
                  <span>{profile.motherFullName}</span>
                </div>
              )}
              {profile.spouseFullName && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Nom du conjoint</span>
                  <span>{profile.spouseFullName}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Informations professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.profession && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Profession</span>
                  <span>{profile.profession}</span>
                </div>
              )}
              {profile.employer && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Employeur</span>
                  <span>{profile.employer}</span>
                </div>
              )}
              {profile.workStatus && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Situation professionnelle</span>
                  <span>{profile.workStatus}</span>
                </div>
              )}
              {profile.employerAddress && (
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">Adresse de l&apos;employeur</span>
                  <span>{profile.employerAddress}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ) : null;

  return (
    <>
      {basicInfo}
      {contactInfo}
      {fullProfile}
    </>
  );
}
