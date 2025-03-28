'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageCircle, Lock } from 'lucide-react';
import CardContainer from '@/components/layouts/card-container';
import { useDateLocale } from '@/lib/utils';
import { FullServiceRequest } from '@/types/service-request';
import { addServiceRequestNote } from '@/actions/service-requests';

interface NoteItemProps {
  note: FullServiceRequest['notes'][number];
}

export const NoteItem = ({ note }: NoteItemProps) => {
  const { formatDate } = useDateLocale();

  return (
    <div className="border-b last:border-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {note.type === 'INTERNAL' ? (
            <Lock className="size-4 text-muted-foreground" />
          ) : (
            <MessageCircle className="size-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{note.author?.name ?? ''}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(new Date(note.createdAt), 'dd/MM/yyyy')}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-sm">{note.content}</p>
    </div>
  );
};

interface NoteEditorProps {
  type: 'INTERNAL' | 'FEEDBACK';
  onSubmit: (content: string, type: 'INTERNAL' | 'FEEDBACK') => Promise<void>;
  isLoading: boolean;
}

const NoteEditor = ({ type, onSubmit, isLoading }: NoteEditorProps) => {
  const [content, setContent] = useState('');
  const t = useTranslations('admin.registrations.review.notes');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSubmit(content, type);
    setContent('');
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder={t(
          type === 'INTERNAL' ? 'internal_placeholder' : 'feedback_placeholder',
        )}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
      />
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !content.trim()}
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
        {t('add')}
      </Button>
    </div>
  );
};

interface ReviewNotesProps {
  requestId: string;
  notes: FullServiceRequest['notes'];
}

export function ReviewNotes({ requestId, notes = [] }: ReviewNotesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('admin.registrations.review.notes');

  const handleAddNote = async (content: string, type: 'INTERNAL' | 'FEEDBACK') => {
    try {
      setIsLoading(true);
      const result = await addServiceRequestNote({
        requestId,
        content,
        type,
      });

      if (result.error) {
        toast({
          title: t('error.title'),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('success.title'),
        description: t('success.description'),
        variant: 'success',
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: t('error.title'),
        description: t('error.unknown'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardContainer title={t('title')}>
      <Tabs defaultValue="internal">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="internal">
            <Lock className="mr-2 size-4" />
            {t('tabs.internal')}
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageCircle className="mr-2 size-4" />
            {t('tabs.feedback')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="mt-4 space-y-4">
          <div className="space-y-4">
            {notes
              .filter((note) => note.type === 'INTERNAL')
              .map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
          </div>
          <NoteEditor type="INTERNAL" onSubmit={handleAddNote} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="feedback" className="mt-4 space-y-4">
          <div className="space-y-4">
            {notes
              .filter((note) => note.type === 'FEEDBACK')
              .map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
          </div>
          <NoteEditor type="FEEDBACK" onSubmit={handleAddNote} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </CardContainer>
  );
}

export const NotesList = ({ notes }: { notes: FullServiceRequest['notes'] }) => {
  const t = useTranslations('admin.registrations.review.notes');

  return (
    <CardContainer title={t('title')} contentClass="pt-0">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </CardContainer>
  );
};
