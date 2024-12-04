import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'

export { DocumentsReview } from './documents-review'
export { InformationReview } from './information-review'
export { AppointmentReview } from './appointment-review'

interface ReviewSectionProps {
  title: string
  children: React.ReactNode
  onEdit: () => void
}

export function ReviewSection({ title, children, onEdit }: ReviewSectionProps) {
  const t = useTranslations('common')
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          {t('actions.edit')}
        </Button>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}