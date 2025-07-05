'use client';

import type { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { RefreshCw } from 'lucide-react';

import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { debounce } from 'lodash';

// eslint-disable-next-line
export interface BaseFilterOption<TData = Record<string, any>> {
  property: string;
  isDisabled?: boolean;
  label: string;
}

export interface SearchFilterOption<TData = unknown> extends BaseFilterOption<TData> {
  type: 'search';
  defaultValue: string;
  onChange: (value: string) => void;
  debounce?: number;
}

export interface RadioFilterOption<TData = unknown> extends BaseFilterOption<TData> {
  type: 'radio';
  defaultValue: string;
  onChange: (value: string) => void;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export interface CheckboxFilterOption<TData = unknown> extends BaseFilterOption<TData> {
  type: 'checkbox';
  defaultValue: string[];
  onChange: (value: string[]) => void;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export type FilterOption<TData = unknown> =
  | SearchFilterOption<TData>
  | RadioFilterOption<TData>
  | CheckboxFilterOption<TData>;

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filters?: FilterOption<TData>[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  filters,
  isLoading = false,
  onRefresh,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations('common.data_table');
  const isFiltered = false;
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center space-x-2">
        <div
          className={`flex items-center flex-wrap gap-2 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {filters?.map((filter, index) => (
            <Fragment key={filter.type + index + filter.property}>
              {filter.type === 'search' && (
                <Input
                  disabled={filter.isDisabled}
                  placeholder={filter.label}
                  value={searchValue}
                  onChange={(event) => {
                    const value = (event.target as HTMLInputElement).value;
                    setSearchValue(value);
                    const debouncedSearch = debounce((value: string) => {
                      filter.onChange(value);
                    }, filter.debounce ?? 300);
                    debouncedSearch(value);
                  }}
                  className="w-[150px] lg:w-[250px] max-w-max"
                />
              )}

              {filter.type === 'checkbox' && filter.options && (
                <DataTableFacetedFilter
                  isDisabled={filter.isDisabled}
                  type={filter.type}
                  key={filter.property}
                  column={table.getColumn(filter.property ?? '')}
                  title={filter.label}
                  options={filter.options}
                  onChange={(value) => filter.onChange(value as string[])}
                  defaultValue={filter.defaultValue}
                />
              )}

              {filter.type === 'radio' && filter.options && (
                <DataTableFacetedFilter
                  isDisabled={filter.isDisabled}
                  type={filter.type}
                  key={filter.property}
                  column={table.getColumn(filter.property ?? '')}
                  title={filter.label}
                  options={filter.options}
                  onChange={(value) => filter.onChange(value as string)}
                  defaultValue={filter.defaultValue}
                />
              )}
            </Fragment>
          ))}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            size="mobile"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
            disabled={isLoading}
            rightIcon={<X />}
          >
            {t('resetFilters')}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="mobile"
            className="h-8 px-2"
            onClick={onRefresh}
            disabled={isLoading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          />
        )}
        <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
          <DataTableViewOptions table={table} />
        </div>
        {isLoading && <Loader2 className="animate-spin ml-2 h-4 w-4" />}
      </div>
    </div>
  );
}
