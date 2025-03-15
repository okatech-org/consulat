'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CountryCode, CountryIndicator, phoneCountries } from '@/lib/autocomplete-datas';
import { FlagIcon } from './flag-icon';
import { FormItem, TradFormMessage, FormField } from './form';
import { FormControl } from './form';
import { UseFormReturn } from 'react-hook-form';
import { MultiSelect } from './multi-select';

export interface PhoneValue {
  number: string;
  countryCode: CountryIndicator;
}

interface PhoneInputProps {
  // eslint-disable-next-line
  parentForm: UseFormReturn<any>;
  fieldName: string;
  disabled?: boolean;
  options?: CountryCode[];
  className?: string;
  defaultCountry?: CountryIndicator;
}

export function PhoneInput({
  parentForm,
  fieldName,
  className,
  disabled = false,
  options,
  defaultCountry = '+33',
  ...props
}: PhoneInputProps) {
  const t = useTranslations('inputs.phone');
  const availableCountries = options
    ? phoneCountries.filter((country) => options.includes(country.countryCode))
    : phoneCountries;
  const t_countries = useTranslations('countries');

  return (
    <div className={cn('flex w-full relative gap-2', className)} {...props}>
      {parentForm && (
        <>
          <FormField
            control={parentForm?.control}
            name={`${fieldName}.countryCode`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MultiSelect<CountryCode>
                    type="single"
                    options={availableCountries.map((country) => ({
                      label: `${t_countries(country.countryCode)} (${country.value})`,
                      value: country.value as CountryCode,
                      component: (
                        <div className="flex items-center gap-2">
                          <FlagIcon countryCode={country.countryCode} />
                          {country.value}
                        </div>
                      ),
                    }))}
                    selected={(field.value as CountryCode) ?? defaultCountry}
                    onChange={field.onChange}
                    disabled={disabled}
                    autoComplete="tel-country-code"
                  />
                </FormControl>
                <TradFormMessage className="text-xs absolute top-full" />
              </FormItem>
            )}
          />

          <FormField
            control={parentForm?.control}
            name={`${fieldName}.number`}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const valueWithoutZero = value.replace(/^0+/, '');
                      field.onChange(valueWithoutZero);
                    }}
                    type="tel"
                    disabled={disabled}
                    autoComplete="tel-national"
                    placeholder={t('placeholder')}
                  />
                </FormControl>
                <TradFormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
}
