'use client';

import type { CountryCode } from '@/convex/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface FlagIconProps {
  countryCode: CountryCode;
  size?: number;
  className?: string;
}

export function FlagIcon({ countryCode, className, size = 40 }: FlagIconProps) {
  const t_countries = useTranslations('countries');
  return countryCode ? (
    <Image
      src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
      alt={t_countries(countryCode)}
      width={size}
      height={size}
      className={cn('w-5 !h-auto', className)}
    />
  ) : undefined;
}
