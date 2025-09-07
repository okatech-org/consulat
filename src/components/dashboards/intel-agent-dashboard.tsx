'use client';

import { useTranslations } from 'next-intl';
import { DashboardIntelligenceStats } from '@/components/intelligence/dashboard-intelligence-stats';
import { IntelligenceMap } from '@/components/intelligence/intelligence-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, FileText, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function IntelAgentDashboard() {
  const t = useTranslations('intelligence.dashboard');
  const router = useRouter();

  const quickActions = [
    {
      title: 'Voir tous les profils',
      description: 'Consulter la liste complète des profils gabonais',
      icon: Users,
      action: () => router.push('/profiles'),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            Tableau de bord des services de renseignement - Accès aux profils et notes
            confidentielles
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Agent Renseignements
        </Badge>
      </div>

      {/* Actions rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={action.action}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div>
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
        <IntelligenceMap
          onProfileClick={(profileId) => router.push(`/profiles/${profileId}`)}
        />
      </div>

      {/* Informations de sécurité */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Shield className="h-5 w-5" />
            Informations de sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700">
          <div className="space-y-2 text-sm">
            <p>• Toutes vos actions sont enregistrées et auditées</p>
            <p>• Les notes de renseignement sont confidentielles et chiffrées</p>
            <p>• Vous ne pouvez modifier que vos propres notes</p>
            <p>• L'accès aux profils est en lecture seule</p>
            <p>• Toute activité suspecte sera signalée automatiquement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
