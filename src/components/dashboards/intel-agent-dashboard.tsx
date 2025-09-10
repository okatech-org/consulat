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
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {[
              {
                title: 'Profils surveillés',
                value: stats.profiles,
                change: '+12.5%',
                icon: <Users className="h-5 w-5" />,
                progress: 78,
                color: 'blue',
              },
              {
                title: 'Localisations actives',
                value: stats.locations,
                change: '+8.3%',
                icon: <MapPin className="h-5 w-5" />,
                progress: 65,
                color: 'green',
              },
              {
                title: 'Notes ce mois',
                value: stats.notes,
                change: '-2.1%',
                icon: <FileText className="h-5 w-5" />,
                progress: 45,
                color: 'orange',
              },
              {
                title: 'Alertes actives',
                value: stats.alerts,
                change: '0%',
                icon: <AlertTriangle className="h-5 w-5" />,
                progress: 23,
                color: 'red',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'var(--bg-glass-primary)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-glass-primary)',
                  boxShadow: 'var(--shadow-glass)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                }}
              >
                {/* Barre de scan */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-0 hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--accent-intel), transparent)',
                    animation: 'scan 3s infinite',
                  }}
                />

                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center`}
                    style={{
                      background:
                        stat.color === 'blue'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : stat.color === 'green'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : stat.color === 'orange'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                      color:
                        stat.color === 'blue'
                          ? '#3b82f6'
                          : stat.color === 'green'
                            ? '#10b981'
                            : stat.color === 'orange'
                              ? '#f59e0b'
                              : '#ef4444',
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${stat.change.includes('-') ? 'negative' : ''}`}
                    style={{
                      background: stat.change.includes('-')
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(16, 185, 129, 0.2)',
                      color: stat.change.includes('-') ? '#ef4444' : '#10b981',
                    }}
                  >
                    {stat.change}
                  </div>
                </div>

                <div
                  className="text-2xl font-bold mb-2"
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--text-primary)',
                  }}
                >
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {stat.title}
                </div>

                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--progress-bg)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${stat.progress}%`,
                      background:
                        'linear-gradient(90deg, var(--accent-intel), var(--accent-warning))',
                      animation: 'progress-pulse 2s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[
              {
                title: 'Voir tous les profils',
                desc: 'Liste complète des profils gabonais',
                icon: <Users className="h-4 w-4" />,
                color: 'blue',
              },
              {
                title: 'Carte des profils',
                desc: 'Répartition géographique',
                icon: <Map className="h-4 w-4" />,
                color: 'green',
              },
              {
                title: 'Notes récentes',
                desc: 'Derniers renseignements',
                icon: <Clipboard className="h-4 w-4" />,
                color: 'orange',
              },
            ].map((action, index) => (
              <div
                key={index}
                className="transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
                onClick={() => handleQuickAction(index, action.title)}
                style={{
                  background: 'var(--bg-glass-secondary)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid var(--border-glass-secondary)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  opacity: activeAction === index ? 0.7 : 1,
                  transform: activeAction === index ? 'scale(0.98)' : 'scale(1)',
                  cursor: isNavigating ? 'wait' : 'pointer',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 relative z-10"
                  style={{
                    background:
                      action.color === 'blue'
                        ? 'rgba(59, 130, 246, 0.2)'
                        : action.color === 'green'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : action.color === 'orange'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                    color:
                      action.color === 'blue'
                        ? '#3b82f6'
                        : action.color === 'green'
                          ? '#10b981'
                          : action.color === 'orange'
                            ? '#f59e0b'
                            : '#ef4444',
                  }}
                >
                  {activeAction === index ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    action.icon
                  )}
                </div>
                <div
                  className="font-semibold text-sm mb-1 relative z-10"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {action.title}
                </div>
                <div
                  className="text-xs relative z-10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {action.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Carte Intelligence Pleine Largeur */}
          <div className="mb-6">
            <DashboardCompactMap
              profiles={(mapData || []).map((p) => ({
                ...p,
                firstName: p.firstName || '',
                lastName: p.lastName || '',
              }))}
              isLoading={mapLoading}
              className="h-[500px] md:h-[600px]"
            />
          </div>

          {/* Widgets sous la carte - Layout optimisé */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity - 2 colonnes */}
            <div className="lg:col-span-2">
              <div
                style={{
                  background: 'var(--bg-glass-primary)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-glass-primary)',
                  boxShadow: 'var(--shadow-glass)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Activité Récente
                  </h3>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Dernières 24h
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(profilesData?.items || [])
                    .slice(0, 6)
                    .map((profile: any, index: number) => {
                      const activity = {
                        icon: '👤',
                        text: `Profil ajouté: ${profile.firstName} ${profile.lastName}`,
                        time: `Il y a ${Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60))}h`,
                        color: 'blue',
                      };
                      return (
                        <div
                          key={index}
                          className="flex gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 cursor-pointer"
                          style={{ background: 'var(--bg-glass-light)' }}
                          onClick={() => router.push(`/dashboard/profiles/${profile.id}`)}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            }}
                          >
                            {(profile.firstName || 'P').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-medium text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {activity.text}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
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
