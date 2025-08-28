'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { cn, retrievePhoneNumber } from '@/lib/utils';
import type { CountryCode, CountryIndicator } from '@/lib/autocomplete-datas';
import { phoneCountries } from '@/lib/autocomplete-datas';
import { FlagIcon } from './flag-icon';
import { MultiSelect } from './multi-select';

interface PhoneInputProps {
  value: string;
  onChangeAction: (value: string) => void;
  disabled?: boolean;
  options?: CountryCode[];
  className?: string;
  autoFocus?: boolean;
}

export function PhoneNumberInput({
  value,
  onChangeAction,
  disabled = false,
  options,
  autoFocus = false,
}: PhoneInputProps) {
  const t = useTranslations('inputs.phone');
  const [indicator, number] = retrievePhoneNumber(value);
  const availableCountries = options
    ? phoneCountries.filter((country) => options.includes(country.countryCode))
    : phoneCountries;
  const t_countries = useTranslations('countries');

  return (
    <div className={cn('flex items-center w-full relative gap-2')}>
      <MultiSelect<CountryIndicator>
        type="single"
        options={availableCountries.map((country) => ({
          label: `${t_countries(country.countryCode)} (${country.value})`,
          value: country.value,
          component: (
            <div className="flex items-center gap-2 min-w-max">
              <FlagIcon countryCode={country.countryCode} />
              {country.value}
            </div>
          ),
        }))}
        selected={indicator}
        onChange={(value) => {
          onChangeAction(`${value}-${number}`);
        }}
        disabled={disabled || availableCountries.length < 2}
        autoComplete="tel-country-code"
      />
      <Input
        value={number || ''}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '');
          const valueWithoutZero = value.replace(/^0+/, '');
          onChangeAction(`${indicator}-${valueWithoutZero}`);
        }}
        className="w-full"
        type="tel"
        disabled={disabled}
        autoComplete="tel"
        inputMode="tel"
        placeholder={t('placeholder')}
        autoFocus={autoFocus}
      />
    </div>
  );
}
