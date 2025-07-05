'use client';

import { useState } from 'react';
import { useRequests, type RequestFilters } from '@/hooks/use-requests';
import { RequestStatus, ServicePriority } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RequestsListClientProps {
  initialFilters?: RequestFilters;
}

export function RequestsListClient({ initialFilters }: RequestsListClientProps) {
  const [filters, setFilters] = useState<RequestFilters>(initialFilters || {});
  const [search, setSearch] = useState('');

  const { requests, isLoading, error, updateStatus, isUpdatingStatus, refetch } =
    useRequests(filters);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilter = (status: RequestStatus[]) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePriorityFilter = (priority: ServicePriority[]) => {
    setFilters((prev) => ({ ...prev, priority, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const getStatusBadge = (status: RequestStatus) => {
    const getVariant = (status: RequestStatus) => {
      switch (status) {
        case 'SUBMITTED':
          return 'secondary';
        case 'PENDING':
        case 'PENDING_COMPLETION':
          return 'outline';
        case 'VALIDATED':
        case 'COMPLETED':
        case 'READY_FOR_PICKUP':
          return 'default';
        case 'REJECTED':
          return 'destructive';
        case 'CARD_IN_PRODUCTION':
        case 'DOCUMENT_IN_PRODUCTION':
        case 'APPOINTMENT_SCHEDULED':
        case 'EDITED':
        default:
          return 'secondary';
      }
    };

    return <Badge variant={getVariant(status)}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: ServicePriority) => {
    const getVariant = (priority: ServicePriority) => {
      switch (priority) {
        case RequestStatus.PENDING as unknown as ServicePriority:
          return 'secondary';
        case RequestStatus.SUBMITTED as unknown as ServicePriority:
          return 'outline';
        case RequestStatus.VALIDATED as unknown as ServicePriority:
          return 'outline';
        case RequestStatus.REJECTED as unknown as ServicePriority:
          return 'destructive';
        default:
          return 'outline';
      }
    };

    return <Badge variant={getVariant(priority)}>{priority}</Badge>;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Erreur lors du chargement des demandes: {error.message}
            <Button onClick={() => refetch()} variant="outline" className="ml-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes de service</CardTitle>

        {/* Filtres */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, numéro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Select
              onValueChange={(value) =>
                handleStatusFilter(value ? [value as RequestStatus] : [])
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="SUBMITTED">Soumis</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="VALIDATED">Validé</SelectItem>
                <SelectItem value="REJECTED">Rejeté</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) =>
                handlePriorityFilter(value ? [value as ServicePriority] : [])
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes priorités</SelectItem>
                <SelectItem value="LOW">Basse</SelectItem>
                <SelectItem value="NORMAL">Normale</SelectItem>
                <SelectItem value="HIGH">Haute</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => refetch()} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Demandeur</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Agent assigné</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests?.items.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">
                        {request.requestedFor?.firstName} {request.requestedFor?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {request.submittedBy?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{request.serviceCategory}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell>
                      {request.assignedTo ? (
                        <div className="text-sm">
                          {request.assignedTo.name || request.assignedTo.email}
                        </div>
                      ) : (
                        <Badge variant="outline">Non assigné</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              // Navigation vers la page de détail
                              window.location.href = `/dashboard/requests/${request.id}`;
                            }}
                          >
                            Voir les détails
                          </DropdownMenuItem>
                          {request.status === 'SUBMITTED' && (
                            <DropdownMenuItem
                              onClick={() => {
                                updateStatus({
                                  requestId: request.id,
                                  status: 'PENDING',
                                });
                              }}
                              disabled={isUpdatingStatus}
                            >
                              Marquer en cours
                            </DropdownMenuItem>
                          )}
                          {request.status === 'PENDING' && (
                            <DropdownMenuItem
                              onClick={() => {
                                updateStatus({
                                  requestId: request.id,
                                  status: 'VALIDATED',
                                });
                              }}
                              disabled={isUpdatingStatus}
                            >
                              Valider
                            </DropdownMenuItem>
                          )}
                          {request.status !== 'COMPLETED' && (
                            <DropdownMenuItem
                              onClick={() => {
                                updateStatus({
                                  requestId: request.id,
                                  status: 'REJECTED',
                                });
                              }}
                              disabled={isUpdatingStatus}
                            >
                              Rejeter
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {requests && requests.total > (filters.limit || 10) && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de {((filters.page || 1) - 1) * (filters.limit || 10) + 1} à{' '}
                  {Math.min((filters.page || 1) * (filters.limit || 10), requests.total)}{' '}
                  sur {requests.total} demandes
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    disabled={(filters.page || 1) <= 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    disabled={
                      (filters.page || 1) * (filters.limit || 10) >= requests.total
                    }
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
