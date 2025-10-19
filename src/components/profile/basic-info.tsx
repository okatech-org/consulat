import { useTranslations } from 'next-intl';
import type { CompleteProfile } from '@/convex/lib/types';
import { CheckCircle2, XCircle } from 'lucide-react';
import CardContainer from '@/components/layouts/card-container';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { useDateLocale } from '@/lib/utils';

interface ProfileBasicInfoProps {
  profile: CompleteProfile;
}

export function ProfileBasicInfo({ profile }: ProfileBasicInfoProps) {
  const { formatDate } = useDateLocale();
  const t = useTranslations('admin.registrations.review');
  const t_countries = useTranslations('countries');
  const t_inputs = useTranslations('inputs');

  const fields = [
    {
      label: t_inputs('firstName.label'),
      value: profile.firstName,
      isValid: !!profile.firstName,
    },
    {
      label: t_inputs('lastName.label'),
      value: profile.lastName,
      isValid: !!profile.lastName,
    },
    {
      label: t_inputs('gender.label'),
      value: profile.gender ? t_inputs(`gender.options.${profile.gender}`) : '-',
      isValid: !!profile.gender,
    },
    {
      label: t_inputs('birthDate.label'),
      value: profile.birthDate ? formatDate(profile.birthDate) : '-',
      isValid: !!profile.birthDate,
    },
    {
      label: t_inputs('birthPlace.label'),
      value: profile.birthPlace,
      isValid: !!profile.birthPlace,
    },
    {
      label: t_inputs('birthCountry.label'),
      value: t_countries(profile.birthCountry as CountryCode),
      isValid: !!profile.birthCountry,
    },
    {
      label: t_inputs('nationality.label'),
      value: t_countries(profile.nationality as CountryCode),
      isValid: !!profile.nationality,
    },
    {
      label: t_inputs('nationality_acquisition.label'),
      value: profile.acquisitionMode
        ? t_inputs(`nationality_acquisition.options.${profile.acquisitionMode}`)
        : '-',
      isValid: !!profile.acquisitionMode,
    },
    {
      label: t_inputs('nipNumber.label'),
      value: profile.cardPin || '-',
      isValid: !!profile.cardPin,
    },
  ];

  return (
    <CardContainer
      title={t('sections.basic_info')}
      contentClass="grid gap-4 sm:grid-cols-2 sm:gap-6"
    >
      {fields.map((field, index) => (
        <div
          key={index}
          className="flex items-center justify-between border-b py-2 last:border-0"
        >
          <div>
            <p className="text-sm text-muted-foreground">{field.label}</p>
            <p className="font-medium">{field.value}</p>
          </div>
          {field.isValid ? (
            <CheckCircle2 className="text-success size-5" />
          ) : (
            <XCircle className="size-5 text-destructive" />
          )}
        </div>
      ))}
    </CardContainer>
  );
}
