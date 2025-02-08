'use client';

import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filters?: FilterOption[];
}

export type FilterOption = {
  type: 'search' | 'radio' | 'checkbox';
  label: string;
  property?: string;
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  options?: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
};

export function DataTableToolbar<TData>({
  table,
  filters,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations('common.data_table');
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {filters?.map((filter) => (
          <Fragment key={filter.type + filter.property}>
            {filter.type === 'search' && (
              <Input
                placeholder={filter.label}
                defaultValue={filter.defaultValue}
                value={table.getColumn(filter.property ?? '')?.getFilterValue() as string}
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
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t('resetFilters')}
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
