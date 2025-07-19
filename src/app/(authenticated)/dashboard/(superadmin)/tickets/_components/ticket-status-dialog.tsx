'use client';

import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import type { FeedbackStatus } from '@prisma/client';

interface TicketStatusDialogProps {
  ticketId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (status: FeedbackStatus) => void;
  isLoading: boolean;
}

export function TicketStatusDialog({
  ticketId,
  open,
  onOpenChange,
  onStatusUpdate,
  isLoading,
}: TicketStatusDialogProps) {
  const t = useTranslations();
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | ''>('');

  // Récupérer les détails du ticket
  const { data: tickets } = api.feedback.getAdminList.useQuery(
    { page: 1, limit: 100 },
    { enabled: open },
  );

  const ticket = tickets?.feedbacks.find((f) => f.id === ticketId);

  const handleConfirm = () => {
    if (selectedStatus && selectedStatus !== ticket?.status) {
      onStatusUpdate(selectedStatus as FeedbackStatus);
    }
  };

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('feedback.admin.tickets.statusUpdate.title')}</DialogTitle>
          <DialogDescription>
            Modifier le statut du ticket #{ticket?.id.slice(-8)}
          </DialogDescription>
        </DialogHeader>

        {ticket && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-2">{ticket.subject}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {t(`inputs.feedback.categories.options.${ticket.category}`)}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('feedback.admin.tickets.statusUpdate.currentStatus')}
              </label>
              <div className="mt-1">
                <Badge variant={getStatusVariant(ticket.status)}>
                  {t(`feedback.admin.tickets.list.status.${ticket.status.toLowerCase()}`)}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('feedback.admin.tickets.statusUpdate.newStatus')}
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as FeedbackStatus)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner un nouveau statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    {t('feedback.admin.tickets.list.status.pending')}
                  </SelectItem>
                  <SelectItem value="IN_REVIEW">
                    {t('feedback.admin.tickets.list.status.in_review')}
                  </SelectItem>
                  <SelectItem value="RESOLVED">
                    {t('feedback.admin.tickets.list.status.resolved')}
                  </SelectItem>
                  <SelectItem value="CLOSED">
                    {t('feedback.admin.tickets.list.status.closed')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('feedback.admin.tickets.statusUpdate.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isLoading}
            disabled={!selectedStatus || selectedStatus === ticket?.status}
          >
            {t('feedback.admin.tickets.statusUpdate.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
