'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, MessageCircle, Lock } from 'lucide-react';
import CardContainer from '@/components/layouts/card-container';
import { useDateLocale } from '@/lib/utils';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCurrentUser } from '@/hooks/use-current-user';
import { RequestStatus } from '@/convex/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import type { Id } from '@/convex/_generated/dataModel';

interface RequestNote {
  id: string;
  type: 'INTERNAL' | 'FEEDBACK';
  content: string;
  author?: { name: string };
  createdAt: number | string;
}

interface NoteItemProps {
  note: RequestNote;
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
  onSubmit: (
    content: string,
    type: 'INTERNAL' | 'FEEDBACK',
    pendingCompletionStatus: boolean,
  ) => Promise<void>;
  isLoading: boolean;
  canUpdate?: boolean;
}

const NoteEditor = ({ type, onSubmit, isLoading, canUpdate = true }: NoteEditorProps) => {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [pendingCompletionStatus, setPendingCompletionStatus] = useState(false);
  const t = useTranslations('admin.registrations.review.notes');
  const tInputs = useTranslations('inputs');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSubmit(content, type, pendingCompletionStatus);
    setContent('');
    router.refresh();
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
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            disabled={!canUpdate}
            id="pending-completion-status"
            checked={pendingCompletionStatus}
            onCheckedChange={(checked: boolean | 'indeterminate') =>
              setPendingCompletionStatus(checked === 'indeterminate' ? false : checked)
            }
          />
          <label
            htmlFor="pending-completion-status"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {`Changer le statut à '${tInputs('requestStatus.options.PENDING_COMPLETION')}'`}
          </label>
        </div>
      </div>
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
  notes: RequestNote[];
  canUpdate?: boolean;
}

export function ReviewNotes({
  requestId,
  notes = [],
  canUpdate = true,
}: ReviewNotesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('admin.registrations.review.notes');
  const router = useRouter();
  const { user } = useCurrentUser();
  const addNoteMutation = useMutation(api.functions.request.addRequestNote);
  const updateStatusMutation = useMutation(api.functions.request.updateRequestStatus);

  const handleAddNote = async (
    content: string,
    type: 'INTERNAL' | 'FEEDBACK',
    pendingCompletionStatus: boolean,
  ) => {
    try {
      setIsLoading(true);

      if (!user?.membership?._id) {
        toast.error('Vous devez être connecté avec un compte membre');
        return;
      }

      await addNoteMutation({
        requestId: requestId as Id<'requests'>,
        note: {
          type: type.toLowerCase() as 'internal' | 'feedback',
          content,
        },
        addedById: user.membership._id,
      });

      if (pendingCompletionStatus) {
        await updateStatusMutation({
          requestId: requestId as Id<'requests'>,
          status: RequestStatus.PendingCompletion,
        });
      }

      toast.success(t('success.description'));
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error(t('error.unknown'));
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <CardContainer title={t('title')}>
      <Tabs defaultValue="internal">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="internal">
            <Lock className="mr-2 size-icon" />
            <span className="text-xs">{t('tabs.internal')}</span>
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageCircle className="mr-2 size-icon" />
            <span className="text-xs">{t('tabs.feedback')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="mt-4 space-y-4">
          <div className="space-y-4">
            {notes
              .filter((note: RequestNote) => note.type === 'INTERNAL')
              .map((note: RequestNote) => (
                <NoteItem key={note.id} note={note} />
              ))}
          </div>
          <NoteEditor
            type="INTERNAL"
            onSubmit={handleAddNote}
            isLoading={isLoading}
            canUpdate={canUpdate}
          />
        </TabsContent>

        <TabsContent value="feedback" className="mt-4 space-y-4">
          <div className="space-y-4">
            {notes
              .filter((note: RequestNote) => note.type === 'FEEDBACK')
              .map((note: RequestNote) => (
                <NoteItem key={note.id} note={note} />
              ))}
          </div>
          <NoteEditor type="FEEDBACK" onSubmit={handleAddNote} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </CardContainer>
  );
}

export const NotesList = ({ notes }: { notes: RequestNote[] }) => {
  return (
    <CardContainer title={"Messages de l'administration"} contentClass="pt-0">
      {notes.map((note: RequestNote) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </CardContainer>
  );
};
