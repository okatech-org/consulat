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
import { BulkAction, DataTableBulkActions } from './data-table-bulk-actions';

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
  exportFilename?: string;
  exportSelectedOnly?: boolean;
  exportTrigger?: React.ReactNode;
  hiddenColumns?: string[];
  onRefresh?: () => void;
  bulkActions?: BulkAction<TData>[];
  activeSorting?: [keyof TData, 'asc' | 'desc'];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  totalCount,
  pageIndex = 0,
  pageSize = 10,
  onRowClick,
  isLoading = false,
  onPageChange,
  onLimitChange,
  exportFilename,
  exportSelectedOnly = false,
  hiddenColumns = [],
  exportTrigger,
  onRefresh,
  bulkActions = [],
  activeSorting,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('common.data_table');

  const initialColumnVisibility: VisibilityState = {};
  hiddenColumns.forEach((columnId) => {
    initialColumnVisibility[columnId] = false;
  });

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    initialColumnVisibility,
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    if (activeSorting) {
      setSorting([{ id: activeSorting[0] as string, desc: activeSorting[1] === 'desc' }]);
    }
  }, [activeSorting]);

  // Use pageIndex directly from props
  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: pageIndex,
      pageSize: pageSize,
    }));
  }, [pageIndex, pageSize]);

  const [pagination, setPagination] = React.useState({
    pageIndex: pageIndex,
    pageSize: pageSize,
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
        pageIndex: pageIndex,
        pageSize: pageSize,
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
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);

      if (onPageChange && newPagination.pageIndex !== pagination.pageIndex) {
        onPageChange(newPagination.pageIndex);
      }

      if (onLimitChange && newPagination.pageSize !== pagination.pageSize) {
        onLimitChange(newPagination.pageSize);
      }
    },
    rowCount: totalCount,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <DataTableToolbar
            isLoading={isLoading}
            filters={filters}
            table={table}
            onRefresh={onRefresh}
          />
          {table.getFilteredSelectedRowModel().rows.length > 0 &&
            bulkActions.length > 0 && (
              <DataTableBulkActions table={table} actions={bulkActions} />
            )}

          {exportTrigger}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table className="min-w-max relative w-full">
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
