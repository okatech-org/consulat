'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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

interface Option<T> {
  value: T;
  label: string;
}

interface MultiSelectProps<T> {
  options: Option<T>[];
  selected: T[];
  onChange: (values: T[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  type?: 'single' | 'multiple';
  disabled?: boolean;
}

export function MultiSelect<T extends string | number>({
  options,
  selected,
  onChange,
  placeholder = 'Sélectionner...',
  searchPlaceholder = 'Rechercher...',
  emptyText = 'Aucun résultat trouvé.',
  type = 'multiple',
  disabled = false,
}: MultiSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const selectedOptions = options.filter((option) => selected.includes(option.value));

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const toggleOption = (value: T) => {
    let updatedValues: T[];
    if (type === 'single') {
      updatedValues = selected.includes(value) ? [] : [value];
    } else {
      updatedValues = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
    }
    onChange(updatedValues);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1">
              {type === 'multiple' && <span className="opacity-50">{placeholder}</span>}
              {type === 'single' && (
                <>
                  {selectedOptions.length > 0 ? (
                    <Badge variant={'info'}>{selectedOptions[0].label}</Badge>
                  ) : (
                    <span className="opacity-50">{placeholder}</span>
                  )}
                </>
              )}
            </div>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    value={option.label}
                    onSelect={() => {
                      toggleOption(option.value);
                      if (type === 'single') {
                        setOpen(false);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selected.includes(option.value) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {type === 'multiple' && (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <Badge
              onClick={() => {
                toggleOption(option.value);
              }}
              key={String(option.value)}
              variant={'info'}
              className="mr-1"
            >
              {option.label}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}
