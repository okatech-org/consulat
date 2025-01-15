"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'
import { useTranslations } from 'next-intl'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filters?: FilterOption[]
}

export type FilterOption = {
  type?: "search" | "radio"
  value: string
  label: string
  options?: FilterOption[]
}

export function DataTableToolbar<TData>({
                                          table,
                                          filters,
                                        }: DataTableToolbarProps<TData>) {
  const t = useTranslations("common.data_table")
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {filters?.map((filter) => {
          if (filter.type === "search") {
            return (
              <Input
                key={filter.value}
                placeholder={filter.label}
                value={(table.getColumn(filter.value)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(filter.value)?.setFilterValue(event.target.value)
                }
                className="h-8 w-[150px] lg:w-[250px]"
              />
            )
          } else if (filter.type === "radio" && filter.options) {
            return (
              <DataTableFacetedFilter
                key={filter.value}
                column={table.getColumn(filter.value)}
                title={filter.label}
                options={filter.options}
              />
            )
          }
          return null
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t("resetFilters")}
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}