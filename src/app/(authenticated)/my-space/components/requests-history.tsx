'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserServiceRequests } from '@/hooks/use-services';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Eye, Download, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useState, useMemo } from 'react';

export function RequestsHistory() {
  const { requests, isLoading, error } = useUserServiceRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrer les demandes
  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    return requests.filter((request) => {
      const matchesSearch =
        request.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      COMPLETED: { label: 'Terminée', color: 'bg-green-100 text-green-800' },
      PROCESSING: { label: 'En traitement', color: 'bg-amber-100 text-amber-800' },
      VALIDATED: { label: 'Validée', color: 'bg-blue-100 text-blue-800' },
      SUBMITTED: { label: 'Soumise', color: 'bg-gray-100 text-gray-800' },
      DRAFT: { label: 'Brouillon', color: 'bg-gray-50 text-gray-600' },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        color: 'bg-gray-100 text-gray-800',
      }
    );
  };

  const getProgress = (status: string) => {
    const progressMap = {
      DRAFT: 0,
      SUBMITTED: 25,
      VALIDATED: 50,
      PROCESSING: 75,
      COMPLETED: 100,
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2 mb-4" />
            <div className="h-2 bg-muted rounded w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive mb-4">
          Erreur l&apos;ors du chargement de l&apos;historique
        </p>
        <Button variant="outline">Réessayer</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="PROCESSING">En cours</SelectItem>
              <SelectItem value="COMPLETED">Terminées</SelectItem>
              <SelectItem value="SUBMITTED">Soumises</SelectItem>
              <SelectItem value="DRAFT">Brouillons</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Liste des demandes */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const statusInfo = getStatusBadge(request.status);
            const progress = getProgress(request.status);

            return (
              <Card key={request.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{request.service.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                      <span>
                        Soumise{' '}
                        {formatDistanceToNow(new Date(request.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                      <span>ID: #{request.id.slice(-8)}</span>
                    </div>
                  </div>
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link href={ROUTES.user.service_request_details(request.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir les détails
                    </Link>
                  </Button>

                  {request.status === 'COMPLETED' && (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  )}

                  {['PROCESSING', 'VALIDATED', 'SUBMITTED'].includes(request.status) && (
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contacter l&apos;agent
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm || statusFilter !== 'all'
              ? 'Aucune demande trouvée'
              : "Aucune demande dans l'historique"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Essayez de modifier vos filtres de recherche.'
              : "Vous n'avez pas encore fait de demande de service."}
          </p>
          {searchTerm || statusFilter !== 'all' ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          ) : (
            <Button asChild>
              <Link href={ROUTES.user.service_available}>Faire ma première demande</Link>
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
