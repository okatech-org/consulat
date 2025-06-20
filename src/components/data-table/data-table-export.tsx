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
import * as XLSX from 'xlsx';

interface DataTableExportProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filename?: string;
  selectedRows?: Record<string, boolean>;
  disableWhenNoSelection?: boolean;
  onExport?: (exportedData: TData[]) => void;
  exportFormat?: 'xlsx' | 'csv';
}

/**
 * Composant pour exporter les données d'une table en XLSX ou CSV.
 */
export function DataTableExport<TData, TValue = unknown>({
  columns,
  data,
  filename = 'export',
  selectedRows = {},
  disableWhenNoSelection = false,
  onExport,
  exportFormat = 'xlsx',
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
    const exportData = hasSelectedRows
      ? data.filter((_, index) => selectedRows[index] === true)
      : data;

    // Call the callback if provided
    if (onExport && exportData.length > 0) {
      onExport(exportData);
    }

    return exportData;
  };

  // Get filtered columns
  const getExportColumns = () => {
    return columns.filter((column) => {
      const columnId = column.id || (column as any).accessorKey || undefined;

      return (
        columnId &&
        selectedColumns[String(columnId)] &&
        columnId !== 'select' &&
        columnId !== 'actions'
      );
    });
  };

  // Convert data to CSV format
  const convertToCSV = () => {
    const exportData = getExportData();
    const exportColumns = getExportColumns();

    if (exportColumns.length === 0 || exportData.length === 0) return '';

    // Create headers
    const headers = exportColumns.map((column) => {
      let title = '';
      if (typeof column.header === 'string') {
        title = column.header;
      } else if ((column as any).accessorKey) {
        title = (column as any).accessorKey;
      } else if (column.id) {
        title = column.id;
      }
      return `"${title.replace(/"/g, '""')}"`;
    });

    // Create data rows
    const rows = exportData.map((row) => {
      return exportColumns
        .map((column) => {
          let value = '';

          if ((column as any).accessorKey) {
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
            const rowAsRecord = row as Record<string, unknown>;
            const cellValue = rowAsRecord[column.id];
            value = cellValue ? String(cellValue) : '';
          }

          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  // Prepare data for XLSX format
  const prepareForXLSX = () => {
    const exportData = getExportData();
    const exportColumns = getExportColumns();

    if (exportColumns.length === 0 || exportData.length === 0) return null;

    // Create headers
    const headers = exportColumns.map((column) => {
      let title = '';
      if (typeof column.header === 'string') {
        title = column.header;
      } else if ((column as any).accessorKey) {
        title = (column as any).accessorKey;
      } else if (column.id) {
        title = column.id;
      }
      return title;
    });

    // Create data rows
    const rows = exportData.map((row) => {
      return exportColumns.map((column) => {
        if ((column as any).accessorKey) {
          const rowAsRecord = row as Record<string, unknown>;
          const cellValue = rowAsRecord[(column as any).accessorKey];

          if (cellValue === null || cellValue === undefined) {
            return '';
          } else if (typeof cellValue === 'object') {
            return JSON.stringify(cellValue);
          } else {
            return cellValue;
          }
        } else if (column.id) {
          const rowAsRecord = row as Record<string, unknown>;
          const cellValue = rowAsRecord[column.id];
          return cellValue !== null && cellValue !== undefined ? cellValue : '';
        }
        return '';
      });
    });

    return [headers, ...rows];
  };

  // Download the file in selected format
  const downloadFile = () => {
    // Format date and time for filename
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS
    const formattedFilename = `${filename}-${dateStr}_${timeStr}`;

    if (exportFormat === 'xlsx') {
      const data = prepareForXLSX();
      if (!data) return;

      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      // Generate XLSX
      XLSX.writeFile(workbook, `${formattedFilename}.xlsx`);
    } else {
      const csv = convertToCSV();
      if (!csv) return;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${formattedFilename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setOpen(false);
  };

  // Render column name
  const renderColumnName = (column: ColumnDef<TData, TValue>) => {
    const columnId = column.id || (column as any).accessorKey || undefined;

    if (!columnId || columnId === 'select' || columnId === 'actions') {
      return null;
    }

    let columnName = '';
    if (typeof column.header === 'string') {
      columnName = column.header;
    } else if ((column as any).accessorKey) {
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
                  size="mobile"
                  className="min-w-max gap-1"
                  disabled={isExportDisabled}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  <span className="sr-only sm:not-sr-only">
                    {`Exporter (${Object.entries(selectedRows).filter(([_, value]) => value).length} lignes)`}
                  </span>
                </Button>
              </DialogTrigger>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isExportDisabled
                ? 'Sélectionnez au moins une ligne pour exporter'
                : `Exporter les données en ${exportFormat === 'xlsx' ? 'Excel' : 'CSV'}`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter les données</DialogTitle>
          <DialogDescription>
            Sélectionnez les colonnes à inclure dans l&apos;export{' '}
            {exportFormat === 'xlsx' ? 'Excel' : 'CSV'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
            {columns.map((column) => renderColumnName(column))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="mobile" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" size="mobile" weight="medium" onClick={downloadFile}>
            Télécharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
