'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@/convex/lib/constants';
import type { Doc } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  History,
  Building,
  Navigation,
  Users,
  Plane,
  Phone,
  Target,
  FileText,
} from 'lucide-react';
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
import { useCurrentUser } from '@/hooks/use-current-user';
import { IntelligenceNoteHistory } from './intelligence-note-history';

interface IntelligenceNoteCardProps {
  note: Doc<'intelligenceNotes'> & {
    author?: {
      id: string;
      name: string | null;
      email: string | null;
    };
    profile?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    };
    _count?: {
      history: number;
    };
  };
  onEdit?: (note: Doc<'intelligenceNotes'>) => void;
  onDelete?: (note: Doc<'intelligenceNotes'>) => void;
  showHistory?: boolean;
  currentUserId: string;
  allowDelete?: boolean;
}

const priorityColors = {
  [IntelligenceNotePriority.LOW]: 'bg-green-100 text-green-800 border-green-200',
  [IntelligenceNotePriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [IntelligenceNotePriority.HIGH]: 'bg-orange-100 text-orange-800 border-orange-200',
  [IntelligenceNotePriority.CRITICAL]: 'bg-red-100 text-red-800 border-red-200',
};

const typeIcons = {
  [IntelligenceNoteType.POLITICAL_OPINION]: <Building className="h-4 w-4" />,
  [IntelligenceNoteType.ORIENTATION]: <Navigation className="h-4 w-4" />,
  [IntelligenceNoteType.ASSOCIATIONS]: <Users className="h-4 w-4" />,
  [IntelligenceNoteType.TRAVEL_PATTERNS]: <Plane className="h-4 w-4" />,
  [IntelligenceNoteType.CONTACTS]: <Phone className="h-4 w-4" />,
  [IntelligenceNoteType.ACTIVITIES]: <Target className="h-4 w-4" />,
  [IntelligenceNoteType.OTHER]: <FileText className="h-4 w-4" />,
};

export function IntelligenceNoteCard({
  note,
  onEdit,
  onDelete,
  showHistory = false,
  currentUserId,
  allowDelete = false,
}: IntelligenceNoteCardProps) {
  const t = useTranslations('intelligence.notes');
  const { user } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteNoteMutation = useMutation(api.functions.intelligence.deleteNote);

  const canEdit = note.authorId === currentUserId;
  const canDelete = allowDelete && note.authorId === currentUserId;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!user?._id) {
      console.error('User not authenticated');
      return;
    }
    try {
      await deleteNoteMutation({ noteId: note._id as any, deletedById: user._id as any });
      setShowDeleteDialog(false);
      onDelete?.(note);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
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
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <span className="text-sm flex-shrink-0 mt-0.5">{typeIcons[note.type]}</span>
              <div className="flex-1 min-w-0">
                {/* Ligne 1: Titre + Priorité */}
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{note.title}</h4>
                  <Badge
                    className={`${priorityColors[note.priority]} text-xs px-1.5 py-0.5`}
                  >
                    {t(`priorities.${note.priority.toLowerCase()}`)}
                  </Badge>
                </div>

                {/* Ligne 2: Type + Contenu */}
                <div className="mb-1">
                  <span className="text-xs text-muted-foreground">
                    {t(`types.${note.type.toLowerCase()}`)}
                  </span>
                  <p className="text-sm whitespace-pre-wrap line-clamp-2 mt-0.5">
                    {note.content}
                  </p>
                </div>

                {/* Ligne 3: Tags + Dates */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex gap-1">
                        {note.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs px-1.5 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {format(new Date(note.createdAt), 'dd/MM HH:mm', { locale: fr })}
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-1">• Modifiée</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex-shrink-0 h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
