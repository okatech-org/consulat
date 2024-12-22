import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { addProfileNote } from '@/actions/admin/profile-notes'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Loader2, MessageCircle, Lock } from 'lucide-react'

interface Note {
  id: string
  content: string
  type: 'INTERNAL' | 'FEEDBACK'
  createdAt: Date
  author: {
    name: string | null
  }
}

interface NoteItemProps {
  note: Note
}

const NoteItem = ({ note }: NoteItemProps) => {
  return (
    <div className="border-b py-4 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {note.type === 'INTERNAL' ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{note.author.name}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {format(new Date(note.createdAt), 'PPp', { locale: fr })}
        </span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
    </div>
  )
}

interface NoteEditorProps {
  type: 'INTERNAL' | 'FEEDBACK'
  onSubmit: (content: string, type: 'INTERNAL' | 'FEEDBACK') => Promise<void>
  isLoading: boolean
}

const NoteEditor = ({ type, onSubmit, isLoading }: NoteEditorProps) => {
  const [content, setContent] = useState('')
  const t = useTranslations('admin.profiles.review.notes')

  const handleSubmit = async () => {
    if (!content.trim()) return
    await onSubmit(content, type)
    setContent('')
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder={t(type === 'INTERNAL' ? 'internal_placeholder' : 'feedback_placeholder')}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !content.trim()}
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('add')}
      </Button>
    </div>
  )
}

interface ProfileNotesProps {
  profileId: string
  notes: Note[]
}

export function ProfileNotes({ profileId, notes }: ProfileNotesProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const t = useTranslations('admin.profiles.review.notes')

  const handleAddNote = async (content: string, type: 'INTERNAL' | 'FEEDBACK') => {
    try {
      setIsLoading(true)
      const result = await addProfileNote({
        profileId,
        content,
        type
      })

      if (result.error) {
        toast({
          title: t('error.title'),
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: t('success.title'),
        description: t('success.description'),
        variant: "success"
      })
    } catch (error) {
      toast({
        title: t('error.title'),
        description: t('error.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="internal">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="internal">
              <Lock className="mr-2 h-4 w-4" />
              {t('tabs.internal')}
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageCircle className="mr-2 h-4 w-4" />
              {t('tabs.feedback')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internal" className="space-y-4 mt-4">
            <NoteEditor
              type="INTERNAL"
              onSubmit={handleAddNote}
              isLoading={isLoading}
            />
            <div className="space-y-4">
              {notes
                .filter(note => note.type === 'INTERNAL')
                .map(note => (
                  <NoteItem key={note.id} note={note} />
                ))
              }
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4 mt-4">
            <NoteEditor
              type="FEEDBACK"
              onSubmit={handleAddNote}
              isLoading={isLoading}
            />
            <div className="space-y-4">
              {notes
                .filter(note => note.type === 'FEEDBACK')
                .map(note => (
                  <NoteItem key={note.id} note={note} />
                ))
              }
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}