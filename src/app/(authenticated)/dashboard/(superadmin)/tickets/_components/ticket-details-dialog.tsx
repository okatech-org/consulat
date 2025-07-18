'use client';

import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Mail, Phone, Star, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketDetailsDialogProps {
  ticketId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailsDialog({
  ticketId,
  open,
  onOpenChange,
}: TicketDetailsDialogProps) {
  const t = useTranslations('feedback.admin.tickets.details');

  // Récupérer les détails du ticket
  const { data: tickets, isLoading } = api.feedback.getAdminList.useQuery(
    { page: 1, limit: 100 },
    { enabled: open },
  );

  const ticket = tickets?.feedbacks.find((f) => f.id === ticketId);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!ticket) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <p>Ticket introuvable</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'destructive';
      case 'IN_REVIEW':
        return 'secondary';
      case 'RESOLVED':
        return 'default';
      case 'CLOSED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            Ticket #{ticket.id.slice(-8)} - {ticket.subject}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('info')}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusVariant(ticket.status)}>
                  {t(`../list.status.${ticket.status.toLowerCase()}`)}
                </Badge>
                <Badge variant="outline">
                  {t(`../../form.categories.${ticket.category.toLowerCase()}`)}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('createdAt')}
              </label>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(ticket.createdAt), 'PPP', { locale: fr })}</span>
                <span className="text-muted-foreground">
                  (
                  {formatDistanceToNow(new Date(ticket.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                  )
                </span>
              </div>
            </div>
          </div>

          {/* Note si présente */}
          {ticket.rating && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Note</label>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{ticket.rating}/5</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Utilisateur */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t('createdBy')}
            </label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{ticket.user?.name || 'Utilisateur anonyme'}</span>
              </div>

              {(ticket.user?.email || ticket.email) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{ticket.user?.email || ticket.email}</span>
                </div>
              )}

              {(ticket.user?.phoneNumber || ticket.phoneNumber) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{ticket.user?.phoneNumber || ticket.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t('message')}
            </label>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap text-sm">{ticket.message}</p>
            </div>
          </div>

          {/* Service associé */}
          {ticket.service && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('relatedService')}
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{ticket.service.name}</Badge>
                </div>
              </div>
            </>
          )}

          {/* Demande associée */}
          {ticket.request && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('relatedRequest')}
                </label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {ticket.request.serviceCategory} - #{ticket.request.id.slice(-8)}
                  </Badge>
                </div>
              </div>
            </>
          )}

          {/* Réponse si présente */}
          {ticket.response && ticket.respondedBy && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('response')}
                </label>
                <div className="mt-2 space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {t('respondedBy')} {ticket.respondedBy.name}
                    {ticket.respondedAt && (
                      <span className="ml-2">
                        le {format(new Date(ticket.respondedAt), 'PPP', { locale: fr })}
                      </span>
                    )}
                  </div>
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-200 rounded">
                    <p className="whitespace-pre-wrap text-sm">{ticket.response}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
