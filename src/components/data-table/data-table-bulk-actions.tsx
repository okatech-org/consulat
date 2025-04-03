'use client';

import { Table } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { RequestStatus } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>;
  onUpdateStatus?: (selectedRows: TData[], status: RequestStatus) => Promise<void>;
}

export function DataTableBulkActions<TData>({
  table,
  onUpdateStatus,
}: DataTableBulkActionsProps<TData>) {
  const t_common = useTranslations('common');
  const t_inputs = useTranslations('inputs');
  const [isLoading, setIsLoading] = useState(false);

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  if (selectedCount === 0) return null;

  const handleStatusChange = async (status: RequestStatus) => {
    if (!onUpdateStatus) return;

    try {
      setIsLoading(true);
      await onUpdateStatus(selectedRows, status);
    } catch (error) {
      console.error('Error updating statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm text-muted-foreground">{selectedCount} selected</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8" disabled={isLoading}>
            {t_common('actions.bulk_actions')}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.values(RequestStatus).map((status) => (
            <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
              {t_inputs(`requestStatus.options.${status}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
