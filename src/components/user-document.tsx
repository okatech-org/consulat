"use client"

import * as React from "react"
import { useTranslations } from 'next-intl'
import { Upload, X, FileInput, Calendar, Eye, Pencil, PenIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import Image from "next/image"
import { Input } from '@/components/ui/input'
import { AppUserDocument } from "@/types"
import { DocumentStatus, DocumentType } from '@prisma/client'
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUserDocument, deleteUserDocument, updateUserDocument } from '@/actions/user-documents'
import { useToast } from '@/hooks/use-toast'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReloadIcon } from '@radix-ui/react-icons'
import { MetadataForm } from '@/components/metadata-form'

interface UserDocumentProps {
  document?: AppUserDocument | null
  expectedType?: DocumentType
  profileId?: string
  label: string
  description?: string
  required?: boolean
  disabled?: boolean
}

const updateDocumentSchema = z.object({
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
})

type UpdateDocumentData = z.infer<typeof updateDocumentSchema>

export function UserDocument({
                               document,
                               label,
                               description,
                               profileId,
                               expectedType = DocumentType.IDENTITY_PHOTO,
                               required = false,
                               disabled = false,
                             }: UserDocumentProps) {
  const t = useTranslations('common.components')
  const t_messages = useTranslations('messages.components')
  const { toast } = useToast()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const handleDelete = async (documentId: string) => {
    try {
      setIsLoading(true)
      const result = await deleteUserDocument(documentId)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: t_messages('success.update_title'),
        description: t_messages('success.update_description'),
        variant: "success"
      })

      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: t_messages('errors.update_failed'),
        description: error instanceof Error ? error.message : t_messages('errors.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = useCallback(async (type: DocumentType, file: FormData) => {
    try {
      setIsLoading(true)
      const result = await createUserDocument(type, file, profileId)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: t_messages('success.update_title'),
        description: t_messages('success.update_description'),
        variant: "success"
      })

      router.refresh()
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: t_messages('errors.update_failed'),
        description: error instanceof Error ? error.message : t_messages('errors.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [profileId, toast, t_messages, router])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdate = async (documentId: string, data: any) => {
    try {
      setIsLoading(true)
      const result = await updateUserDocument(documentId, data)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: t_messages('success.update_title'),
        description: t_messages('success.update_description'),
        variant: "success"
      })

      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: t_messages('errors.update_failed'),
        description: error instanceof Error ? error.message : t_messages('errors.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const form = useForm<UpdateDocumentData>({
    resolver: zodResolver(updateDocumentSchema),
    defaultValues: {
      issuedAt: document?.issuedAt ? format(new Date(document.issuedAt), 'yyyy-MM-dd') : undefined,
      expiresAt: document?.expiresAt ? format(new Date(document.expiresAt), 'yyyy-MM-dd') : undefined,
      metadata: document?.metadata,
    },
  })

  // Gérer la prévisualisation
  React.useEffect(() => {
    if (!document?.fileUrl) {
      setPreview(null)
      return
    }

    if (document.fileUrl.endsWith('.pdf')) {
      setPreview(null)
      return
    }

    setPreview(document.fileUrl)
  }, [document])

  const handleDrop = React.useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return

      const file = e.dataTransfer.files[0]
      if (file) {
        setIsLoading(true)
        try {
          const formData = new FormData()
          formData.append('files', file)
          await handleUpload(document?.type || DocumentType.IDENTITY_PHOTO, formData)
        } finally {
          setIsLoading(false)
        }
      }
    },
    [disabled, document?.type, handleUpload]
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsLoading(true)
      try {
        const formData = new FormData()

        formData.append('files', file)

        await handleUpload(document?.type ?? expectedType, formData)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const onUpdate = async (data: UpdateDocumentData) => {
    if (!document) return

    try {
      await handleUpdate(document.id, data)
      setIsUpdating(false)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: DocumentStatus) => {
    const variants: Record<DocumentStatus, "default" | "success" | "destructive" | "warning"> = {
      PENDING: "warning",
      VALIDATED: "success",
      REJECTED: "destructive",
      EXPIRED: "destructive",
      EXPIRING: "warning",
    }
    return (
      <Badge variant={variants[status]}>
        {t(`status.${status.toLowerCase()}`)}
      </Badge>
    )
  }

  return (
    <div className="mb-2 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {document?.status && getStatusBadge(document.status)}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative aspect-[4/1.5] p-4 rounded-lg border-2 border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <Input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          disabled={disabled || isLoading}
          className="hidden"
        />

        {!document ? (
          // État vide
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="mb-4 size-8 text-muted-foreground" />
            <Button
              type="button"
              variant="outline"
              className={"gap-1"}
              disabled={disabled || isLoading}
              onClick={() => inputRef.current?.click()}
            >
              {isLoading && <ReloadIcon className={'animate-rotate size-6'} />}

              {isLoading ? t('actions.uploading') : t('actions.upload')}
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('upload.description')}
            </p>
          </div>
        ) : (
          // Document existant
          <div className="flex h-full gap-4">
            {/* Prévisualisation */}
            {preview ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="ghost" className="flex aspect-document h-full max-h-[150px] w-auto overflow-hidden !p-0">
                    <Image
                      src={preview}
                      alt="Preview"
                      width={400}
                      height={600}
                      className="size-full object-cover"
                    />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <div className="relative aspect-document overflow-hidden rounded-lg">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex aspect-document h-full max-h-[150px] w-auto items-center justify-center rounded-md bg-muted">
                <FileInput className="size-10 opacity-20" />
              </div>
            )}

            {/* Actions */}
            <div className="absolute right-1 top-1 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsUpdating(true)}
                disabled={disabled || isLoading}
              >
                <PenIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(document.fileUrl, '_blank')}
                disabled={disabled || isLoading}
              >
                <Eye className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(document.id)}
                disabled={disabled || isLoading}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Informations */}
            <div className="flex flex-1 grow flex-col justify-end space-y-1 pt-6">
              <p className="text-sm text-muted-foreground">
                {(document.issuedAt || document.expiresAt) && (<>
                  {t('validity', {
                    start: document.issuedAt ? format(new Date(document.issuedAt), 'dd-MM-yyyy', { locale: fr }) : 'N/A',
                    end: document.expiresAt ? format(new Date(document.expiresAt), 'dd-MM-yyyy', { locale: fr }) : 'N/A',
                  })}
                </>)}
              </p>
              {document.metadata && (
                <div className="text-sm text-muted-foreground">
                  {Object.entries(document.metadata).map(([key, value]) => (
                    <p key={key}>{t(`metadata.${key}`)}: {value}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dialog de mise à jour */}
      <Dialog open={isUpdating} onOpenChange={setIsUpdating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('update.title')}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="dates">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dates">{t('update.tabs.dates')}</TabsTrigger>
              <TabsTrigger value="metadata">{t('update.tabs.metadata')}</TabsTrigger>
            </TabsList>
            <TabsContent value="dates">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="issuedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('dates.issued_on')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('dates.expires_on')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUpdating(false)}
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {t('actions.save')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="metadata">
              {document && (
                <MetadataForm
                  documentType={document.type}
                  metadata={document.metadata}
                  onSubmit={async (metadata) => {
                    await handleUpdate(document.id, { metadata })
                    setIsUpdating(false)
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}