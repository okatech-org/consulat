import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

interface ReviewNotesProps {
  notes: string
  onChange: (notes: string) => void
  onSubmit: () => void
}

export function ReviewNotes({ notes, onChange, onSubmit }: ReviewNotesProps) {
  const t = useTranslations('actions.profiles.review')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notes.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder={t('notes.placeholder')}
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
        />
        <Button onClick={onSubmit} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {t('notes.save')}
        </Button>
      </CardContent>
    </Card>
  )
}