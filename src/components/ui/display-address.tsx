'use client';

import { addressValidator } from '@/convex/lib/validators';
import type { CountryCode } from '@/lib/autocomplete-datas';
import type { ObjectType } from 'convex/values';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { InfoField } from './info-field';

type Address = ObjectType<typeof addressValidator.fields>;

export function DisplayAddress({
  address,
  title,
}: {
  address?: Address;
  title?: string;
}) {
  const t_countries = useTranslations('countries');
  const t_inputs = useTranslations('inputs');

  if (!address) return null;

  return (
    <section className="space-y-2">
      {title && (
        <header className="flex items-center gap-2 mb-2">
          <MapPin className="size-4" />
          <span>{title}</span>
        </header>
      )}
      <div className="grid grid-cols-2 gap-4">
        <InfoField label={t_inputs('address.street.label')} value={address.street} />
        <InfoField label={t_inputs('address.city.label')} value={address.city} />
        <InfoField
          label={t_inputs('address.postalCode.label')}
          value={address.postalCode}
        />
        <InfoField
          label={t_inputs('address.country.label')}
          value={t_countries(address.country as CountryCode)}
        />
        {address.complement && (
          <InfoField
            label={t_inputs('address.complement.label')}
            value={address.complement}
          />
        )}
      </div>
    </section>
  );
}
