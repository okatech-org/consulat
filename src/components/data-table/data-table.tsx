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
import { DataTableBulkActions } from './data-table-bulk-actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import { RequestStatus } from '@prisma/client';

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
  onExport?: (data: TData[]) => void;
  hiddenColumns?: string[];
  onRefresh?: () => void;
  onBulkUpdateStatus?: (selectedRows: TData[], status: RequestStatus) => Promise<void>;
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
  enableExport = false,
  exportFilename,
  exportSelectedOnly = false,
  hiddenColumns = [],
  onExport,
  onRefresh,
  onBulkUpdateStatus,
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
      {filters?.length ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DataTableToolbar
              isLoading={isLoading}
              filters={filters}
              table={table}
              onRefresh={onRefresh}
            />
            {table.getFilteredSelectedRowModel().rows.length > 0 &&
              onBulkUpdateStatus && (
                <DataTableBulkActions table={table} onUpdateStatus={onBulkUpdateStatus} />
              )}
          </div>
          {enableExport && (
            <DataTableExport
              columns={columns}
              data={data}
              filename={exportFilename}
              selectedRows={rowSelection}
              disableWhenNoSelection={exportSelectedOnly}
              onExport={onExport}
            />
          )}
        </div>
      ) : enableExport ? (
        <div className="flex items-center justify-between">
          {table.getFilteredSelectedRowModel().rows.length > 0 && onBulkUpdateStatus && (
            <DataTableBulkActions table={table} onUpdateStatus={onBulkUpdateStatus} />
          )}
          <DataTableExport
            columns={columns}
            data={data}
            filename={exportFilename}
            selectedRows={rowSelection}
            disableWhenNoSelection={exportSelectedOnly}
            onExport={onExport}
          />
        </div>
      ) : table.getFilteredSelectedRowModel().rows.length > 0 && onBulkUpdateStatus ? (
        <div className="flex items-center justify-end">
          <DataTableBulkActions table={table} onUpdateStatus={onBulkUpdateStatus} />
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
