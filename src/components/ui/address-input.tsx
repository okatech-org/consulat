'use client';

import * as React from 'react';

import { AddressInput as AddressInputType, AddressSchema } from '@/schemas/inputs';
import { CountryCode } from '@/lib/autocomplete-datas';
import { CountrySelect } from './country-select';
import { FormField, FormItem, FormLabel, FormControl, TradFormMessage } from './form';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { Input } from './input';
import { zodResolver } from '@hookform/resolvers/zod';

interface AddressInputProps {
  value: AddressInputType;
  label?: string;
  onChange?: (value: AddressInputType) => void;
  error?: boolean;
  disabled?: boolean;
}

export function AddressInput({ label, value, onChange, disabled }: AddressInputProps) {
  const t = useTranslations('inputs');
  const form = useForm<AddressInputType>({
    resolver: zodResolver(AddressSchema),
    defaultValues: value,
  });

  React.useEffect(() => {
    if (onChange) {
      onChange(form.getValues());
    }
  }, [form, onChange, form.formState]);

  return (
    <fieldset className="grid grid-cols-2 gap-x-4 space-y-4">
      <legend className="text-sm font-medium">{label}</legend>

      {/* Address Line 1 */}
      <FormField
        control={form.control}
        name="firstLine"
        render={({ field }) => (
          <FormItem className={'col-span-full md:col-span-1'}>
            <FormLabel>{t('address.firstLine.label')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('address.firstLine.placeholder')}
                disabled={disabled}
              />
            </FormControl>
            <TradFormMessage />
          </FormItem>
        )}
      />

      {/* Address Line 2 */}
      <FormField
        control={form.control}
        name="secondLine"
        render={({ field }) => (
          <FormItem className={'col-span-full md:col-span-1'}>
            <FormLabel>{t('address.secondLine.label')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t('address.secondLine.placeholder')}
                disabled={disabled}
              />
            </FormControl>
            <TradFormMessage />
          </FormItem>
        )}
      />

      {/* City and Zip Code */}
      <div className="col-span-full grid grid-cols-3 gap-2">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className={'col-span-2'}>
              <FormLabel>{t('address.city.label')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('address.city.placeholder')}
                  disabled={disabled}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address.zipCode.label')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('address.zipCode.placeholder')}
                  disabled={disabled}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Country */}
      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem className={'col-span-full'}>
            <FormLabel>{t('address.country.label')}</FormLabel>
            <FormControl>
              <CountrySelect
                type="single"
                selected={field.value as CountryCode}
                onChange={field.onChange}
              />
            </FormControl>
            <TradFormMessage />
          </FormItem>
        )}
      />
    </fieldset>
  );
}
