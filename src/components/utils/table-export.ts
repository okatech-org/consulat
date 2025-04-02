'use client';

import { downloadFilesAsZip } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

/**
 * Configuration for table data export
 */
export interface ExportConfig<T> {
  /**
   * The columns of the table
   */
  columns: ColumnDef<T, unknown>[];

  /**
   * The data to export
   */
  data: T[];

  /**
   * The filename to use for the export
   */
  filename?: string;

  /**
   * Selected rows for partial export
   */
  selectedRows?: Record<string, boolean>;

  /**
   * Only export selected rows
   */
  exportSelectedOnly?: boolean;
}

/**
 * Export table data as CSV
 * @param config Export configuration
 */
export function exportAsCSV<T extends Record<string, unknown>>(config: ExportConfig<T>) {
  const { columns, data, filename = 'export', selectedRows, exportSelectedOnly } = config;

  // Get visible columns (skip "select" and "actions" columns)
  const exportColumns = columns.filter(
    (col) => col.id !== 'select' && col.id !== 'actions' && 'accessorKey' in col,
  );

  // Get column headers
  const headers = exportColumns.map((col) => {
    // Use column title from header if available
    if (typeof col.header === 'function') {
      // This is a simplification, ideally you'd want to render the header and extract text
      return 'accessorKey' in col ? (col.accessorKey as string) : col.id;
    }
    return 'accessorKey' in col ? (col.accessorKey as string) : col.id;
  });

  // Determine which rows to export
  const rowsToExport =
    exportSelectedOnly && selectedRows
      ? data.filter((_, index) => selectedRows[index])
      : data;

  // Convert data to CSV rows
  const csvRows = [
    // Headers row
    headers.join(','),
    // Data rows
    ...rowsToExport.map((row) => {
      return exportColumns
        .map((col) => {
          const key = 'accessorKey' in col ? (col.accessorKey as string) : col.id || '';

          // Access data - handle nested properties
          let value: unknown;
          if (key.includes('.')) {
            // Handle nested property
            const parts = key.split('.');
            let current: any = row;
            for (const part of parts) {
              if (current === null || current === undefined) {
                current = undefined;
                break;
              }
              current = current[part];
            }
            value = current;
          } else {
            // Simple property
            value = row[key as keyof typeof row];
          }

          // Format value for CSV
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'object') {
            value = JSON.stringify(value).replace(/"/g, '""');
          }
          return `"${value}"`;
        })
        .join(',');
    }),
  ];

  // Create and download the CSV file
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export files from table data as a ZIP archive
 * @param items Items with URLs to download
 * @param setIsLoading Function to set loading state
 */
export function exportFilesAsZip<T extends { url?: string; name?: string }>(
  items: T[],
  setIsLoading: (isLoading: boolean) => void,
) {
  const filesToDownload = items
    .filter(
      (item): item is T & { url: string; name: string } => !!item.url && !!item.name,
    )
    .map((item) => ({
      url: item.url,
      name: item.name,
    }));

  if (filesToDownload.length === 0) {
    console.warn('No files to download');
    return;
  }

  downloadFilesAsZip(filesToDownload, setIsLoading);
}
