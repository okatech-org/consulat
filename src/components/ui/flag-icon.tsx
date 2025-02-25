'use client';

import { CountryCode } from '@/lib/autocomplete-datas';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function FlagIcon({ countryCode }: { countryCode: CountryCode }) {
  const t_countries = useTranslations('countries');
  return (
    <Image
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      alt={t_countries(countryCode)}
      width={40}
      height={40}
    />
  );
}
