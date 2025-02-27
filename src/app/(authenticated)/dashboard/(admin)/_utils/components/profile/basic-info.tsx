import { useTranslations } from 'next-intl';
import { FullProfile } from '@/types';
import { CheckCircle2, XCircle } from 'lucide-react';
import CardContainer from '@/components/layouts/card-container';
import { CountryCode } from '@/lib/autocomplete-datas';
import { useDateLocale } from '@/lib/utils';
interface ProfileBasicInfoProps {
  profile: FullProfile;
}

export function ProfileBasicInfo({ profile }: ProfileBasicInfoProps) {
  const { formatDate } = useDateLocale();
  const t = useTranslations('admin.registrations.review');
  const t_countries = useTranslations('countries');

  const fields = [
    {
      label: t('fields.name'),
      value: `${profile.firstName} ${profile.lastName}`,
      isValid: !!profile.firstName && !!profile.lastName,
    },
    {
      label: t('fields.birth_date'),
      value: formatDate(profile.birthDate),
      isValid: !!profile.birthDate,
    },
    {
      label: t('fields.birth_place'),
      value: profile.birthPlace,
      isValid: !!profile.birthPlace,
    },
    {
      label: t('fields.nationality'),
      value: t_countries(profile.nationality as CountryCode),
      isValid: !!profile.nationality,
    },
  ];

  return (
    <CardContainer title={t('sections.basic_info')} contentClass="space-y-4">
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
