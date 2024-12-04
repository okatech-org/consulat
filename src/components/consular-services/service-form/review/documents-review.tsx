'use client'

import { DocumentType } from '@prisma/client'
import { FileText, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

interface DocumentsReviewProps {
  documents: Record<DocumentType, File | null>
}

export function DocumentsReview({ documents }: DocumentsReviewProps) {
  const t = useTranslations('consular.services.form')

  return (
    <div className="space-y-4">
      {Object.entries(documents).map(([type, file]) => (
        <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {t(`documents.types.${type.toLowerCase()}`)}
              </p>
              {file && (
                <p className="text-sm text-muted-foreground">
                  {file.name}
                </p>
              )}
            </div>
          </div>
          <Badge
            variant={file ? "success" : "destructive"}
            className="flex items-center gap-1"
          >
            {file ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                {t('documents.status.uploaded')}
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                {t('documents.status.missing')}
              </>
            )}
          </Badge>
        </div>
      ))}
    </div>
  )
}