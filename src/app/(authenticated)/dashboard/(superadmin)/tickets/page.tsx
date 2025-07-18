'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/trpc/react';
import { PageContainer } from '@/components/layouts/page-container';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketDetailsDialog } from './_components/ticket-details-dialog';
import { TicketResponseDialog } from './_components/ticket-response-dialog';
import { TicketStatusDialog } from './_components/ticket-status-dialog';
import { Eye, MessageSquare, Edit, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FeedbackStatus, FeedbackCategory } from '@prisma/client';

type TicketFilters = {
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  organizationId?: string;
};

type FeedbackWithRelations = {
  id: string;
  subject: string;
  message: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  rating: number | null;
  email: string | null;
  phoneNumber: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
  } | null;
  service: {
    id: string;
    name: string;
  } | null;
  request: {
    id: string;
    serviceCategory: string;
  } | null;
  organization: {
    id: string;
    name: string;
  } | null;
  respondedBy: {
    id: string;
    name: string | null;
  } | null;
};

export default function TicketsPage() {
  const t = useTranslations('feedback.admin.tickets');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Requête pour récupérer la liste des tickets
  const {
    data: ticketsData,
    isLoading,
    refetch,
  } = api.feedback.getAdminList.useQuery({
    page,
    limit: 10,
    ...filters,
  });

  // Mutation pour changer le statut
  const updateStatusMutation = api.feedback.updateStatus.useMutation({
    onSuccess: () => {
      toast({
        variant: 'success',
        title: t('statusUpdate.success'),
      });
      refetch();
      setShowStatusDialog(false);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: t('statusUpdate.error'),
      });
    },
  });

  const columns = [
    {
      accessorKey: 'id',
      header: t('list.columns.id'),
      cell: ({ row }: { row: { original: FeedbackWithRelations } }) => (
        <span className="font-mono text-xs">{row.original.id.slice(-8)}</span>
      ),
    },
    {
      accessorKey: 'subject',
      header: t('list.columns.subject'),
      cell: ({ row }: { row: { original: FeedbackWithRelations } }) => (
        <div className="max-w-xs truncate">{row.original.subject}</div>
      ),
    },
    {
      accessorKey: 'category',
      header: t('list.columns.category'),
      cell: ({ row }: { row: { original: FeedbackWithRelations } }) => (
        <Badge variant="outline">
          {t(`../form.categories.${row.original.category.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: t('list.columns.status'),
      cell: ({ row }: { row: { original: FeedbackWithRelations } }) => {
        const status = row.original.status;
        const variant =
          status === 'PENDING'
            ? 'destructive'
            : status === 'IN_REVIEW'
              ? 'secondary'
              : status === 'RESOLVED'
                ? 'success'
                : 'outline';
        return (
          <Badge variant={variant}>{t(`list.status.${status.toLowerCase()}`)}</Badge>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: t('list.columns.rating'),
      cell: ({ row }: { row: { original: FeedbackWithRelations } }) => {
        const rating = row.original.rating;
        return rating ? (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{rating}/5</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'user',
      header: t('list.columns.user'),
      cell: ({ row }: { row: { original: FeedbackWithRelations } }) => {
        const user = row.original.user;
        const email = row.original.email;
        return (
          <div className="text-sm">
            {user?.name || 'Utilisateur anonyme'}
            <div className="text-xs text-muted-foreground">{user?.email || email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: t('list.columns.createdAt'),
      cell: ({ row }: { row: { original: FeedbackWithRelations } }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('list.columns.actions'),
      cell: ({ row }: { row: { original: FeedbackWithRelations } }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTicket(row.original.id);
              setShowDetailsDialog(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTicket(row.original.id);
              setShowResponseDialog(true);
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTicket(row.original.id);
              setShowStatusDialog(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleStatusUpdate = (status: FeedbackStatus) => {
    if (selectedTicket) {
      updateStatusMutation.mutate({
        feedbackId: selectedTicket,
        status,
      });
    }
  };

  return (
    <PageContainer title={t('title')} description={t('description')}>
      <div className="space-y-6">
        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={filters.status || ''}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value as FeedbackStatus })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('list.filters.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('list.filters.all')}</SelectItem>
              <SelectItem value="PENDING">{t('list.status.pending')}</SelectItem>
              <SelectItem value="IN_REVIEW">{t('list.status.in_review')}</SelectItem>
              <SelectItem value="RESOLVED">{t('list.status.resolved')}</SelectItem>
              <SelectItem value="CLOSED">{t('list.status.closed')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category || ''}
            onValueChange={(value) =>
              setFilters({ ...filters, category: value as FeedbackCategory })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('list.filters.category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('list.filters.all')}</SelectItem>
              <SelectItem value="BUG">{t('../form.categories.bug')}</SelectItem>
              <SelectItem value="FEATURE">{t('../form.categories.feature')}</SelectItem>
              <SelectItem value="IMPROVEMENT">
                {t('../form.categories.improvement')}
              </SelectItem>
              <SelectItem value="OTHER">{t('../form.categories.other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table des tickets */}
        <DataTable
          columns={columns}
          data={ticketsData?.feedbacks || []}
          isLoading={isLoading}
          pagination={{
            pageIndex: page - 1,
            pageSize: 10,
            pageCount: ticketsData?.pagination.totalPages || 0,
            onPageChange: (pageIndex) => setPage(pageIndex + 1),
          }}
          emptyMessage={t('list.empty')}
        />

        {/* Dialogs */}
        {selectedTicket && (
          <>
            <TicketDetailsDialog
              ticketId={selectedTicket}
              open={showDetailsDialog}
              onOpenChange={setShowDetailsDialog}
            />
            <TicketResponseDialog
              ticketId={selectedTicket}
              open={showResponseDialog}
              onOpenChange={setShowResponseDialog}
              onSuccess={() => {
                refetch();
                setShowResponseDialog(false);
              }}
            />
            <TicketStatusDialog
              ticketId={selectedTicket}
              open={showStatusDialog}
              onOpenChange={setShowStatusDialog}
              onStatusUpdate={handleStatusUpdate}
              isLoading={updateStatusMutation.isPending}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
