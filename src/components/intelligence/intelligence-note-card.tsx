'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import {
  type IntelligenceNote,
  IntelligenceNoteType,
  IntelligenceNotePriority,
} from '@prisma/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, History } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IntelligenceNoteForm } from './intelligence-note-form';
import { IntelligenceNoteHistory } from './intelligence-note-history';

interface IntelligenceNoteCardProps {
  note: IntelligenceNote & {
    author: {
      id: string;
      name: string | null;
      email: string | null;
    };
    profile: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    };
    _count: {
      history: number;
    };
  };
  onEdit?: (note: IntelligenceNote) => void;
  onDelete?: (note: IntelligenceNote) => void;
  showHistory?: boolean;
  currentUserId: string;
}

const priorityColors = {
  [IntelligenceNotePriority.LOW]: 'bg-green-100 text-green-800 border-green-200',
  [IntelligenceNotePriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [IntelligenceNotePriority.HIGH]: 'bg-orange-100 text-orange-800 border-orange-200',
  [IntelligenceNotePriority.CRITICAL]: 'bg-red-100 text-red-800 border-red-200',
};

const typeIcons = {
  [IntelligenceNoteType.POLITICAL_OPINION]: '🏛️',
  [IntelligenceNoteType.ORIENTATION]: '🧭',
  [IntelligenceNoteType.ASSOCIATIONS]: '👥',
  [IntelligenceNoteType.TRAVEL_PATTERNS]: '✈️',
  [IntelligenceNoteType.CONTACTS]: '📞',
  [IntelligenceNoteType.ACTIVITIES]: '🎯',
  [IntelligenceNoteType.OTHER]: '📝',
};

export function IntelligenceNoteCard({
  note,
  onEdit,
  onDelete,
  showHistory = false,
  currentUserId,
}: IntelligenceNoteCardProps) {
  const t = useTranslations('intelligence.notes');
  const [isEditing, setIsEditing] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteNoteMutation = api.intelligence.deleteNote.useMutation({
    onSuccess: () => {
      setShowDeleteDialog(false);
      onDelete?.(note);
    },
  });

  const canEdit = note.authorId === currentUserId;
  const canDelete = note.authorId === currentUserId;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    deleteNoteMutation.mutate({ noteId: note.id });
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onEdit?.(note);
  };

  if (isEditing) {
    return (
      <IntelligenceNoteForm
        profileId={note.profileId}
        initialData={note}
        onSuccess={handleEditSuccess}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{typeIcons[note.type]}</span>
              <div>
                <h4 className="font-semibold text-sm">{note.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('created')}{' '}
                  {format(new Date(note.createdAt), 'dd MMM yyyy à HH:mm', {
                    locale: fr,
                  })}{' '}
                  {t('by')} {note.author.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={priorityColors[note.priority]}>
                {t(`priorities.${note.priority.toLowerCase()}`)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('edit')}
                    </DropdownMenuItem>
                  )}
                  {showHistory && (
                    <DropdownMenuItem onClick={() => setShowHistoryDialog(true)}>
                      <History className="h-4 w-4 mr-2" />
                      {t('historyLabel')} ({note._count.history})
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('deleteLabel')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t(`types.${note.type.toLowerCase()}`)}
              </p>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {note.expiresAt && (
              <div className="text-xs text-muted-foreground">
                Expire le{' '}
                {format(new Date(note.expiresAt), 'dd MMM yyyy', { locale: fr })}
              </div>
            )}

            {note.updatedAt !== note.createdAt && (
              <div className="text-xs text-muted-foreground">
                {t('updated')}{' '}
                {format(new Date(note.updatedAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showHistoryDialog && (
        <IntelligenceNoteHistory
          noteId={note.id}
          onClose={() => setShowHistoryDialog(false)}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteLabel')}</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette note de renseignement ? Cette
              action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteNoteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteNoteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
