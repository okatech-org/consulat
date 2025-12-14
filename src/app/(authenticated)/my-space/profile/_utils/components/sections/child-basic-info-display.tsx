'use client';

import { useTranslations } from 'next-intl';
import { InfoField } from '@/components/ui/info-field';
import { useDateLocale } from '@/lib/utils';
import type { CompleteChildProfile } from '@/convex/lib/types';
import { User, Calendar, MapPin, Globe, Flag, CreditCard, Camera } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { FileDisplay } from '@/components/ui/file-display';

interface ChildBasicInfoDisplayProps {
  profile: CompleteChildProfile;
}

export function ChildBasicInfoDisplay({ profile }: ChildBasicInfoDisplayProps) {
  if (!profile) return null;
  const t_profile = useTranslations('profile.fields');
  const t_inputs = useTranslations('inputs');
  const t_countries = useTranslations('countries');
  const { formatDate } = useDateLocale();

  const identityPicture = profile.documents?.identityPicture;

  return (
    <div className="space-y-6">
      {/* Photo d'identité */}
      {identityPicture && (
        <>
          <InfoField
            label={t_profile('identityPicture')}
            value={
              <FileDisplay fileUrl={identityPicture?.fileUrl}/>
            }
            icon={<Camera className="size-4" />}
            className="max-w-md"
          />
          <Separator />
        </>
      )}

      {/* Informations personnelles de base */}
      <div className="space-y-4">
        {/* Nom et prénom */}
        <div className="grid gap-4 grid-cols-2">
          <InfoField
            label={t_profile('firstName')}
            value={profile.personal.firstName}
            icon={<User className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('lastName')}
            value={profile.personal.lastName}
            icon={<User className="size-4" />}
            required
          />
        </div>

        {/* Date et lieu de naissance */}
        <div className="grid gap-4 grid-cols-2">
          {/* Genre */}
          <InfoField
            label={t_profile('gender')}
            value={
              profile.personal.gender
                ? t_inputs(`gender.options.${profile.personal.gender}`)
                : undefined
            }
            icon={<User className="size-4" />}
            required
          />

          <InfoField
            label={t_profile('birthDate')}
            value={
              profile.personal.birthDate
                ? formatDate(new Date(profile.personal.birthDate), 'dd/MM/yyyy')
                : undefined
            }
            icon={<Calendar className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('birthPlace')}
            value={profile.personal.birthPlace}
            icon={<MapPin className="size-4" />}
            required
          />

          <InfoField
            label={t_profile('birthCountry')}
            value={
              profile.personal.birthCountry
                ? t_countries(profile.personal.birthCountry)
                : undefined
            }
            icon={<Globe className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('nationality')}
            value={
              profile.personal.nationality
                ? t_countries(profile.personal.nationality)
                : undefined
            }
            icon={<Flag className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('acquisitionMode')}
            value={
              profile.personal.acquisitionMode
                ? t_inputs(
                    `nationality_acquisition.options.${profile.personal.acquisitionMode}`,
                  )
                : undefined
            }
            icon={<Flag className="size-4" />}
            className="col-span-2"
          />
        </div>
      </div>

      <div className="space-y-4 col-span-2">
        <h4 className="font-medium text-lg">Passeport</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoField
            label="Numéro de passeport"
            value={profile.personal.passportInfos?.number}
            icon={<CreditCard className="size-4" />}
          />
          <InfoField
            label="Date de délivrance"
            value={profile.personal.passportInfos?.issueDate}
            icon={<Calendar className="size-4" />}
          />
          <InfoField
            label="Date d'expiration"
            value={profile.personal.passportInfos?.expiryDate}
            icon={<Calendar className="size-4" />}
          />
          <InfoField
            label="Autorité de délivrance"
            value={profile.personal.passportInfos?.issueAuthority}
            icon={<Globe className="size-4" />}
          />
        </div>
      </div>

      <Separator />
      <InfoField
        label="Code NIP"
        value={profile.personal.nipCode}
        icon={<CreditCard className="size-4" />}
      />
    </div>
  );
}
