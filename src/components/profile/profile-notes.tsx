import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ProfileNote {
  id: string
  content: string
  createdAt: Date
  author: {
    name: string | null
  }
}

interface ProfileNotesProps {
  notes: ProfileNote[]
}

export function ProfileNotes({ notes }: ProfileNotesProps) {
  const t = useTranslations('profile.notes')

  if (notes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map(note => (
            <div
              key={note.id}
              className="border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{note.author.name}</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(note.createdAt), 'PPp', { locale: fr })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}