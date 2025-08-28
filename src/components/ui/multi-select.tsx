'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  className?: string;
  showSelected?: boolean;
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
  className?: string;
  showSelected?: boolean;
}

type MultiSelectProps<T> = MultiSelectMultipleProps<T> | MultiSelectSingleProps<T>;

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
  className = '',
  showSelected = true,
}: MultiSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const removeOption = (value: T, e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'multiple') {
      const multipleOnChange = onChange as (values: T[]) => void;
      const newValues = selectedValues.filter((v) => v !== value);
      multipleOnChange(newValues);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div className="space-y-2">
      <div className="relative" ref={containerRef}>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('min-h-10 w-full justify-between px-3 py-2', className)}
          disabled={disabled}
          onClick={() => setOpen(!open)}
          rightIcon={<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
        >
          <div className="flex flex-1 items-center overflow-hidden">
            {type === 'single' ? (
              // Single selection display - show selected option in button
              selectedOptions.length > 0 ? (
                selectedOptions[0]?.component ? (
                  selectedOptions[0]?.component
                ) : (
                  <span className="truncate">{selectedOptions[0]?.label}</span>
                )
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )
            ) : // Multiple selection display - show count or placeholder in button
            selectedOptions.length > 0 ? (
              <span className="text-sm">
                {selectedOptions.length} élément{selectedOptions.length > 1 ? 's' : ''}{' '}
                sélectionné{selectedOptions.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>

        {open && (
          <div className="absolute top-full z-50 w-full min-w-max rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none animate-in">
            <Command>
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchValue}
                onValueChange={setSearchValue}
                autoComplete={autoComplete}
                autoFocus
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
          </div>
        )}
      </div>

      {/* Display selected options below the button for multiple selection */}
      {type === 'multiple' && selectedOptions.length > 0 && showSelected && (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <Badge
              key={String(option.value)}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {option.component ? option.component : option.label}
              <button
                type="button"
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={(e) => removeOption(option.value, e)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {option.label}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
