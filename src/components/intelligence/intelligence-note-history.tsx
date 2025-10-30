'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { History, User, Calendar, FileText } from 'lucide-react';

interface IntelligenceNoteHistoryProps {
  noteId: string;
  onClose: () => void;
}

export function IntelligenceNoteHistory({
  noteId,
  onClose,
}: IntelligenceNoteHistoryProps) {
  const t = useTranslations('intelligence.notes');

  const history = useQuery(
    api.functions.intelligence.getNoteHistory,
    noteId ? { noteId: noteId as any } : 'skip',
  );
  const isLoading = history === undefined;

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'updated':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'deleted':
        return <FileText className="h-4 w-4 text-red-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'updated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deleted':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Créée';
      case 'updated':
        return 'Modifiée';
      case 'deleted':
        return 'Supprimée';
      default:
        return action;
    }
  };

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t('history')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Chargement de l'historique...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('history')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {history && history.length > 0 ? (
              history.map((entry, index) => (
                <Card key={entry.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getActionIcon(entry.action)}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={getActionColor(entry.action)}>
                              {getActionLabel(entry.action)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(entry.changedAt), 'dd MMM yyyy à HH:mm', {
                                locale: fr,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {entry.changedBy.name || entry.changedBy.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {(entry.previousContent || entry.newContent) && (
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {entry.previousContent && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Contenu précédent :
                            </div>
                            <div className="text-sm bg-muted/50 p-3 rounded-md border-l-2 border-red-200">
                              <div className="whitespace-pre-wrap">
                                {entry.previousContent}
                              </div>
                            </div>
                          </div>
                        )}

                        {entry.newContent && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Nouveau contenu :
                            </div>
                            <div className="text-sm bg-muted/50 p-3 rounded-md border-l-2 border-green-200">
                              <div className="whitespace-pre-wrap">
                                {entry.newContent}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}

                  {index < history.length - 1 && (
                    <div className="absolute -bottom-2 left-6 right-6">
                      <Separator />
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun historique disponible pour cette note.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
