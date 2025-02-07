import { useTranslations } from 'next-intl';
import { FullProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ProfileBasicInfoProps {
  profile: FullProfile;
}

export function ProfileBasicInfo({ profile }: ProfileBasicInfoProps) {
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
      value: format(new Date(profile.birthDate), 'PPP', { locale: fr }),
      isValid: !!profile.birthDate,
    },
    {
      label: t('fields.birth_place'),
      value: profile.birthPlace,
      isValid: !!profile.birthPlace,
    },
    {
      label: t('fields.nationality'),
      value: t_countries(profile.nationality),
      isValid: !!profile.nationality,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.basic_info')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
