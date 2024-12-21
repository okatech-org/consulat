"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { UserDocument } from '@prisma/client'
import { EditableSection } from '../editable-section'
import { Button } from '@/components/ui/button'
import { DocumentStatus } from '@/components/ui/info-field'
import { FileUp, Eye, Download } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { ProfileDocumentsFormData, ProfileDocumentsSchema } from '@/schemas/documents'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfile } from '@/actions/profile'
import { Form, FormField } from '@/components/ui/form'
import { DocumentUploadField } from '@/components/ui/document-upload'
import { Card, CardContent } from '@/components/ui/card'

interface DocumentsSectionProps {
  documents: {
    passport?: UserDocument | null
    birthCertificate?: UserDocument | null
    residencePermit?: UserDocument | null
    addressProof?: UserDocument | null
  }
  className?: string
}

interface DocumentCardProps {
  document: UserDocument | null | undefined
  label: string
  required?: boolean
  onView?: (url: string) => void
  onDownload?: (url: string, filename: string) => void
}

function DocumentCard({ document, label, required = true, onView, onDownload }: DocumentCardProps) {
  const t = useTranslations('common')

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {document && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(document.fileUrl)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload?.(document.fileUrl, `${document.type.toLowerCase()}.pdf`)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {document ? (
        <div className="rounded-lg border p-3 space-y-2">
          <DocumentStatus
            type={label}
            isUploaded={true}
            customText={t("documents.status." + document.status.toLowerCase())}
          />
          {document.expiresAt && (
            <p className="text-sm text-muted-foreground">
              {t('documents.expires_on')}: {format(new Date(document.expiresAt), 'PPP', { locale: fr })}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <FileUp className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {t('upload.title')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('upload.description')}
              </p>
            </div>
            <Button variant="secondary" size="sm" className="mt-2">
              {t('actions.upload')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function DocumentsSection({ documents, className }: DocumentsSectionProps) {
  const t = useTranslations('common')
  const t_profile = useTranslations('profile')
  const t_messages = useTranslations('messages.profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<ProfileDocumentsFormData>({
    resolver: zodResolver(ProfileDocumentsSchema),
  })

  const handleView = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const data = form.getValues()
      const formData = new FormData()

      // Ajouter les fichiers au FormData
      Object.entries(data).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file as File)
        }
      })

      const result = await updateProfile(formData, 'documents')

      if (result.error) {
        toast({
          title: t_messages('errors.update_failed'),
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: t_messages('success.update_title'),
        description: t_messages('success.update_description'),
        variant: "success"
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: t_messages('errors.update_failed'),
        description: t_messages('errors.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderDocumentField = (
    fieldName: keyof ProfileDocumentsFormData,
    label: string,
    currentDocument?: UserDocument | null,
    required = true
  ) => {
    if (isEditing) {
      return (
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <DocumentUploadField
              id={fieldName}
              label={label}
              field={field}
              form={form}
              existingFile={currentDocument?.fileUrl}
              required={required}
              disabled={isLoading}
              description={t('upload.description')}
            />
          )}
        />
      )
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          {currentDocument && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleView(currentDocument.fileUrl)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(currentDocument.fileUrl, `${currentDocument.type.toLowerCase()}.pdf`)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {currentDocument ? (
          <div className="rounded-lg border p-3 space-y-2">
            <DocumentStatus
              type={label}
              isUploaded={true}
              customText={t("documents.status." + currentDocument.status.toLowerCase())}
            />
            {currentDocument.expiresAt && (
              <p className="text-sm text-muted-foreground">
                {t('documents.expires_on')}: {format(new Date(currentDocument.expiresAt), 'PPP', { locale: fr })}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <FileUp className="h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {t('upload.title')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('upload.description')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <EditableSection
      title={t_profile('sections.documents')}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={() => {
        form.reset()
        setIsEditing(false)
      }}
      onSave={handleSave}
      isLoading={isLoading}
      className={className}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <div className="grid grid-cols-1 md:grid-cols-2 py-4 gap-6">
            {renderDocumentField(
              'passportFile',
              t('documents.types.passport'),
              documents.passport
            )}
            {renderDocumentField(
              'birthCertificateFile',
              t('documents.types.birth_certificate'),
              documents.birthCertificate
            )}
            {renderDocumentField(
              'residencePermitFile',
              t('documents.types.residence_permit'),
              documents.residencePermit,
              false
            )}
            {renderDocumentField(
              'addressProofFile',
              t('documents.types.proof_of_address'),
              documents.addressProof
            )}
          </div>
        </form>
      </Form>
    </EditableSection>
  )
}