'use client';

import * as React from 'react';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { FlagIcon } from './flag-icon';
import { CountryCode } from '@/convex/lib/constants';

// Define a base interface for common properties
interface BaseCountrySelect {
  options?: CountryCode[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

// Extend the base interface for single select
interface SingleSelectCountry extends BaseCountrySelect {
  type: 'single';
  selected?: CountryCode;
  onChange: (value: CountryCode) => void;
  disabledOptions?: CountryCode[];
}

// Extend the base interface for multi select
interface MultiSelectCountry extends BaseCountrySelect {
  type: 'multiple';
  selected?: CountryCode[];
  onChange: (values: CountryCode[]) => void;
  disabledOptions?: CountryCode[];
}

// Use a discriminated union for the props
type CountrySelectProps = SingleSelectCountry | MultiSelectCountry;

export function CountrySelect(props: CountrySelectProps) {
  const t = useTranslations('common');
  const t_countries = useTranslations('countries');

  const {
    type,
    selected,
    onChange: onValueChange,
    options = Object.values(CountryCode),
    placeholder = t('country.placeholder'),
    searchPlaceholder = t('country.search'),
    emptyText = t('country.empty'),
    disabledOptions = [],
    disabled = false,
  } = props;
  const onChange = (value: CountryCode | CountryCode[]) => {
    if (type === 'single') {
      onValueChange(value as CountryCode);
    } else {
      onValueChange(value as CountryCode[]);
    }
  };
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || options.length < 2}
            rightIcon={<ChevronsUpDown className="size-4 shrink-0 opacity-50" />}
          >
            <div className="flex items-center gap-2">
              {type === 'single' && selected && (
                <div className="flex items-center gap-1">
                  <FlagIcon countryCode={selected as CountryCode} />
                  <span>{t_countries(selected)}</span>
                </div>
              )}
              {type === 'multiple' && selected && selected.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selected.map((country) => (
                    <Badge key={country}>{t_countries(country)}</Badge>
                  ))}
                </div>
              )}

              {!selected && <span className="text-muted-foreground">{placeholder}</span>}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-9"
              disabled={disabled}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((country: CountryCode) => (
                  <CommandItem
                    key={country}
                    value={t_countries(country)}
                    onSelect={() => {
                      onChange(country);
                      setOpen(false);
                    }}
                    disabled={disabledOptions.includes(country)}
                  >
                    <div className="flex items-center gap-2">
                      <FlagIcon countryCode={country} />
                      <span>{t_countries(country)}</span>
                    </div>
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        selected === country ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
