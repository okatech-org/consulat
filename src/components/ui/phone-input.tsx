'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { CountryCode, CountryIndicator, phoneCountries } from '@/lib/autocomplete-datas';
import { FlagIcon } from './flag-icon';

export interface PhoneValue {
  number: string;
  countryCode: CountryIndicator;
}

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: PhoneValue;
  onChange?: (value: PhoneValue) => void;
  error?: boolean;
  disabled?: boolean;
  options?: CountryCode[];
}

export function PhoneInput({
  className,
  value,
  onChange,
  error,
  disabled = false,
  options,
  ...props
}: PhoneInputProps) {
  const availableCountries = options
    ? phoneCountries.filter((country) => options.includes(country.countryCode))
    : phoneCountries;
  const t = useTranslations('common');
  const t_countries = useTranslations('countries');

  React.useEffect(() => {
    if (!value && availableCountries.length > 0) {
      onChange?.({
        number: '',
        countryCode: availableCountries[0].value,
      });
    }
  }, [value, availableCountries, onChange]);

  const phoneValue = value ?? {
    number: '',
    countryCode: availableCountries[0]?.value ?? '+33',
  };

  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d]/g, '');
    const newValue = {
      number: newNumber,
      countryCode: value?.countryCode || availableCountries[0].value,
    };
    onChange?.(newValue);
  };

  const handleCountrySelect = (code: CountryIndicator) => {
    const newValue = {
      number: phoneValue.number,
      countryCode: code,
    };
    setOpen(false);
    onChange?.(newValue);
  };

  // Helper function to get country code (e.g., "FR") from country indicator (e.g., "+33")
  const getCountryCodeFromIndicator = (indicator: CountryIndicator): CountryCode => {
    const country = phoneCountries.find((country) => country.value === indicator);
    return country ? country.countryCode : 'FR';
  };

  const filteredCountries = availableCountries.filter((country) => {
    const searchTermLower = searchValue.toLowerCase();
    return (
      country.value.includes(searchTermLower) ||
      t_countries(country.countryCode).toLowerCase().includes(searchTermLower) ||
      country.countryCode.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <div className="flex w-full gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'min-w-max !px-2 justify-between',
              error && 'border-destructive',
            )}
            disabled={disabled}
          >
            <span className="flex items-center gap-1">
              <FlagIcon
                countryCode={getCountryCodeFromIndicator(
                  phoneValue?.countryCode || '+33',
                )}
              />
              {phoneValue?.countryCode || '+33'}{' '}
            </span>
            <ChevronsUpDown className="ml-1 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput
              placeholder={t('search_country')}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>{t('no_country_found')}</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map((country, index) => (
                  <CommandItem
                    key={country.value + index}
                    value={`${country.value} ${t_countries(country.countryCode)}`}
                    onSelect={() => handleCountrySelect(country.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        phoneValue.countryCode === country.value
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    <div className="flex items-center gap-1">
                      <FlagIcon countryCode={country.countryCode} />
                      <span>
                        {t_countries(country.countryCode)} ({country.value})
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        className={cn(className, error && 'border-destructive')}
        value={phoneValue.number}
        onChange={handlePhoneChange}
        {...props}
        disabled={disabled}
      />
    </div>
  );
}
