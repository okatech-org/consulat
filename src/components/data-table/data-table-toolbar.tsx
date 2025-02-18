'use client';

import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
import { Loader2 } from 'lucide-react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filters?: FilterOption<TData>[];
  isLoading?: boolean;
}

export type FilterOption<TData = unknown> = {
  type: 'search' | 'radio' | 'checkbox';
  label: string;
  property?: keyof TData & string;
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  filterFn?: (row: TData) => boolean;
  filterKeys?: (keyof TData)[];
  options?: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  isDisabled?: boolean;
};

export function DataTableToolbar<TData>({
  table,
  filters,
  isLoading = false,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations('common.data_table');
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div
          className={`flex items-center space-x-2 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {filters?.map((filter) => (
            <Fragment key={filter.type + filter.property}>
              {filter.type === 'search' && (
                <Input
                  disabled={filter.isDisabled}
                  placeholder={filter.label}
                  defaultValue={filter.defaultValue}
                  value={
                    table.getColumn(filter.property ?? '')?.getFilterValue() as string
                  }
                  onChange={(event) => {
                    const value = (event.target as HTMLInputElement).value;
                    if (filter.onChange) {
                      filter.onChange(value);
                    } else {
                      table.getColumn(filter.property ?? '')?.setFilterValue(value);
                    }
                  }}
                  className="h-8 w-[150px] lg:w-[250px]"
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
                  onChange={(value) => {
                    if (filter.onChange) {
                      filter.onChange(value);
                    } else {
                      table.getColumn(filter.property ?? '')?.setFilterValue(value);
                    }
                  }}
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
                  onChange={filter.onChange}
                  defaultValue={filter.defaultValue}
                />
              )}
            </Fragment>
          ))}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
            disabled={isLoading}
          >
            {t('resetFilters')}
            <X />
          </Button>
        )}
        {isLoading && <Loader2 className="animate-spin ml-2 h-4 w-4" />}
      </div>
      <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
