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
  component?: React.ReactNode;
  disabled?: boolean;
}

interface MultiSelectMultipleProps<T> {
  options: Array<Option<T>>;
  selected?: T[];
  onChange: (values: T[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  type: 'multiple';
  disabled?: boolean;
  autoComplete?: string;
}

interface MultiSelectSingleProps<T> {
  options: Array<Option<T>>;
  selected?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  type: 'single';
  disabled?: boolean;
  autoComplete?: string;
}

export function MultiSelect<T>({
  options,
  selected,
  onChange,
  placeholder = 'Sélectionner...',
  searchPlaceholder = 'Rechercher...',
  emptyText = 'Aucun résultat trouvé.',
  type = 'multiple',
  disabled = false,
  autoComplete = 'off',
}: MultiSelectMultipleProps<T> | MultiSelectSingleProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  // Create a safe array of selected values regardless of type
  const selectedValues = React.useMemo(() => {
    if (type === 'multiple') {
      return (selected as T[] | undefined) || [];
    }
    return selected !== undefined ? [selected as T] : [];
  }, [selected, type]);

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const toggleOption = (value: T) => {
    if (type === 'single') {
      // Handle single selection
      const singleOnChange = onChange as (value: T) => void;
      const newValue = selectedValues.includes(value) ? undefined : value;
      singleOnChange(newValue as T);
    } else {
      // Handle multiple selection
      const multipleOnChange = onChange as (values: T[]) => void;
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      multipleOnChange(newValues);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-fit w-max justify-between px-2"
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1">
              {type === 'multiple' && <span className="opacity-50">{placeholder}</span>}
              {type === 'single' && (
                <>
                  {selectedOptions.length > 0 ? (
                    <>
                      {selectedOptions[0]?.component ? (
                        selectedOptions[0]?.component
                      ) : (
                        <Badge variant={'info'}>{selectedOptions[0]?.label}</Badge>
                      )}
                    </>
                  ) : (
                    <span className="opacity-50">{placeholder}</span>
                  )}
                </>
              )}
            </div>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 z-[99999]">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              autoComplete={autoComplete}
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
                    disabled={option.disabled}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedValues.includes(option.value)
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {option.component ? option.component : <span>{option.label}</span>}
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
