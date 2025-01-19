// src/components/ui/data-table/data-table-export.tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface DataTableExportProps<TData> {
  data: TData[]
  filename?: string
}

export function DataTableExport<TData>({
                                         data,
                                         filename = 'export',
                                       }: DataTableExportProps<TData>) {
  const exportToCSV = () => {
    const csvContent = convertToCSV(data)
    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2)
    downloadFile(jsonContent, `${filename}.json`, 'application/json')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToCSV}>
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          Export JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}