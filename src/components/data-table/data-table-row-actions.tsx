"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

type RowAction<T> = {
  label: ReactNode
  onClick: (row: T) => void
  shortcut?: string
  subMenu?: RowAction<T>[]
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  actions: RowAction<TData>[]
}

export function DataTableRowActions<TData>({
  row,
  actions
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {actions.map((action, index) => (
          action.subMenu ? (
            <DropdownMenuSub key={index}>
              <DropdownMenuSubTrigger>{action.label}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {action.subMenu.map((subAction, subIndex) => (
                  <DropdownMenuItem key={subIndex} onClick={() => subAction.onClick(row.original)}>
                    {subAction.label}
                    {subAction.shortcut && (
                      <DropdownMenuShortcut>{subAction.shortcut}</DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem key={index} onClick={() => action.onClick(row.original)}>
              {action.label}
              {action.shortcut && (
                <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          )
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}