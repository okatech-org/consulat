'use client'

import { Eye, Download, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardFooter } from './card'
import { Badge } from './badge'
import { useTranslations } from 'next-intl'
import { DocumentStatus } from '@prisma/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DocumentPreviewProps {
  document?: {
    fileUrl: string
    status: DocumentStatus
    type: string
    expiresAt?: Date | null
    metadata?: {
      documentNumber?: string
    }
  }
  onView?: () => void
  onDownload?: () => void
}

export function DocumentPreview({
                                  document,
                                  onView,
                                  onDownload
                                }: DocumentPreviewProps) {
  const t = useTranslations('common.documents')

  if (!document) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>{t('no_document')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = () => {
    switch (document.status) {
      case 'VALIDATED':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'REJECTED':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span>{t(`status.${document.status.toLowerCase()}`)}</span>
          </div>
          <Badge variant={document.status === 'VALIDATED' ? 'success' : 'destructive'}>
            {t(`status.${document.status.toLowerCase()}`)}
          </Badge>
        </div>

        {document.expiresAt && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t('expires_on')}: {format(new Date(document.expiresAt), 'PPP', { locale: fr })}
          </p>
        )}

        {document.metadata?.documentNumber && (
          <p className="mt-1 text-sm text-muted-foreground">
            N°: {document.metadata.documentNumber}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {onView && (
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            {t('actions.view')}
          </Button>
        )}
        {onDownload && (
          <Button variant="outline" size="sm" className="flex-1" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            {t('actions.download')}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}