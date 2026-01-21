import type { UseFormReturn } from 'react-hook-form';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { Controller } from 'react-hook-form';
import { Input } from './input';
import { CountrySelect } from './country-select';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldLegend,
} from './field';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getAutocompleteForField, type AutocompleteSection } from '@/lib/form/autocomplete';

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
  autocompleteSection?: AutocompleteSection;
}

export function AddressField({
  form,
  fields,
  isLoading,
  countries,
  className,
  autocompleteSection,
}: AddressFieldProps) {
  const t_inputs = useTranslations('inputs');

  return (
    <FieldSet className={cn('col-span-full grid grid-cols-2 gap-4', className)}>
      <FieldLegend variant="label">Adresse</FieldLegend>
      
      <Controller
        name={fields.firstLine}
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="col-span-full sm:col-span-1" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`address-field-${fields.firstLine}`}>
              {t_inputs('address.firstLine.label')}
            </FieldLabel>
            <Input
              {...field}
              id={`address-field-${fields.firstLine}`}
              value={field.value ?? ''}
              placeholder={t_inputs('address.firstLine.placeholder')}
              disabled={isLoading}
              aria-invalid={fieldState.invalid}
              autoComplete={getAutocompleteForField('street', { section: autocompleteSection })}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {fields.secondLine && (
        <Controller
          name={fields.secondLine}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="col-span-full sm:col-span-1" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`address-field-${fields.secondLine}`}>
                {t_inputs('address.secondLine.label')}
              </FieldLabel>
              <Input
                {...field}
                id={`address-field-${fields.secondLine}`}
                value={field.value ?? ''}
                placeholder={t_inputs('address.secondLine.placeholder')}
                disabled={isLoading}
                aria-invalid={fieldState.invalid}
                autoComplete={getAutocompleteForField('complement', { section: autocompleteSection })}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      <div className="col-span-full grid grid-cols-3 gap-2">
        <Controller
          name={fields.city}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="col-span-2" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`address-field-${fields.city}`}>
                {t_inputs('address.city.label')}
              </FieldLabel>
              <Input
                {...field}
                id={`address-field-${fields.city}`}
                value={field.value ?? ''}
                placeholder={t_inputs('address.city.placeholder')}
                disabled={isLoading}
                aria-invalid={fieldState.invalid}
                autoComplete={getAutocompleteForField('city', { section: autocompleteSection })}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {fields.postalCode && (
          <Controller
            name={fields.postalCode}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`address-field-${fields.postalCode}`}>
                  {t_inputs('address.zipCode.label')}
                </FieldLabel>
                <Input
                  {...field}
                  id={`address-field-${fields.postalCode}`}
                  value={field.value ?? ''}
                  placeholder={t_inputs('address.zipCode.placeholder')}
                  disabled={isLoading}
                  type="number"
                  aria-invalid={fieldState.invalid}
                  autoComplete={getAutocompleteForField('postalCode', { section: autocompleteSection })}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )}
      </div>

      <Controller
        name={fields.country}
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="col-span-full" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`address-field-${fields.country}`}>
              {t_inputs('address.country.label')}
            </FieldLabel>
            <CountrySelect
              id={`address-field-${fields.country}`}
              type="single"
              selected={field.value as CountryCode}
              onChange={field.onChange}
              {...(countries && { options: countries })}
              disabled={isLoading}
              autoComplete={getAutocompleteForField('country', { section: autocompleteSection })}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldSet>
  );
}
