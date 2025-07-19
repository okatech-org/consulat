'use client';

import { useTranslations } from 'next-intl';
import { InfoField } from '@/components/ui/info-field';
import { useDateLocale } from '@/lib/utils';
import type { FullProfile } from '@/types';
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
  const t_assets = useTranslations('assets');
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
                document={profile.identityPicture as AppUserDocument}
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
        {/* Genre */}
        <InfoField
          label={t_profile('gender')}
          value={
            profile.gender
              ? t_assets(`gender.${profile.gender.toLowerCase()}`)
              : undefined
          }
          icon={<User className="size-4" />}
          required
        />

        {/* Nom et prénom */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoField
            label={t_profile('firstName')}
            value={profile.firstName}
            icon={<User className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('lastName')}
            value={profile.lastName}
            icon={<User className="size-4" />}
            required
          />
        </div>

        {/* Date et lieu de naissance */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoField
            label={t_profile('birthDate')}
            value={
              profile.birthDate
                ? formatDate(new Date(profile.birthDate), 'dd/MM/yyyy')
                : undefined
            }
            icon={<Calendar className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('birthPlace')}
            value={profile.birthPlace}
            icon={<MapPin className="size-4" />}
            required
          />
        </div>

        {/* Pays de naissance et nationalité */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoField
            label={t_profile('birthCountry')}
            value={profile.birthCountry}
            icon={<Globe className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('nationality')}
            value={profile.nationality}
            icon={<Flag className="size-4" />}
            required
          />
        </div>

        {/* Mode d'acquisition de la nationalité */}
        <InfoField
          label={t_profile('acquisitionMode')}
          value={
            profile.acquisitionMode
              ? t_assets(
                  `nationality_acquisition.${profile.acquisitionMode.toLowerCase()}`,
                )
              : undefined
          }
          icon={<Flag className="size-4" />}
        />
      </div>

      <Separator />

      {/* Informations passeport */}
      <div className="space-y-4">
        <h4 className="font-medium text-lg">{t_profile('passport')}</h4>

        <InfoField
          label={t_profile('passportNumber')}
          value={profile.passportNumber}
          icon={<CreditCard className="size-4" />}
          required
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoField
            label={t_profile('passportIssueDate')}
            value={
              profile.passportIssueDate
                ? formatDate(new Date(profile.passportIssueDate), 'dd/MM/yyyy')
                : undefined
            }
            icon={<Calendar className="size-4" />}
            required
          />
          <InfoField
            label={t_profile('passportExpiryDate')}
            value={
              profile.passportExpiryDate
                ? formatDate(new Date(profile.passportExpiryDate), 'dd/MM/yyyy')
                : undefined
            }
            icon={<Calendar className="size-4" />}
            required
          />
        </div>

        <InfoField
          label={t_profile('passportIssueAuthority')}
          value={profile.passportIssueAuthority}
          icon={<Building className="size-4" />}
          required
        />

        {profile.cardPin && (
          <InfoField
            label="Code NIP"
            value={profile.cardPin}
            icon={<CreditCard className="size-4" />}
          />
        )}
      </div>
    </div>
  );
}
