'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MultiSelectCountriesProps {
  countries: { id: string; name: string }[];
  selected: string[];
  onChangeAction: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelectCountries({
  countries,
  selected,
  onChangeAction,
  placeholder = 'Sélectionner des pays...',
}: MultiSelectCountriesProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const selectedCountries = countries.filter((country) => selected.includes(country.id));

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const toggleCountry = (countryId: string) => {
    const updatedValues = selected.includes(countryId)
      ? selected.filter((id) => id !== countryId)
      : [...selected, countryId];
    onChangeAction(updatedValues);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          rightIcon={<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />}
        >
          <div className="flex flex-wrap gap-1">
            {selectedCountries.length === 0 && placeholder}
            {selectedCountries.map((country) => (
              <Badge variant="secondary" key={country.id} className="mr-1">
                {country.name}
              </Badge>
            ))}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Rechercher un pays..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredCountries.map((country) => (
              <CommandItem
                key={country.id}
                value={country.name}
                onSelect={() => toggleCountry(country.id)}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selected.includes(country.id) ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {country.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
