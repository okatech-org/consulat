import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, FileInput } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Controller, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import {
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { type ReactNode } from 'react';

interface DocumentUploadFieldProps<T extends FieldValues> {
  id: string;
  label?: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  form: UseFormReturn<T>;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingFile?: any;
  aspectRatio?: 'square' | 'portrait';
  accept?: string;
  maxSize?: number;
  required?: boolean;
}

export function DocumentUploadField<T extends FieldValues>({
  id,
  label,
  description,
  field,
  form,
  disabled,
  required = false,
  existingFile,
  maxSize = 1,
  accept = 'image/*,application/pdf',
  aspectRatio = 'square',
}: DocumentUploadFieldProps<T>) {
  const t = useTranslations('common.upload');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [pdfPreview, setPdfPreview] = React.useState<ReactNode | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Gérer la prévisualisation du fichier
  React.useEffect(() => {
    if (!field.value && !existingFile) {
      setPreview(null);
      return;
    }

    // Si c'est un fichier existant (URL)
    if (existingFile && typeof existingFile === 'string') {
      setPreview(existingFile);
      return;
    }

    // Si c'est un nouveau fichier
    if (field.value instanceof File) {
      const file = field.value;
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
      }

      if (file.type === 'application/pdf') {
        setPdfPreview(<FileInput />);
      }
    }
  }, [field.value, existingFile]);

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        field.onChange(droppedFile);
      }
    },
    [disabled, field],
  );

  const removeFile = () => {
    field.onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Controller
      name={field.name}
      control={form.control}
      render={({ field: formField, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={id}>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FieldLabel>
          )}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'relative rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors',
              isDragging && 'border-primary bg-primary/5',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <Input
              id={id}
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={(e) => formField.onChange(e.target.files?.[0])}
              disabled={disabled}
              className="hidden"
              max={maxSize * 1024 * 1024}
              aria-invalid={fieldState.invalid}
            />

            {!formField.value && !existingFile ? (
              <div className="relative flex flex-col items-center justify-center p-6 text-center">
                <Upload className="mb-4 size-8 text-muted-foreground" />
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => inputRef.current?.click()}
                >
                  {t('drop_zone.button')}
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('drop_zone.description', { size: 10 })}
                </p>
              </div>
            ) : (
              <div className="relative p-4">
                <div className="flex items-center gap-4">
                  {preview && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type={'button'} variant="ghost" className="p-0">
                          <div
                            className={cn(
                              'relative overflow-hidden rounded',
                              aspectRatio === 'square' ? 'h-16 w-16' : 'h-20 w-16',
                            )}
                          >
                            <Image
                              src={preview}
                              alt="Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <div
                          className={cn(
                            'relative overflow-hidden rounded-lg',
                            aspectRatio === 'square' ? 'aspect-square' : 'aspect-[3/4]',
                          )}
                        >
                          <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {pdfPreview}

                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium">
                      {formField.value?.name || 'Document téléchargé'}
                    </p>
                    {formField.value?.size && (
                      <p className="text-sm text-muted-foreground">
                        {(formField.value.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={removeFile}
                      disabled={disabled}
                      leftIcon={<X className="size-4" />}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
