import { UseFormReturn } from 'react-hook-form';
import { CountryCode } from '@/lib/autocomplete-datas';
import { Input } from './input';
import { CountrySelect } from './country-select';
import { FormControl, FormField, FormItem, FormLabel, TradFormMessage } from './form';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface AddressFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  fields: {
    firstLine: string;
    secondLine?: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  isLoading?: boolean;
  countries?: CountryCode[];
  className?: string;
}

export function AddressField({
  form,
  fields,
  isLoading,
  countries,
  className,
}: AddressFieldProps) {
  const t_inputs = useTranslations('inputs');

  return (
    <fieldset className={cn('col-span-full grid grid-cols-2 gap-4', className)}>
      {/* Address Line 1 */}
      <FormField
        control={form.control}
        name={fields.firstLine}
        render={({ field }) => (
          <FormItem className={'col-span-full sm:col-span-1'}>
            <FormLabel>{t_inputs('address.firstLine.label')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t_inputs('address.firstLine.placeholder')}
                disabled={isLoading}
              />
            </FormControl>
            <TradFormMessage />
          </FormItem>
        )}
      />

      {/* Address Line 2 */}
      <FormField
        control={form.control}
        name={fields.secondLine ?? ''}
        render={({ field }) => (
          <FormItem className={'col-span-full sm:col-span-1'}>
            <FormLabel>{t_inputs('address.secondLine.label')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t_inputs('address.secondLine.placeholder')}
                disabled={isLoading}
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
          name={fields.city}
          render={({ field }) => (
            <FormItem className={'col-span-2'}>
              <FormLabel>{t_inputs('address.city.label')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder={t_inputs('address.city.placeholder')}
                  disabled={isLoading}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={fields.postalCode ?? ''}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t_inputs('address.zipCode.label')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder={t_inputs('address.zipCode.placeholder')}
                  disabled={isLoading}
                  type="number"
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
        name={fields.country}
        render={({ field }) => (
          <FormItem className={'col-span-full'}>
            <FormLabel>{t_inputs('address.country.label')}</FormLabel>
            <FormControl>
              <CountrySelect
                type="single"
                selected={field.value as CountryCode}
                onChange={field.onChange}
                {...(countries && { options: countries })}
                disabled={isLoading}
              />
            </FormControl>
            <TradFormMessage />
          </FormItem>
        )}
      />
    </fieldset>
  );
}
