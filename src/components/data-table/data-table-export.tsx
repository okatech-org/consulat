'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface DataTableExportProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filename?: string;
  selectedRows?: Record<string, boolean>;
  disableWhenNoSelection?: boolean;
}

/**
 * Composant pour exporter les données d'une table en CSV.
 *
 * Note: L'utilisation de `any` pour l'accès à `accessorKey` est nécessaire
 * car TanStack Table a plusieurs types de colonnes (AccessorColumn, GroupColumn, etc.)
 * avec des structures différentes, ce qui rend difficile la création d'un type unique
 * satisfaisant le linter sans compromettre la compatibilité.
 */
export function DataTableExport<TData, TValue = unknown>({
  columns,
  data,
  filename = 'export',
  selectedRows = {},
  disableWhenNoSelection = false,
}: DataTableExportProps<TData, TValue>) {
  const [selectedColumns, setSelectedColumns] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);

  // Initialiser les colonnes sélectionnées
  const initializeSelectedColumns = () => {
    const initialSelected: Record<string, boolean> = {};
    columns.forEach((column) => {
      // Utilisation de "any" nécessaire pour accéder à la propriété accessorKey
      // qui peut exister sur différents types de colonnes
      const columnId = column.id || (column as any).accessorKey || undefined;

      if (columnId && columnId !== 'select' && columnId !== 'actions') {
        initialSelected[String(columnId)] = true;
      }
    });
    setSelectedColumns(initialSelected);
  };

  // Gérer l'ouverture du dialogue
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && Object.keys(selectedColumns).length === 0) {
      initializeSelectedColumns();
    }
    setOpen(newOpen);
  };

  // Check if any rows are selected
  const hasSelectedRows = Object.keys(selectedRows).length > 0;
  const isExportDisabled = disableWhenNoSelection && !hasSelectedRows;

  // Filter data to only include selected rows if there are any
  const getExportData = () => {
    if (hasSelectedRows) {
      return data.filter((_, index) => selectedRows[index] === true);
    }
    return data;
  };

  // Convertir les données en CSV
  const convertToCSV = () => {
    // Get the filter data (only selected rows if any are selected)
    const exportData = getExportData();

    // Filtrer les colonnes sélectionnées
    const exportColumns = columns.filter((column) => {
      // accessorKey n'est pas garantie d'être présente sur tous les types de colonnes
      const columnId = column.id || (column as any).accessorKey || undefined;

      return (
        columnId &&
        selectedColumns[String(columnId)] &&
        columnId !== 'select' &&
        columnId !== 'actions'
      );
    });

    if (exportColumns.length === 0 || exportData.length === 0) return '';

    // Créer les en-têtes
    const headers = exportColumns.map((column) => {
      // Obtenir le titre de la colonne
      let title = '';
      if (typeof column.header === 'string') {
        title = column.header;
      } else if ((column as any).accessorKey) {
        // Utilisation de "any" nécessaire pour les colonnes de type AccessorColumn
        title = (column as any).accessorKey;
      } else if (column.id) {
        title = column.id;
      }
      return `"${title.replace(/"/g, '""')}"`;
    });

    // Créer les lignes de données
    const rows = exportData.map((row) => {
      return exportColumns
        .map((column) => {
          let value = '';

          if ((column as any).accessorKey) {
            // Utilisation de type indexé pour éviter l'erreur de typage
            // Certaines colonnes utilisent accessorKey pour accéder aux données
            const rowAsRecord = row as Record<string, unknown>;
            const cellValue = rowAsRecord[(column as any).accessorKey];

            if (cellValue === null || cellValue === undefined) {
              value = '';
            } else if (typeof cellValue === 'object') {
              value = JSON.stringify(cellValue);
            } else {
              value = String(cellValue);
            }
          } else if (column.id) {
            // Pour les colonnes calculées, utiliser l'id comme fallback
            const rowAsRecord = row as Record<string, unknown>;
            const cellValue = rowAsRecord[column.id];
            value = cellValue ? String(cellValue) : '';
          }

          // Échapper les doubles quotes et entourer de quotes si nécessaire
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    // Assembler le CSV
    return [headers.join(','), ...rows].join('\n');
  };

  // Télécharger le CSV
  const downloadCSV = () => {
    const csv = convertToCSV();
    if (!csv) return;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Format date and time for filename
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${dateStr}_${timeStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setOpen(false);
  };

  // Render un nom de colonne lisible
  const renderColumnName = (column: ColumnDef<TData, TValue>) => {
    // Utilisation de "any" nécessaire car la structure de column varie selon le type
    const columnId = column.id || (column as any).accessorKey || undefined;

    if (!columnId || columnId === 'select' || columnId === 'actions') {
      return null;
    }

    let columnName = '';
    if (typeof column.header === 'string') {
      columnName = column.header;
    } else if ((column as any).accessorKey) {
      // accessorKey peut être utilisé comme titre de colonne si header n'est pas disponible
      columnName = (column as any).accessorKey;
    } else {
      columnName = String(columnId);
    }

    return (
      <div key={String(columnId)} className="flex items-center space-x-2">
        <Checkbox
          id={`column-${String(columnId)}`}
          checked={!!selectedColumns[String(columnId)]}
          onCheckedChange={(checked) => {
            setSelectedColumns((prev) => ({
              ...prev,
              [String(columnId)]: !!checked,
            }));
          }}
        />
        <Label htmlFor={`column-${String(columnId)}`}>{columnName}</Label>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-max gap-1"
                  disabled={isExportDisabled}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Exporter</span>
                </Button>
              </DialogTrigger>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isExportDisabled
                ? 'Sélectionnez au moins une ligne pour exporter'
                : 'Exporter les données en CSV'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter les données</DialogTitle>
          <DialogDescription>
            Sélectionnez les colonnes à inclure dans l&apos;export CSV
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
            {columns.map((column) => renderColumnName(column))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" onClick={downloadCSV}>
            Télécharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
