// src/components/ui/data-table/types.ts
import { ColumnDef, Table } from '@tanstack/react-table'

export interface DataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  data: TData[]
  searchKey?: string
  pageSize?: number
  emptyMessage?: string
  loadingMessage?: string
  isLoading?: boolean
  selectable?: boolean
  onRowSelect?: (selectedRows: TData[]) => void
}

export interface DataTablePaginationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>
  pageSizes?: number[]
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  filters?: DataTableFilter[]
}

export interface DataTableFilter {
  key: string
  label: string
  options: {
    label: string
    value: string
  }[]
}