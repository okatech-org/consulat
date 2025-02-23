'use client';

import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FullProfile } from '@/types/profile';
import Image from 'next/image';

interface ConsularCardProps {
  profile: FullProfile;
  organizationLogo?: string;
  organizationName?: string;
  cardNumber: string;
  issuedAt: Date;
  expiresAt: Date;
}

export function ConsularCard({
  profile,
  organizationLogo,
  organizationName,
  cardNumber,
  issuedAt,
  expiresAt,
}: ConsularCardProps) {
  const t = useTranslations('profile.consular_card');

  return (
    <div className="relative aspect-[1.586] w-full max-w-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 to-primary shadow-lg">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4">
        {organizationLogo && (
          <Image
            src={organizationLogo}
            alt={organizationName || ''}
            width={60}
            height={60}
            className="object-contain"
          />
        )}
        <div className="text-right text-white">
          <h3 className="text-lg font-semibold">{t('title')}</h3>
          <p className="text-sm opacity-90">{organizationName}</p>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-[1fr,auto] gap-4 p-4">
        <div className="space-y-2">
          <div>
            <p className="text-xs text-white/70">{t('full_name')}</p>
            <p className="text-lg font-medium text-white">
              {profile.firstName} {profile.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/70">{t('card_number')}</p>
            <p className="font-mono text-white">{cardNumber}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/70">{t('issued_at')}</p>
              <p className="text-sm text-white">
                {format(issuedAt, 'dd/MM/yyyy', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/70">{t('expires_at')}</p>
              <p className="text-sm text-white">
                {format(expiresAt, 'dd/MM/yyyy', { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        {/* Photo et QR Code */}
        <div className="flex flex-col items-end gap-2">
          {profile.identityPicture && (
            <div className="relative aspect-[3/4] w-24 overflow-hidden rounded-lg">
              <Image
                src={profile.identityPicture.fileUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                fill
                className="object-cover"
              />
            </div>
          )}
          <QRCodeSVG
            value={`${process.env.NEXT_PUBLIC_APP_URL}/verify/${cardNumber}`}
            size={80}
            className="rounded-lg bg-white p-1"
          />
        </div>
      </div>
    </div>
  );
}
