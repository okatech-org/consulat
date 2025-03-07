// src/components/actions/profile/review/contact.tsx
import { useTranslations } from 'next-intl';
import { FullProfile } from '@/types';
import { CheckCircle2, XCircle, Mail, Phone, MapPin, User, Users } from 'lucide-react';
import CardContainer from '@/components/layouts/card-container';
import { CountryCode } from '@/lib/autocomplete-datas';
import { Address } from '@prisma/client';
import { DisplayAddress } from '@/components/ui/display-address';

interface ProfileContactProps {
  profile: FullProfile;
}

export function ProfileContact({ profile }: ProfileContactProps) {
  const t = useTranslations('admin.registrations.review');
  const t_countries = useTranslations('countries');
  const t_inputs = useTranslations('inputs');

  const mainAddress = profile.address;
  // @ts-expect-error - Propriété peut ne pas exister sur tous les profils
  const gabonAddress = profile.addressInGabon;
  const residentContact = profile.residentContact;
  const homeLandContact = profile.homeLandContact;

  return (
    <div className="space-y-4">
      {/* Coordonnées principales */}
      <CardContainer title={t('sections.contact')} contentClass="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t_inputs('email.label')}</p>
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
              <p className="text-sm text-muted-foreground">{t_inputs('phone.label')}</p>
              <p className="font-medium">
                {profile.phone
                  ? `${profile.phone.countryCode} ${profile.phone.number}`
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

      {/* Adresse principale */}
      <CardContainer title={t('sections.main_address')}>
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 size-5 text-muted-foreground" />
          <div className="flex-1">
            {mainAddress ? (
              <DisplayAddress address={mainAddress as Address} />
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

      {/* Adresse au Gabon */}
      {gabonAddress && (
        <CardContainer title={t('sections.gabon_address')}>
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 size-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="space-y-1">
                <p>{gabonAddress.address}</p>
                <p>{gabonAddress.district}</p>
                <p className="font-medium">{gabonAddress.city}</p>
              </div>
            </div>
            <CheckCircle2 className="text-success size-5" />
          </div>
        </CardContainer>
      )}

      {/* Contact d'urgence résident */}
      {residentContact && (
        <CardContainer
          title={
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span>
                {t_inputs('emergencyContact.label')} -{' '}
                {t_countries(
                  (residentContact.address?.country as CountryCode) || 'gabon',
                )}
              </span>
            </div>
          }
          contentClass="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <User className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t_inputs('fullName.label')}
                </p>
                <p className="font-medium">{`${residentContact.firstName} ${residentContact.lastName}`}</p>
              </div>
              <CheckCircle2 className="text-success size-5" />
            </div>

            <div className="flex items-center gap-3">
              <Users className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t_inputs('familyLink.label')}
                </p>
                <p className="font-medium">
                  {residentContact.relationship
                    ? t_inputs(`familyLink.options.${residentContact.relationship}`)
                    : '-'}
                </p>
              </div>
              {residentContact.relationship ? (
                <CheckCircle2 className="text-success size-5" />
              ) : (
                <XCircle className="size-5 text-destructive" />
              )}
            </div>

            {residentContact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t_inputs('phone.label')}
                  </p>
                  <p className="font-medium">
                    {`${residentContact.phone.countryCode} ${residentContact.phone.number}`}
                  </p>
                </div>
                <CheckCircle2 className="text-success size-5" />
              </div>
            )}

            {/* @ts-expect-error - Propriété peut ne pas exister sur tous les contacts d'urgence */}
            {residentContact.email && (
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t_inputs('email.label')}
                  </p>
                  {/* @ts-expect-error - Propriété peut ne pas exister sur tous les contacts d'urgence */}
                  <p className="font-medium">{residentContact.email}</p>
                </div>
                <CheckCircle2 className="text-success size-5" />
              </div>
            )}
          </div>

          {residentContact.address && (
            <div className="flex items-start gap-3 mt-2">
              <MapPin className="mt-1 size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t_inputs('address.label')}
                </p>
                <DisplayAddress address={residentContact.address as Address} />
              </div>
              <CheckCircle2 className="text-success size-5" />
            </div>
          )}
        </CardContainer>
      )}

      {/* Contact d'urgence pays d'origine */}
      {homeLandContact && (
        <CardContainer
          title={
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span>
                {t_inputs('emergencyContact.label')} -{' '}
                {t_countries(
                  (homeLandContact.address?.country as CountryCode) || 'gabon',
                )}
              </span>
            </div>
          }
          contentClass="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <User className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t_inputs('fullName.label')}
                </p>
                <p className="font-medium">{`${homeLandContact.firstName} ${homeLandContact.lastName}`}</p>
              </div>
              <CheckCircle2 className="text-success size-5" />
            </div>

            <div className="flex items-center gap-3">
              <Users className="size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t_inputs('familyLink.label')}
                </p>
                <p className="font-medium">
                  {homeLandContact.relationship
                    ? t_inputs(`familyLink.options.${homeLandContact.relationship}`)
                    : '-'}
                </p>
              </div>
              {homeLandContact.relationship ? (
                <CheckCircle2 className="text-success size-5" />
              ) : (
                <XCircle className="size-5 text-destructive" />
              )}
            </div>

            {homeLandContact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t_inputs('phone.label')}
                  </p>
                  <p className="font-medium">
                    {`${homeLandContact.phone.countryCode} ${homeLandContact.phone.number}`}
                  </p>
                </div>
                <CheckCircle2 className="text-success size-5" />
              </div>
            )}

            {/* @ts-expect-error - Propriété peut ne pas exister sur tous les contacts d'urgence */}
            {homeLandContact.email && (
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t_inputs('email.label')}
                  </p>
                  {/* @ts-expect-error - Propriété peut ne pas exister sur tous les contacts d'urgence */}
                  <p className="font-medium">{homeLandContact.email}</p>
                </div>
                <CheckCircle2 className="text-success size-5" />
              </div>
            )}
          </div>

          {homeLandContact.address && (
            <div className="flex items-start gap-3 mt-2">
              <MapPin className="mt-1 size-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t_inputs('address.label')}
                </p>
                <DisplayAddress address={homeLandContact.address as Address} />
              </div>
              <CheckCircle2 className="text-success size-5" />
            </div>
          )}
        </CardContainer>
      )}
    </div>
  );
}
