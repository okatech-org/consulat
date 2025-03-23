'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from '@tanstack/react-table';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar, FilterOption } from './data-table-toolbar';
import { DataTableExport } from './data-table-export';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters?: FilterOption<TData>[];
  totalCount?: number;
  pageSize?: number;
  onRowClick?: (row: Row<TData>) => void;
  isLoading?: boolean;
  pageIndex?: number;
  onPageChange?: (pageIndex: number) => void;
  onLimitChange?: (pageSize: number) => void;
  enableExport?: boolean;
  exportFilename?: string;
  exportSelectedOnly?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  totalCount,
  pageIndex,
  pageSize,
  onRowClick,
  isLoading = false,
  onPageChange,
  onLimitChange,
  enableExport = false,
  exportFilename,
  exportSelectedOnly = false,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('common.data_table');
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: pageIndex ?? 1,
    pageSize: pageSize ?? 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    initialState: {
      pagination: {
        pageIndex: pageIndex ?? 1,
        pageSize: pageSize ?? 10,
      },
    },
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange: (updater) => {
      setPagination((prev) => {
        const newPagination = typeof updater === 'function' ? updater(prev) : updater;
        onPageChange?.(newPagination.pageIndex);
        onLimitChange?.(newPagination.pageSize);
        return newPagination;
      });
    },
    rowCount: totalCount,
  });

  return (
    <div className="space-y-4">
      {filters?.length ? (
        <div className="flex items-center justify-between gap-2">
          <DataTableToolbar isLoading={isLoading} filters={filters} table={table} />
          {enableExport && (
            <DataTableExport
              columns={columns}
              data={data}
              filename={exportFilename}
              selectedRows={rowSelection}
              disableWhenNoSelection={exportSelectedOnly}
            />
          )}
        </div>
      ) : enableExport ? (
        <div className="flex items-center justify-end">
          <DataTableExport
            columns={columns}
            data={data}
            filename={exportFilename}
            selectedRows={rowSelection}
            disableWhenNoSelection={exportSelectedOnly}
          />
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table className="min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} onClick={() => {}}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => {
                    onRowClick?.(row);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('no_data')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
