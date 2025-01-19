import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface DataTableFiltersProps {
  filters: {
    column: string
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith'
    value: string
  }[]
  onAddFilter: () => void
  onRemoveFilter: (index: number) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange: (index: number, filter: any) => void
  columns: { id: string; header: string }[]
}

export function DataTableFilters({
                                   filters,
                                   onAddFilter,
                                   onRemoveFilter,
                                   onFilterChange,
                                   columns,
                                 }: DataTableFiltersProps) {
  return (
    <div className="space-y-2">
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select
            value={filter.column}
            onValueChange={(value) =>
              onFilterChange(index, { ...filter, column: value })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner une colonne" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  {column.header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.operator}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onValueChange={(value: any) =>
              onFilterChange(index, { ...filter, operator: value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Opérateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Égal à</SelectItem>
              <SelectItem value="contains">Contient</SelectItem>
              <SelectItem value="startsWith">Commence par</SelectItem>
              <SelectItem value="endsWith">Termine par</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={filter.value}
            onChange={(e) =>
              onFilterChange(index, { ...filter, value: e.target.value })
            }
            placeholder="Valeur"
            className="w-[200px]"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveFilter(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={onAddFilter}>
        Ajouter un filtre
      </Button>
    </div>
  )
}