'use client';

import { useTranslations } from 'next-intl';
import { InfoField } from '@/components/ui/info-field';
import { useDateLocale } from '@/lib/utils';
import type { FullProfile } from '@/types/convex-profile';
import {
  User,
  Calendar,
  MapPin,
  Globe,
  Flag,
  CreditCard,
  Camera,
  Building,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { UserDocument } from '@/components/documents/user-document';
import { DocumentType } from '@prisma/client';
import type { AppUserDocument } from '@/types';

interface BasicInfoDisplayProps {
  profile: FullProfile;
}

export function BasicInfoDisplay({ profile }: BasicInfoDisplayProps) {
  const t_profile = useTranslations('profile.fields');
  const t_inputs = useTranslations('inputs');
  const t_countries = useTranslations('countries');
  const { formatDate } = useDateLocale();

  return (
    <div className="space-y-6">
      {/* Photo d'identité */}
      {profile.identityPicture && (
        <>
          <InfoField
            label={t_profile('identityPicture')}
            value={
              <UserDocument
                document={profile.identityPicture as unknown as AppUserDocument}
                expectedType={DocumentType.IDENTITY_PHOTO}
                label=""
                description=""
                allowEdit={false}
              />
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
            value={profile.personal?.firstName}
            icon={<User className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('lastName')}
            value={profile.personal?.lastName}
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
              profile.personal?.gender
                ? t_inputs(`gender.options.${profile.personal.gender}`)
                : undefined
            }
            icon={<User className="size-4" />}
            required
          />

          <InfoField
            label={t_profile('birthDate')}
            value={
              profile.personal?.birthDate
                ? formatDate(new Date(profile.personal.birthDate), 'dd/MM/yyyy')
                : undefined
            }
            icon={<Calendar className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('birthPlace')}
            value={profile.personal?.birthPlace}
            icon={<MapPin className="size-4" />}
            required
          />

          <InfoField
            label={t_profile('birthCountry')}
            value={
              profile.personal?.birthCountry
                ? t_countries(profile.personal.birthCountry as any)
                : undefined
            }
            icon={<Globe className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('nationality')}
            value={
              profile.personal?.nationality
                ? t_countries(profile.personal.nationality as any)
                : undefined
            }
            icon={<Flag className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('acquisitionMode')}
            value={
              profile.personal?.acquisitionMode
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

      {profile.consularCard?.cardPin && (
        <>
          <Separator />
          <InfoField
            label="Code NIP"
            value={profile.consularCard.cardPin}
            icon={<CreditCard className="size-4" />}
          />
        </>
      )}
    </div>
  );
}
