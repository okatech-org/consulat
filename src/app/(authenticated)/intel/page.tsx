'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useIntelligenceDashboardStats } from '@/hooks/use-optimized-queries';
import { usePrefetchIntelData, usePrefetchPage } from '@/hooks/use-prefetch-intel';
import { useToast } from '@/hooks/use-toast';
import { ToastContainer } from '@/components/ui/toast-notification';
import DashboardCompactMap from '@/components/intelligence/dashboard-compact-map';
import MiniMapWidget from '@/components/intelligence/mini-map-widget';
import { RealTimeStatusWidget } from '@/components/intelligence/realtime-status-widget';
import { RealTimeAlerts } from '@/components/intelligence/realtime-alerts';
import { IntelNavigationBar } from '@/components/intelligence/intel-navigation-bar';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import {
  Users,
  MapPin,
  FileText,
  AlertTriangle,
  TrendingUp,
  Map,
  Clipboard,
  Lock,
} from 'lucide-react';

// Fonction utilitaire pour formater les nombres de manière cohérente
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export default function IntelAgentDashboardContent() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeAction, setActiveAction] = useState<number | null>(null);

  // Précharger les données
  usePrefetchIntelData();

  const { prefetch: prefetchProfiles } = usePrefetchPage('profiles');
  const { prefetch: prefetchNotes } = usePrefetchPage('notes');
  const { prefetch: prefetchCarte } = usePrefetchPage('carte');
  const { prefetch: prefetchAssociations } = usePrefetchPage('associations');
  const { prefetch: prefetchCompetences } = usePrefetchPage('competences');
  const { prefetch: prefetchAnalytics } = usePrefetchPage('analytics');

  const { toasts, removeToast, success, error } = useToast();
  const { user: currentUserData } = useCurrentUser();

  const { data: dashboardStats } = useIntelligenceDashboardStats('month');

  const { data: profilesData, isLoading: profilesLoading } = api.profile.getList.useQuery(
    {
      page: 1,
      limit: 10,
      sort: { field: 'createdAt', order: 'desc' },
    },
    {
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const { data: mapData, isLoading: mapLoading } =
    api.intelligence.getProfilesMap.useQuery(
      {
        filters: undefined,
      },
      {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    );

  const handleQuickAction = async (index: number, title: string, path?: string) => {
    if (isNavigating) return;

    setActiveAction(index);
    setIsNavigating(true);

    try {
      switch (index) {
        case 0: // Profils
          await prefetchProfiles();
          router.push('/dashboard/profiles');
          break;
        case 1: // Carte des Associations
          await prefetchAssociations();
          router.push('/dashboard/maps/associations');
          break;
        case 2: // Annuaire Compétences
          await prefetchCompetences();
          router.push('/dashboard/competences');
          break;
        case 3: // Analyses Avancées
          await prefetchAnalytics();
          router.push('/dashboard/analytics');
          break;
        default:
          if (path) {
            router.push(path);
          } else {
            success(`Action: ${title}`, 'Action exécutée avec succès');
          }
      }
    } catch (err) {
      error('Erreur', "Impossible d'exécuter l'action");
    } finally {
      setTimeout(() => {
        setIsNavigating(false);
        setActiveAction(null);
      }, 1000);
    }
  };

  const currentUser = currentUserData || { name: 'Agent Intelligence', id: 'default' };

  const stats = {
    profiles: dashboardStats?.totalProfiles || 2226,
    locations: profilesData?.total || 981, // Profils avec adresses valides
    notes: dashboardStats?.notesThisPeriod || 156,
    associations: 129, // Entités surveillées
  };

  return (
    <>
      <IntelNavigationBar currentPage="Accueil" />
      <div className="space-y-6">
        {/* Composant d'alertes en temps réel */}
        <RealTimeAlerts />
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              title: 'Profils surveillés',
              value: stats.profiles,
              change: '+12.5%',
              icon: Users,
              color: 'blue',
            },
            {
              title: 'Géolocalisés',
              value: stats.locations,
              change: '+8.3%',
              icon: MapPin,
              color: 'green',
            },
            {
              title: 'Notes ce mois',
              value: stats.notes,
              change: '-2.1%',
              icon: FileText,
              color: 'orange',
            },
            {
              title: 'Entités surveillées',
              value: stats.associations,
              change: '+15.1%',
              icon: AlertTriangle,
              color: 'red',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
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
              <div className="flex justify-between items-start">
                <div>
                  <div
                    className="text-2xl font-bold mb-2 font-mono"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatNumber(stat.value)}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {stat.title}
                  </div>
                </div>
                <div
                  className="p-2 rounded-lg group-hover:scale-110 transition-transform"
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
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <TrendingUp
                  className="h-3 w-3"
                  style={{ color: 'var(--accent-intel)' }}
                />
                <span className="text-xs" style={{ color: 'var(--accent-intel)' }}>
                  {stat.change} ce mois
                </span>
              </div>

              {/* Barre de progression */}
              <div className="mt-3">
                <Progress
                  value={Math.min((stat.value / (stat.value * 1.2)) * 100, 100)}
                  className="h-1"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              title: 'Voir tous les profils',
              desc: 'Base de données 2,226 profils',
              icon: <Users className="h-4 w-4" />,
              color: 'blue',
              path: '/dashboard/profiles',
            },
            {
              title: 'Carte des Associations',
              desc: '129 entités surveillées',
              icon: <Map className="h-4 w-4" />,
              color: 'green',
              path: '/dashboard/maps/associations',
            },
            {
              title: 'Annuaire Compétences',
              desc: '487 compétences répertoriées',
              icon: <Clipboard className="h-4 w-4" />,
              color: 'orange',
              path: '/dashboard/competences',
            },
            {
              title: 'Analyses Avancées',
              desc: 'Détection de patterns',
              icon: <Lock className="h-4 w-4" />,
              color: 'red',
              path: '/dashboard/analytics',
            },
          ].map((action, index) => (
            <div
              key={index}
              className="transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden"
              onClick={() => handleQuickAction(index, action.title, action.path)}
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
        <div>
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

        {/* Widgets sous la carte */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statut temps réel - 1 colonne */}
          <div className="lg:col-span-1">
            <RealTimeStatusWidget />
          </div>

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

                {(!profilesData?.items || profilesData.items.length === 0) && (
                  <div className="col-span-full text-center py-8">
                    <div className="text-muted-foreground">
                      {profilesLoading ? 'Chargement...' : 'Aucune activité récente'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Distribution Mondiale */}
          <div className="lg:col-span-1">
            <MiniMapWidget
              profiles={(mapData || []).map((p) => ({
                ...p,
                firstName: p.firstName || '',
                lastName: p.lastName || '',
              }))}
              isLoading={mapLoading}
            />
          </div>
        </div>

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </>
  );
}
