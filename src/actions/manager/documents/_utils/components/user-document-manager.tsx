'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { UserDocument, DocumentStatus, DocumentType } from '@prisma/client'
import { Calendar, Download, Eye, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DocumentUploadField } from '@/components/ui/document-upload'
import { UserDocumentActions, UserDocumentUpdate } from '@/types/documents'
import { useToast } from '@/hooks/use-toast'

interface UserDocumentManagerProps {
  document: UserDocument | null
  type: DocumentType
  required?: boolean
  actions: UserDocumentActions
}

export function UserDocumentManager({
                                      document,
                                      type,
                                      required = false,
                                      actions,
                                    }: UserDocumentManagerProps) {
  const t = useTranslations('documents')
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<UserDocumentUpdate>({
    defaultValues: {
      issuedAt: document?.issuedAt ? new Date(document.issuedAt) : undefined,
      expiresAt: document?.expiresAt ? new Date(document.expiresAt) : undefined,
    },
  })

  const handleView = () => {
    if (document?.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }

  const handleDownload = async () => {
    if (!document?.fileUrl) return
    try {
      const response = await fetch(document.fileUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type.toLowerCase()}.${document.fileUrl.split('.').pop()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: t('download.error.title'),
        description: t('download.error.description'),
        variant: 'destructive',
      })
    }
  }

  const handleUpdate = async (data: UserDocumentUpdate) => {
    try {
      setIsLoading(true)
      await actions.onUpdate(data)
      setIsUpdateDialogOpen(false)
      toast({
        title: t('update.success.title'),
        description: t('update.success.description'),
      })
    } catch (error) {
      toast({
        title: t('update.error.title'),
        description: t('update.error.description'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await actions.onDelete()
      setIsDeleteDialogOpen(false)
      toast({
        title: t('delete.success.title'),
        description: t('delete.success.description'),
      })
    } catch (error) {
      toast({
        title: t('delete.error.title'),
        description: t('delete.error.description'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: DocumentStatus): "default" | "success" | "warning" | "destructive" => {
    switch (status) {
      case "VALIDATED":
        return "success"
      case "PENDING":
        return "warning"
      case "REJECTED":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t(`types.${type.toLowerCase()}`)}
          </CardTitle>
          {document && (
            <Badge variant={getStatusColor(document.status)}>
              {t(`status.${document.status.toLowerCase()}`)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {document ? (
          <>
            {document.issuedAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {t('issued_on', {
                    date: format(new Date(document.issuedAt), 'PPP', {
                      locale: fr,
                    }),
                  })}
                </span>
              </div>
            )}
            {document.expiresAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {t('expires_on', {
                    date: format(new Date(document.expiresAt), 'PPP', {
                      locale: fr,
                    }),
                  })}
                </span>
              </div>
            )}
          </>
        ) : (
          <DocumentUploadField
            id={type}
            label={t(`types.${type.toLowerCase()}`)}
            description={t(`descriptions.${type.toLowerCase()}`)}
            required={required}
            onUpload={actions.onUpload}
          />
        )}
      </CardContent>

      {document && (
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex-1"
          >
            <Eye className="mr-2 h-4 w-4" />
            {t('actions.view')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {t('actions.download')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUpdateDialogOpen(true)}
            className="flex-1"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {t('actions.update')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('actions.delete')}
          </Button>
        </CardFooter>
      )}

      {/* Dialog de mise à jour */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('update.title')}</DialogTitle>
            <DialogDescription>{t('update.description')}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="issuedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('issued_date')}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                        onChange={e => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('expiry_date')}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                        onChange={e => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                  disabled={isLoading}
                >
                  {t('actions.cancel')}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {t('actions.save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete.title')}</DialogTitle>
            <DialogDescription>{t('delete.description')}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {t('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}