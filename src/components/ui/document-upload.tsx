import * as React from "react"
import { useTranslations } from 'next-intl'
import { Upload, X, FileInput } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FieldValues, UseFormReturn } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ReactNode } from 'react'

interface DocumentUploadFieldProps<T extends FieldValues> {
  id: string
  label?: string
  description?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any
  form: UseFormReturn<T>
  disabled?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingFile?: any
  aspectRatio?: "square" | "portrait",
  accept?: string
  maxSize?: number
  required?: boolean
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
  accept = "image/*,application/pdf",
                                      aspectRatio = "square"
                                    }: DocumentUploadFieldProps<T>) {
  const t = useTranslations('common.upload')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [pdfPreview, setPdfPreview] = React.useState<ReactNode | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  // Gérer la prévisualisation du fichier
  React.useEffect(() => {
    if (!field.value && !existingFile) {
      setPreview(null)
      return
    }

    // Si c'est un fichier existant (URL)
    if (existingFile && typeof existingFile === 'string') {
      setPreview(existingFile)
      return
    }

    // Si c'est un nouveau fichier
    if (field.value instanceof File) {
      const file = field.value
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
      }

      if (file.type === 'application/pdf') {
        setPdfPreview(<FileInput/>)
      }
    }
  }, [field.value, existingFile])

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled) return

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        field.onChange(droppedFile)
      }
    },
    [disabled, field]
  )

  const removeFile = () => {
    field.onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <FormField
      control={form.control}
      name={field.name}
      render={() => (
        <FormItem>
          {label && <FormLabel>
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </FormLabel>}
          <FormControl>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                if (!disabled) setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "relative rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors",
                isDragging && "border-primary bg-primary/5",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <Input
                id={id}
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={(e) => field.onChange(e.target.files?.[0])}
                disabled={disabled}
                className="hidden"
                max={maxSize * 1024 * 1024}
              />

              {!field.value && !existingFile ? (
                // État vide
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
                // Fichier sélectionné
                <div className="relative p-4">
                  <div className="flex items-center gap-4">
                    {/* Prévisualisation */}
                    {preview && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type={"button"} variant="ghost" className="p-0">
                            <div className={cn(
                              "relative overflow-hidden rounded",
                              aspectRatio === "square" ? "h-16 w-16" : "h-20 w-16"
                            )}>
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
                          <div className={cn(
                            "relative overflow-hidden rounded-lg",
                            aspectRatio === "square" ? "aspect-square" : "aspect-[3/4]"
                          )}>
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

                    {/* Informations du fichier */}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium">
                        {field.value?.name || 'Document téléchargé'}
                      </p>
                      {field.value?.size && (
                        <p className="text-sm text-muted-foreground">
                          {(field.value.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        disabled={disabled}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FormControl>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
          <TradFormMessage />
        </FormItem>
      )}
    />
  )
}