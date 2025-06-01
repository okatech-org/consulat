'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAgentDetails, AgentDetails } from '@/actions/agents';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { tryCatch } from '@/lib/utils';
import {
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  MapPin,
  Briefcase,
  Settings,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ColumnDef } from '@tanstack/react-table';
import { ROUTES } from '@/schemas/routes';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<AgentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgentDetails() {
      if (!agentId) return;

      setIsLoading(true);
      const result = await tryCatch(getAgentDetails(agentId));

      if (result.error) {
        setError(result.error.message || 'Failed to fetch agent details');
      } else if (result.data) {
        setAgent(result.data);
      }

      setIsLoading(false);
    }

    fetchAgentDetails();
  }, [agentId]);

  if (isLoading) {
    return (
      <PageContainer title="Chargement...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  if (error || !agent) {
    return (
      <PageContainer title="Erreur">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Agent introuvable</h2>
          <p className="text-muted-foreground">
            L&apos;agent demandé n&apos;existe pas ou vous n&apos;avez pas les droits pour
            le consulter.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            Retour
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Calculer les statistiques
  const pendingRequests =
    agent.assignedRequests?.filter((r) =>
      ['SUBMITTED', 'PENDING', 'PENDING_COMPLETION'].includes(r.status),
    ).length || 0;

  const processingRequests =
    agent.assignedRequests?.filter((r) =>
      [
        'VALIDATED',
        'CARD_IN_PRODUCTION',
        'READY_FOR_PICKUP',
        'APPOINTMENT_SCHEDULED',
      ].includes(r.status),
    ).length || 0;

  const completedRequests = agent.completedRequests || 0;
  const averageProcessingTime = agent.averageProcessingTime || 0;

  // Définition des colonnes pour les demandes assignées
  const requestsColumns: ColumnDef<AgentDetails['assignedRequests'][0]>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <Link
          href={ROUTES.dashboard.service_requests(row.original.id)}
          className="font-mono text-sm hover:underline"
        >
          #{row.original.id.slice(-8)}
        </Link>
      ),
    },
    {
      accessorKey: 'serviceCategory',
      header: 'Service',
      cell: ({ row }) => row.original.serviceCategory || '-',
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === 'COMPLETED'
              ? 'default'
              : [
                    'VALIDATED',
                    'CARD_IN_PRODUCTION',
                    'READY_FOR_PICKUP',
                    'APPOINTMENT_SCHEDULED',
                  ].includes(row.original.status)
                ? 'default'
                : 'secondary'
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Créé le',
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr }),
    },
    {
      accessorKey: 'assignedAt',
      header: 'Assigné le',
      cell: ({ row }) =>
        row.original.assignedAt
          ? format(new Date(row.original.assignedAt), 'dd MMM yyyy', { locale: fr })
          : '-',
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');
  const canManageAgent = isSuperAdmin || currentUser?.roles?.includes('ADMIN');

  return (
    <PageContainer title="Détail de l'agent" description={agent.name || 'Agent sans nom'}>
      <div className="space-y-6">
        {/* Header avec informations de base */}
        <CardContainer
          title={
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={undefined} alt={agent.name || 'Agent'} />
                <AvatarFallback className="text-lg">
                  {agent.name ? getInitials(agent.name) : 'AG'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{agent.name || 'Agent sans nom'}</h1>
                <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                  {agent.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{agent.email}</span>
                    </div>
                  )}
                  {agent.phoneNumber && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{agent.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          }
          action={
            canManageAgent && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Réinitialiser mot de passe
                </Button>
              </div>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pays liés */}
            {agent.linkedCountries && agent.linkedCountries.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  <span>Pays liés</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.linkedCountries.map((country) => (
                    <Badge key={country.code} variant="outline">
                      {country.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Services assignés */}
            {agent.assignedServices && agent.assignedServices.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <Briefcase className="h-4 w-4" />
                  <span>Services assignés</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.assignedServices.map((service) => (
                    <Badge key={service.id} variant="outline">
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Spécialisations */}
            {agent.specializations && agent.specializations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  <span>Spécialisations</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.specializations.map((spec) => (
                    <Badge key={spec} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContainer>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Demandes en attente"
            value={pendingRequests}
            description="Demandes à traiter"
            icon={Clock}
            className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30"
            iconClassName="bg-white dark:bg-neutral-900 text-amber-500 dark:text-amber-400"
          />

          <StatsCard
            title="En traitement"
            value={processingRequests}
            description="Demandes en cours"
            icon={FileText}
            className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30"
            iconClassName="bg-white dark:bg-neutral-900 text-blue-500 dark:text-blue-400"
          />

          <StatsCard
            title="Complétées"
            value={completedRequests}
            description="Demandes finalisées"
            icon={CheckCircle}
            className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30"
            iconClassName="bg-white dark:bg-neutral-900 text-green-500 dark:text-green-400"
          />

          <StatsCard
            title="Temps moyen"
            value={`${averageProcessingTime}j`}
            description="Traitement moyen"
            icon={Calendar}
            className="bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/30"
            iconClassName="bg-white dark:bg-neutral-900 text-purple-500 dark:text-purple-400"
          />
        </div>

        {/* Demandes assignées */}
        <CardContainer
          title={
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Demandes assignées</span>
              <Badge variant="outline">{agent.assignedRequests?.length || 0}</Badge>
            </div>
          }
        >
          {agent.assignedRequests && agent.assignedRequests.length > 0 ? (
            <DataTable
              columns={requestsColumns}
              data={agent.assignedRequests}
              totalCount={agent.assignedRequests.length}
              pageIndex={0}
              pageSize={10}
              onPageChange={() => {}}
              onLimitChange={() => {}}
            />
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucune demande assignée</p>
              <p className="text-muted-foreground">
                Cet agent n&apos;a pas encore de demandes assignées.
              </p>
            </div>
          )}
        </CardContainer>

        {/* Disponibilité et statut */}
        {agent.availability && (
          <CardContainer
            title={
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Disponibilité</span>
              </div>
            }
          >
            <div className="text-sm text-muted-foreground">
              Informations de disponibilité à implémenter selon le modèle de données
            </div>
          </CardContainer>
        )}
      </div>
    </PageContainer>
  );
}
