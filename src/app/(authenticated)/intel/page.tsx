'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api as convexApi } from '@/convex/_generated/api';
import { useIntelligenceDashboardStats } from '@/hooks/use-optimized-queries';
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
import { toast } from 'sonner';
import { ROUTES } from '@/schemas/routes';
import SmartInteractiveMap from '@/components/intelligence/smart-interactive-map';

// Fonction utilitaire pour formater les nombres de manière cohérente
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export default function IntelAgentDashboardContent() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeAction, setActiveAction] = useState<number | null>(null);
  const profilesMapData = useQuery(convexApi.functions.profile.getProfilesMapData);

  const dashboardStats = useIntelligenceDashboardStats('month');

  // Récupérer les données avec Convex
  const profilesResponse = useQuery(convexApi.functions.intelligence.getProfiles, {
    page: 1,
    limit: 10,
    filters: {},
  });

  const profilesData = profilesResponse
    ? {
        items: profilesResponse.profiles,
        total: profilesResponse.pagination.total,
      }
    : undefined;

  const handleQuickAction = async (index: number, title: string, path?: string) => {
    if (isNavigating) return;

    setActiveAction(index);
    setIsNavigating(true);

    try {
      switch (index) {
        case 0: // Profils
          router.push(ROUTES.dashboard.profiles);
          break;
        case 1: // Carte des Associations
          router.push(ROUTES.intel.maps.associations);
          break;
        case 2: // Annuaire Compétences
          router.push(ROUTES.intel.competences);
          break;
        case 3: // Analyses Avancées
          router.push(ROUTES.intel.analytics);
          break;
        default:
          if (path) {
            router.push(path);
          } else {
            toast.success(`Action: ${title}`, {
              description: 'Action exécutée avec succès',
            });
          }
      }
    } catch (error) {
      console.error("Erreur: Impossible d'exécuter l'action", error);
      toast.error("Erreur: Impossible d'exécuter l'action ", {
        description: "Erreur: Impossible d'exécuter l'action",
      });
    } finally {
      setTimeout(() => {
        setIsNavigating(false);
        setActiveAction(null);
      }, 1000);
    }
  };

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
          <SmartInteractiveMap profiles={profilesMapData} />
        </div>
      </div>
    </>
  );
}
