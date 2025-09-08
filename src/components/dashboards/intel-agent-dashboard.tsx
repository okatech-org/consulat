'use client';

import { useTranslations } from 'next-intl';
import { DashboardIntelligenceStats } from '@/components/intelligence/dashboard-intelligence-stats';
import { LeafletDashboardWrapper } from '@/components/dashboards/leaflet-dashboard-wrapper';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, FileText, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import CardContainer from '@/components/layouts/card-container';

export default function IntelAgentDashboard() {
  const t = useTranslations('intelligence.dashboard');
  const router = useRouter();

  // Récupérer les données géographiques des profils pour la carte
  const { data: geographicData, isLoading: isLoadingProfiles } =
    api.dashboard.getProfilesGeographicData.useQuery({});

  const quickActions = [
    {
      title: 'Voir tous les profils',
      description: 'Consulter la liste complète des profils gabonais',
      icon: Users,
      action: () => router.push('/dashboard/profiles'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Carte des profils',
      description: 'Visualiser la répartition géographique des profils',
      icon: MapPin,
      action: () => {
        // Scroll vers la carte dans la même page
        const mapElement = document.getElementById('intelligence-map');
        mapElement?.scrollIntoView({ behavior: 'smooth' });
      },
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Notes récentes',
      description: 'Consulter les dernières notes de renseignement',
      icon: FileText,
      action: () => {
        // Scroll vers les statistiques
        const statsElement = document.getElementById('intelligence-stats');
        statsElement?.scrollIntoView({ behavior: 'smooth' });
      },
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Tableau de bord des services de renseignement - Accès aux profils et notes
            confidentielles
          </p>
        </div>
        <Badge
          variant="outline"
          className="flex items-center gap-2 self-start sm:self-center"
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Agent Renseignements</span>
          <span className="sm:hidden">Agent</span>
        </Badge>
      </div>

      {/* Actions rapides */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={action.action}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${action.bgColor} self-center sm:self-start`}
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Statistiques */}
      <div id="intelligence-stats">
        <DashboardIntelligenceStats />
      </div>

      {/* Carte des profils */}
      <div id="intelligence-map">
        <CardContainer
          title={
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Carte des profils
            </div>
          }
        >
          {isLoadingProfiles ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-muted-foreground">Chargement de la carte...</div>
            </div>
          ) : geographicData && geographicData.length > 0 ? (
            <LeafletDashboardWrapper data={geographicData} height="400px" />
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-muted-foreground">
                Aucun profil avec adresse trouvé
              </div>
            </div>
          )}
        </CardContainer>
      </div>
    </div>
  );
}
