import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentStatus } from '@prisma/client'
import { useTranslations } from 'next-intl'

export function DocumentValidation({ document }) {
  const t = useTranslations('manager.documents')
  const [isValidating, setIsValidating] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('validation.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Prévisualisation du document */}
          <div className="aspect-video rounded-lg border bg-muted">
            {/* Intégrer la prévisualisation du document */}
          </div>

          {/* Actions de validation */}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => handleValidation(DocumentStatus.REJECTED)}
              disabled={isValidating}
            >
              {t('actions.reject')}
            </Button>
            <Button
              variant="success"
              onClick={() => handleValidation(DocumentStatus.VALIDATED)}
              disabled={isValidating}
            >
              {t('actions.approve')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}