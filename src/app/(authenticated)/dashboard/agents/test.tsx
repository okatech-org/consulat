'use client';

import { useAgents, useAgent, useAgentPerformance } from '@/hooks/use-agents';
import { PageContainer } from '@/components/layouts/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AgentsTest() {
  // Test du hook principal
  const {
    agents,
    total,
    isLoading,
    error,
    createAgent,
    updateAgent,
    isCreating,
    isUpdating,
  } = useAgents({
    page: 1,
    limit: 10,
  });

  // Test d'un agent spécifique (si on en a un)
  const firstAgentId = agents[0]?.id;
  const { agent, isLoading: isLoadingAgent } = useAgent(firstAgentId || '');

  // Test des métriques de performance
  const { performanceMetrics, isLoading: isLoadingMetrics } = useAgentPerformance(
    firstAgentId || '',
    !!firstAgentId,
  );

  if (error) {
    return (
      <PageContainer title="Test Agents - Erreur">
        <div className="text-red-600">
          <p>Erreur: {error.message}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Test Agents tRPC">
      <div className="space-y-6">
        {/* Test de la liste des agents */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des agents</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement...</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">Total: {total}</Badge>
                  <Badge variant="outline">Chargés: {agents.length}</Badge>
                </div>

                <div className="grid gap-2">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{agent.name || 'Sans nom'}</p>
                        <p className="text-sm text-muted-foreground">{agent.email}</p>
                        <div className="flex gap-1 mt-1">
                          {agent.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p>Actives: {agent._count.assignedRequests}</p>
                        <p>Complétées: {agent.completedRequests || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {agents.length === 0 && !isLoading && (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun agent trouvé
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test d'un agent spécifique */}
        {firstAgentId && (
          <Card>
            <CardHeader>
              <CardTitle>Détail agent ({firstAgentId})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAgent ? (
                <p>Chargement des détails...</p>
              ) : agent ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Informations de base</h4>
                    <p>Nom: {agent.name || 'Sans nom'}</p>
                    <p>Email: {agent.email || "Pas d'email"}</p>
                    <p>Téléphone: {agent.phoneNumber || 'Pas de téléphone'}</p>
                  </div>

                  <div>
                    <h4 className="font-medium">Pays liés</h4>
                    <div className="flex gap-1">
                      {agent.linkedCountries?.map((country) => (
                        <Badge key={country.code} variant="outline">
                          {country.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Services assignés</h4>
                    <div className="flex gap-1">
                      {agent.assignedServices?.map((service) => (
                        <Badge key={service.id} variant="outline">
                          {service.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Demandes assignées</h4>
                    <p>{agent.assignedRequests?.length || 0} demandes</p>
                  </div>

                  {agent.managedAgents && agent.managedAgents.length > 0 && (
                    <div>
                      <h4 className="font-medium">Agents managés</h4>
                      <p>{agent.managedAgents.length} agents</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>Agent non trouvé</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test des métriques de performance */}
        {firstAgentId && (
          <Card>
            <CardHeader>
              <CardTitle>Métriques de performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMetrics ? (
                <p>Chargement des métriques...</p>
              ) : performanceMetrics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {performanceMetrics.totalRequests}
                    </p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {performanceMetrics.completedRequests}
                    </p>
                    <p className="text-sm text-muted-foreground">Complétées</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {performanceMetrics.pendingRequests}
                    </p>
                    <p className="text-sm text-muted-foreground">En attente</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {performanceMetrics.avgProcessingTime}h
                    </p>
                    <p className="text-sm text-muted-foreground">Temps moyen</p>
                  </div>
                  <div className="text-center col-span-2">
                    <p className="text-2xl font-bold">
                      {performanceMetrics.completionRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Taux de completion</p>
                  </div>
                </div>
              ) : (
                <p>Métriques non disponibles</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test des mutations */}
        <Card>
          <CardHeader>
            <CardTitle>Actions de test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  console.log('Test création agent');
                  // createAgent({...}); // À implémenter avec de vraies données
                }}
                disabled={isCreating}
              >
                {isCreating ? 'Création...' : 'Tester création'}
              </Button>

              <Button
                onClick={() => {
                  if (firstAgentId) {
                    console.log('Test mise à jour agent');
                    // updateAgent({ id: firstAgentId, data: {...} }); // À implémenter
                  }
                }}
                disabled={isUpdating || !firstAgentId}
              >
                {isUpdating ? 'Mise à jour...' : 'Tester mise à jour'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
