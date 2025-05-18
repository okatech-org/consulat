import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuLabel, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  sortHandler?: (direction: 'asc' | 'desc') => void;
  labels?: {
    asc: string;
    desc: string;
  };
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  labels = {
    asc: 'Croissant',
    desc: 'Décroissant',
  },
  className,
  sortHandler,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDown />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUp />
            ) : (
              <ChevronsUpDown />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="text-sm font-medium text-muted-foreground p-1">
            Mode de tri
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              sortHandler?.('asc');
              column.toggleSorting(false);
            }}
          >
            <ArrowUp className="size-3.5 text-muted-foreground/70" />
            {labels.asc}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              sortHandler?.('desc');
              column.toggleSorting(true);
            }}
          >
            <ArrowDown className="size-3.5 text-muted-foreground/70" />
            {labels.desc}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
