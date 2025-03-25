'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
}

export function FileUpload({
  value = [],
  onChange,
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      // Vérifier le nombre de fichiers
      if (acceptedFiles.length > maxFiles) {
        setError(`You can only upload ${maxFiles} file(s) at a time`);
        return;
      }

      // Vérifier la taille des fichiers
      const oversizedFiles = acceptedFiles.filter((file) => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        setError(
          `File(s) too large: ${oversizedFiles
            .map((f) => f.name)
            .join(', ')}. Max size is ${maxSize / 1024 / 1024}MB`,
        );
        return;
      }

      // TODO: Implémenter le téléchargement des fichiers
      // Pour l'instant, on simule juste avec les noms de fichiers
      onChange([...value, ...acceptedFiles.map((file) => file.name)]);
    },
    [maxFiles, maxSize, onChange, value],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept?.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>,
    ),
    maxSize,
    maxFiles,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((file, index) => (
            <li key={index} className="flex items-center justify-between gap-2">
              <span className="text-sm truncate">{file}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
