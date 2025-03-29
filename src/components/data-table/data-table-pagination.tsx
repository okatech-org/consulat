import { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const t = useTranslations('common.data_table');

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex-1 text-sm text-muted-foreground">
        {t('selected_rows', {
          selected: table.getFilteredSelectedRowModel().rows.length,
          total: table.getFilteredRowModel().rows.length,
        })}
      </div>
      <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{t('rows_per_page')}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {t('page_of_total', {
            page: table.getState().pagination.pageIndex,
            total: table.getPageCount(),
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => {
              table.setPageIndex(table.getPageCount() - (table.getPageCount() - 1));
            }}
            disabled={
              !table.getCanPreviousPage() || table.getState().pagination.pageIndex === 1
            }
          >
            <span className="sr-only">{t('go_to_first')}</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.previousPage()}
            disabled={
              !table.getCanPreviousPage() || table.getState().pagination.pageIndex === 1
            }
          >
            <span className="sr-only">{t('previous')}</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.nextPage()}
            disabled={
              !table.getCanNextPage() ||
              table.getState().pagination.pageIndex === table.getPageCount()
            }
          >
            <span className="sr-only">{t('next')}</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => {
              table.setPageIndex(table.getPageCount() - 1);
            }}
            disabled={
              !table.getCanNextPage() ||
              table.getState().pagination.pageIndex === table.getPageCount()
            }
          >
            <span className="sr-only">{t('go_to_last')}</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
