'use client';

import { MoreHorizontal } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Fragment, type ReactNode } from 'react';

import type { Table } from '@tanstack/react-table';

export type BulkAction<T> = {
  label?: ReactNode;
  icon?: ReactNode;
  component?: ReactNode;
  onClick?: (selectedRows: T[]) => Promise<void> | void;
  disabled?: boolean;
  shortcut?: string;
  subMenu?: BulkAction<T>[];
};

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>;
  actions: BulkAction<TData>[];
}

export function DataTableBulkActions<TData>({
  table,
  actions,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={selectedCount === 0}>
        <Button
          variant="ghost"
          className="relative flex size-8 p-0 data-[state=open]:bg-muted"
          leftIcon={<MoreHorizontal />}
        >
          {selectedCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {selectedCount}
            </span>
          )}
          <span className="sr-only">Ouvrir le menu des actions de masse</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions de masse</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2 min-w-max">
          {actions.map((action, index) => (
            <Fragment key={index}>
              <DropdownMenuItem asChild>{action.component}</DropdownMenuItem>

              {action.label && action.onClick && !action.subMenu && (
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    action.onClick?.(selectedRows.map((row) => row.original));
                  }}
                >
                  {action.label}
                  {action.shortcut && (
                    <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              )}

              {action.subMenu && (
                <DropdownMenuSub key={index}>
                  <DropdownMenuSubTrigger>{action.label}</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {action.subMenu.map((subAction, subIndex) => (
                      <Fragment key={subIndex + 'sub'}>
                        {action.component}

                        {subAction.label && subAction.onClick && (
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              subAction.onClick?.(
                                selectedRows.map((row) => row.original),
                              );
                            }}
                          >
                            {subAction.label}
                            {subAction.shortcut && (
                              <DropdownMenuShortcut>
                                {subAction.shortcut}
                              </DropdownMenuShortcut>
                            )}
                          </DropdownMenuItem>
                        )}
                      </Fragment>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
            </Fragment>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
