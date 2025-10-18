'use client';

import { useTranslations } from 'next-intl';
import {
  MapPin,
  User,
  Calendar,
  Globe,
  Flag,
  ArrowLeft,
  ArrowRight,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { DocumentStatus, InfoField } from '@/components/ui/info-field';
import { useDateLocale } from '@/lib/utils';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { FlagIcon } from '../ui/flag-icon';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import type { Doc } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

type ChildReviewFormProps = {
  childProfileId: Id<'childProfiles'>;
  onPrevious: () => void;
  onNext: () => void;
};

export function ChildReviewForm({
  childProfileId,
  onPrevious,
  onNext,
}: ChildReviewFormProps) {
  const t = useTranslations('registration');
  const t_inputs = useTranslations('inputs');
  const t_countries = useTranslations('countries');
  const { formatDate } = useDateLocale();

  const childProfile = useQuery(api.functions.childProfile.getChildProfile, {
    childProfileId,
  });

  if (!childProfile) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const isComplete =
    childProfile.personal.firstName &&
    childProfile.personal.lastName &&
    childProfile.personal.birthDate &&
    childProfile.personal.birthPlace &&
    childProfile.personal.birthCountry &&
    childProfile.personal.gender &&
    childProfile.personal.nationality &&
    childProfile.parents.length > 0;

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">{t('child.review.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('child.review.description')}</p>
        </div>

        <Separator />

        {/* Informations personnelles */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">{t('steps.basicInfo')}</h3>
          <div className="grid gap-4 grid-cols-2">
            <InfoField
              label={t_inputs('firstName.label')}
              value={childProfile.personal.firstName}
              icon={<User className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('lastName.label')}
              value={childProfile.personal.lastName}
              icon={<User className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('gender.label')}
              value={
                childProfile.personal.gender &&
                t_inputs(`gender.options.${childProfile.personal.gender}`)
              }
              icon={<User className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('birthDate.label')}
              value={
                childProfile.personal.birthDate &&
                formatDate(new Date(childProfile.personal.birthDate), 'dd/MM/yyyy')
              }
              icon={<Calendar className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('birthPlace.label')}
              value={childProfile.personal.birthPlace}
              icon={<MapPin className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('birthCountry.label')}
              value={
                childProfile.personal.birthCountry && (
                  <p className="flex items-center gap-2">
                    <FlagIcon
                      countryCode={childProfile.personal.birthCountry as CountryCode}
                    />
                    {t_countries(childProfile.personal.birthCountry as CountryCode)}
                  </p>
                )
              }
              icon={<Globe className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('nationality.label')}
              value={
                childProfile.personal.nationality && (
                  <p className="flex items-center gap-2">
                    <FlagIcon
                      countryCode={childProfile.personal.nationality as CountryCode}
                    />
                    {t_countries(childProfile.personal.nationality as CountryCode)}
                  </p>
                )
              }
              icon={<Flag className="size-4" />}
              required
            />
            <InfoField
              label={t_inputs('nationality_acquisition.label')}
              value={
                childProfile.personal.acquisitionMode &&
                t_inputs(
                  `nationality_acquisition.options.${childProfile.personal.acquisitionMode}`,
                )
              }
              icon={<Flag className="size-4" />}
              required
            />
          </div>
        </div>

        <Separator />

        {/* Informations du passeport (optionnel) */}
        {childProfile.personal.passportInfos?.number && (
          <>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">{t_inputs('passport.label')}</h4>
              <div className="grid gap-4 grid-cols-2">
                <InfoField
                  label={t_inputs('passport.number.label')}
                  value={childProfile.personal.passportInfos?.number}
                  className="col-span-2"
                />
                <InfoField
                  label={t_inputs('passport.issueAuthority.label')}
                  value={childProfile.personal.passportInfos?.issueAuthority}
                  className="col-span-2"
                />
                <InfoField
                  label={t_inputs('passport.issueDate.label')}
                  value={
                    childProfile.personal.passportInfos?.issueDate &&
                    formatDate(
                      new Date(childProfile.personal.passportInfos.issueDate),
                      'dd/MM/yyyy',
                    )
                  }
                />
                <InfoField
                  label={t_inputs('passport.expiryDate.label')}
                  value={
                    childProfile.personal.passportInfos?.expiryDate &&
                    formatDate(
                      new Date(childProfile.personal.passportInfos.expiryDate),
                      'dd/MM/yyyy',
                    )
                  }
                />
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Parents */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">{t('child.parents.title')}</h3>
          <div className="space-y-3">
            {childProfile.parents.map((parent, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span className="font-medium">
                    {parent.firstName} {parent.lastName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({t(`parents.roles.${parent.role}`)})
                  </span>
                </div>
                {parent.email && (
                  <p className="text-sm text-muted-foreground">{parent.email}</p>
                )}
                {parent.phoneNumber && (
                  <p className="text-sm text-muted-foreground">{parent.phoneNumber}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
        <Button
          type="button"
          onClick={onPrevious}
          variant="outline"
          leftIcon={<ArrowLeft className="size-icon" />}
        >
          Précédent
        </Button>

        <Button
          type="submit"
          onClick={onNext}
          disabled={!isComplete}
          rightIcon={<ArrowRight className="size-icon" />}
        >
          Soumettre la demande
        </Button>
      </div>

      {!isComplete && (
        <div className="flex flex-col gap-2 pt-4">
          <div className="flex flex-col items-center gap-2">
            <TriangleAlert className="size-icon text-yellow-500" />
            <p className="text-sm text-yellow-500 text-center">
              {t('child.review.incomplete_message')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
