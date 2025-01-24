import { Button } from '@/components/ui/button';
import { TableRowsSplit } from 'lucide-react';

interface DataTableDensityProps {
  density: 'compact' | 'normal' | 'comfortable';
  onChange: (density: 'compact' | 'normal' | 'comfortable') => void;
}

export function DataTableDensity({ density, onChange }: DataTableDensityProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={density === 'compact' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('compact')}
      >
        <TableRowsSplit className="size-4 rotate-180" />
      </Button>
      <Button
        variant={density === 'normal' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('normal')}
      >
        <TableRowsSplit className="size-4" />
      </Button>
      <Button
        variant={density === 'comfortable' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('comfortable')}
      >
        <TableRowsSplit className="size-4 scale-y-150" />
      </Button>
    </div>
  );
}
