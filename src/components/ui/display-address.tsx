'use client';

import { CountryCode } from '@/lib/autocomplete-datas';
import { Address } from '@prisma/client';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DisplayAddress({ address, title }: { address: Address; title?: string }) {
  const t_countries = useTranslations('countries');

  if (!address) return null;

  return (
    <section className="space-y-1">
      {title && (
        <header className="flex items-center gap-2">
          <MapPin className="size-4" />
          <span>{title}</span>
        </header>
      )}
      <p className="text-sm" aria-label={'Address first line'}>
        {address.firstLine && <>{address.firstLine}</>}
      </p>
      <p className="text-sm" aria-label={'Address city'}>
        {address?.city}
        {'zipCode' in address && address.zipCode && <>, {address.zipCode}</>}
      </p>
      {'country' in address && address.country && (
        <p className="text-sm" aria-label={'Address country'}>
          {t_countries(address.country as CountryCode)}
        </p>
      )}
      {address.secondLine && (
        <p className="text-sm" aria-label={'Address second line'}>
          {address.secondLine}
        </p>
      )}
    </section>
  );
}
