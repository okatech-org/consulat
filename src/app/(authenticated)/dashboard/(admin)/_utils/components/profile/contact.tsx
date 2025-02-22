// src/components/actions/profile/review/contact.tsx
import { useTranslations } from 'next-intl';
import { FullProfile } from '@/types';
import { CheckCircle2, XCircle, Mail, Phone, MapPin } from 'lucide-react';
import CardContainer from '@/components/layouts/card-container';

interface ProfileContactProps {
  profile: FullProfile;
}

export function ProfileContact({ profile }: ProfileContactProps) {
  const t = useTranslations('admin.registrations.review');
  const t_countries = useTranslations('countries');

  const mainAddress = profile.address;
  const gabonAddress = profile.addressInGabon;

  return (
    <div className="space-y-4">
      {/* Coordonnées principales */}
      <CardContainer title={t('sections.contact')} contentClass="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t('fields.email')}</p>
              <p className="font-medium">{profile.email || '-'}</p>
            </div>
            {profile.email ? (
              <CheckCircle2 className="text-success size-5" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <Phone className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t('fields.phone')}</p>
              <p className="font-medium">
                {profile.phone
                  ? `${profile.phone.countryCode}${profile.phone.number}`
                  : '-'}
              </p>
            </div>
            {profile.phone ? (
              <CheckCircle2 className="text-success size-5" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
          </div>
        </div>
      </CardContainer>

      <CardContainer title={t('sections.main_address')}>
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 size-5 text-muted-foreground" />
          <div className="flex-1">
            {mainAddress ? (
              <div className="space-y-1">
                <p>{mainAddress.firstLine}</p>
                {mainAddress.secondLine && <p>{mainAddress.secondLine}</p>}
                <p>
                  {mainAddress.zipCode} {mainAddress.city}
                </p>
                <p className="font-medium">{t_countries(mainAddress.country)}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">{t('no_address')}</p>
            )}
          </div>
          {mainAddress ? (
            <CheckCircle2 className="text-success size-5" />
          ) : (
            <XCircle className="size-5 text-destructive" />
          )}
        </div>
      </CardContainer>

      <CardContainer title={t('sections.gabon_address')}>
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 size-5 text-muted-foreground" />
          <div className="flex-1">
            {gabonAddress ? (
              <div className="space-y-1">
                <p>{gabonAddress.address}</p>
                <p>{gabonAddress.district}</p>
                <p className="font-medium">{gabonAddress.city}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">{t('no_gabon_address')}</p>
            )}
          </div>
          <CheckCircle2 className="text-success size-5" />
        </div>
      </CardContainer>
    </div>
  );
}
