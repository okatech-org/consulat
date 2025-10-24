'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
} from '@tanstack/react-table';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar, type FilterOption } from './data-table-toolbar';
import { type BulkAction, DataTableBulkActions } from './data-table-bulk-actions';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

// Type pour définir les colonnes sticky
export interface StickyColumn {
  id: string;
  position: 'left' | 'right';
}

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
  exportTrigger?: React.ReactNode;
  hiddenColumns?: string[];
  onRefresh?: () => void;
  bulkActions?: BulkAction<TData>[];
  activeSorting?: [keyof TData, 'asc' | 'desc'];
  sticky?: StickyColumn[];
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
  hiddenColumns = [],
  exportTrigger,
  onRefresh,
  bulkActions = [],
  activeSorting,
  sticky = [],
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
    pageCount: totalCount ? Math.ceil(totalCount / pageSize) : 0,
  });

  // Helper function to get sticky styles for a column
  const getStickyStyles = (columnId: string) => {
    const stickyConfig = sticky.find((s) => s.id === columnId);
    if (!stickyConfig) return {};

    const baseStyles = {
      position: 'sticky' as const,
      zIndex: 10,
    };

    if (stickyConfig.position === 'left') {
      return {
        ...baseStyles,
        left: 0,
      };
    } else {
      return {
        ...baseStyles,
        right: 0,
      };
    }
  };

  // Helper function to check if a column is sticky
  const isColumnSticky = (columnId: string) => {
    return sticky.some((s) => s.id === columnId);
  };

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
        <div className="overflow-auto max-w-full">
          <Table className="min-w-max relative w-full">
            <TableHeader className="sticky top-0 z-20 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnId = header.column.id;
                    const stickyStyles = getStickyStyles(columnId);
                    const sticky = isColumnSticky(columnId);

                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={stickyStyles}
                        className={cn(
                          sticky && 'bg-muted border-r border-border shadow-sm',
                          sticky && 'z-20',
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.tr
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.05 }}
                  >
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Chargement des données...
                    </TableCell>
                  </motion.tr>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => {
                        onRowClick?.(row);
                      }}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.1, delay: index * 0.02 }}
                      className={cn(
                        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer',
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const columnId = cell.column.id;
                        const stickyStyles = getStickyStyles(columnId);
                        const sticky = isColumnSticky(columnId);

                        return (
                          <motion.td
                            key={cell.id}
                            style={stickyStyles}
                            className={cn(
                              'px-4 py-2 text-sm',
                              sticky && 'bg-background border-r border-border shadow-sm',
                              sticky && 'z-10',
                            )}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.1, delay: index * 0.02 }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </motion.td>
                        );
                      })}
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    key="no-data"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {t('no_data')}
                    </TableCell>
                  </motion.tr>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
