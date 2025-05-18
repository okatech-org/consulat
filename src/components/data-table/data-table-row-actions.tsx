'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Fragment, ReactNode } from 'react';

export type RowAction<T> = {
  component?: ReactNode;
  label?: ReactNode;
  onClick?: (row: T) => void;
  shortcut?: string;
  subMenu?: RowAction<T>[];
};

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: RowAction<TData>[];
}

export function DataTableRowActions<TData>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex size-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-max">
        {actions.map((action, index) => (
          <Fragment key={index}>
            <DropdownMenuItem asChild>{action.component}</DropdownMenuItem>

            {action.label && action.onClick && !action.subMenu && (
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  action.onClick?.(row.original);
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
                            subAction.onClick?.(row.original);
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
