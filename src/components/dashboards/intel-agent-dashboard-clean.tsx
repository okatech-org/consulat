'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { ThemeToggleIntel } from '@/components/ui/theme-toggle-intel';
import { api } from '@/trpc/react';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  useIntelligenceDashboardStats,
  useActiveCountries,
  useNotificationCount,
} from '@/hooks/use-optimized-queries';
import { usePrefetchIntelData, usePrefetchPage } from '@/hooks/use-prefetch-intel';
import { useToast } from '@/hooks/use-toast';
import { ToastContainer } from '@/components/ui/toast-notification';
import DashboardCompactMap from '@/components/intelligence/dashboard-compact-map';
import MiniMapWidget from '@/components/intelligence/mini-map-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  MapPin,
  FileText,
  Shield,
  Moon,
  Sun,
  AlertTriangle,
  TrendingUp,
  Home,
  BarChart3,
  Lock,
  Eye,
  Map,
  Clipboard,
} from 'lucide-react';

// Variables CSS pour le thème glass - Conforme à la charte DGSS
const glassMorphismStyles = {
  light: {
    '--bg-primary': 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #f0f0f0 100%)',
    '--bg-glass-primary': 'rgba(255, 255, 255, 0.7)',
    '--bg-glass-secondary': 'rgba(255, 255, 255, 0.5)',
    '--bg-glass-light': 'rgba(0, 0, 0, 0.03)',
    '--border-glass-primary': 'rgba(0, 0, 0, 0.1)',
    '--border-glass-secondary': 'rgba(0, 0, 0, 0.08)',
    '--shadow-glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
    '--text-primary': '#1a1a1a',
    '--text-secondary': '#6b6b6b',
    '--text-muted': '#999999',
    '--interactive-hover': 'rgba(0, 0, 0, 0.05)',
    '--interactive-hover-strong': 'rgba(0, 0, 0, 0.1)',
    '--progress-bg': 'rgba(0, 0, 0, 0.1)',
    '--pattern-color': '#000',
    '--orb-opacity': '0.2',
    '--accent-intel': '#3b82f6',
    '--accent-warning': '#f59e0b',
    '--accent-success': '#10b981',
    '--accent-danger': '#ef4444',
  },
  dark: {
    '--bg-primary': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
    '--bg-glass-primary': 'rgba(30, 30, 30, 0.6)',
    '--bg-glass-secondary': 'rgba(40, 40, 40, 0.4)',
    '--bg-glass-light': 'rgba(255, 255, 255, 0.05)',
    '--border-glass-primary': 'rgba(255, 255, 255, 0.1)',
    '--border-glass-secondary': 'rgba(255, 255, 255, 0.08)',
    '--shadow-glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
    '--text-primary': '#ffffff',
    '--text-secondary': '#b3b3b3',
    '--text-muted': '#666666',
    '--interactive-hover': 'rgba(255, 255, 255, 0.05)',
    '--interactive-hover-strong': 'rgba(255, 255, 255, 0.1)',
    '--progress-bg': 'rgba(255, 255, 255, 0.1)',
    '--pattern-color': '#fff',
    '--orb-opacity': '0.4',
    '--accent-intel': '#3b82f6',
    '--accent-warning': '#f59e0b',
    '--accent-success': '#10b981',
    '--accent-danger': '#ef4444',
  },
};

function BackgroundEffects() {
  return (
    <>
      {/* Pattern de fond - Conforme charte DGSS */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          opacity: 0.03,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, var(--pattern-color, #000) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, var(--pattern-color, #000) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Orbes animés subtils */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute w-96 h-96 rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, var(--accent-intel), transparent)',
            opacity: 'var(--orb-opacity)',
            top: '-200px',
            left: '-200px',
            animation: 'float 25s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-72 h-72 rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, var(--accent-warning), transparent)',
            opacity: 'var(--orb-opacity)',
            bottom: '-150px',
            right: '-150px',
            animation: 'float 30s ease-in-out infinite reverse',
            animationDelay: '-5s',
          }}
        />
      </div>
    </>
  );
}

function LiveIndicator() {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(239, 68, 68, 0.2)',
        color: 'var(--accent-danger)',
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          background: 'var(--accent-danger)',
          opacity: isActive ? 1 : 0.3,
          animation: 'live-pulse 1.5s infinite',
        }}
      />
      LIVE
    </div>
  );
}

function CustomSidebar({ currentUser }: { currentUser: any }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { data: stats } = useIntelligenceDashboardStats('month');

  const isDark = resolvedTheme === 'dark';
  const themeText = isDark ? 'Mode sombre' : 'Mode clair';

  return (
    <aside
      className="fixed h-screen z-20 md:block hidden"
      style={{ width: '260px', padding: '1rem' }}
    >
      <div
        className="h-full p-6 flex flex-col"
        style={{
          background: 'var(--bg-glass-primary)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid var(--border-glass-primary)',
          boxShadow: 'var(--shadow-glass)',
          borderRadius: '1rem',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 mb-8 pb-6"
          style={{ borderBottom: '1px solid var(--border-glass-secondary)' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-white"
            style={{
              background:
                'linear-gradient(135deg, var(--accent-intel), var(--accent-warning))',
              animation: 'pulse-glow 3s infinite',
            }}
          >
            DG
          </div>
          <div>
            <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              DGSS
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Consulat.ga
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <div className="space-y-2">
            {[
              { icon: Home, label: 'Tableau de bord', href: '/dashboard', active: true },
              { icon: Users, label: 'Profils', href: '/dashboard/profiles' },
              { icon: MapPin, label: 'Carte', href: '/dashboard/carte' },
              { icon: FileText, label: 'Notes', href: '/dashboard/notes' },
              { icon: Shield, label: 'Sécurité', href: '/dashboard/securite' },
              { icon: BarChart3, label: 'Rapports', href: '/dashboard/rapports' },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left"
                style={{
                  background: item.active
                    ? 'var(--interactive-hover-strong)'
                    : 'transparent',
                  color: item.active ? 'var(--accent-intel)' : 'var(--text-secondary)',
                  fontWeight: item.active ? '600' : '400',
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.background = 'var(--interactive-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          <div
            className="mt-8 pt-6"
            style={{ borderTop: '1px solid var(--border-glass-secondary)' }}
          >
            <ThemeToggleIntel />
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default function IntelAgentDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeAction, setActiveAction] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();

  // Précharger les données
  usePrefetchIntelData();

  const { prefetch: prefetchProfiles } = usePrefetchPage('profiles');
  const { prefetch: prefetchNotes } = usePrefetchPage('notes');
  const { prefetch: prefetchCarte } = usePrefetchPage('carte');
  const { prefetch: prefetchSecurite } = usePrefetchPage('securite');
  const { prefetch: prefetchRapports } = usePrefetchPage('rapports');

  const { toasts, removeToast, success, error, info } = useToast();
  const { user: currentUserData } = useCurrentUser();

  const { data: dashboardStats, isLoading: statsLoading } =
    useIntelligenceDashboardStats('month');

  const {
    data: profilesData,
    isLoading: profilesLoading,
    error: profilesError,
  } = api.profile.getList.useQuery(
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

  const {
    data: mapData,
    isLoading: mapLoading,
    error: mapError,
  } = api.intelligence.getProfilesMap.useQuery(
    {
      filters: undefined,
    },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  // Mettre à jour les styles CSS et animations
  useEffect(() => {
    setMounted(true);

    if (!resolvedTheme) return;

    const theme = resolvedTheme as keyof typeof glassMorphismStyles;
    const styles = glassMorphismStyles[theme];

    if (!styles) {
      console.warn(`Thème ${theme} non trouvé, utilisation du thème dark par défaut`);
      const fallbackStyles = glassMorphismStyles.dark;
      Object.entries(fallbackStyles).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
    } else {
      // Appliquer les variables CSS
      Object.entries(styles).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
    }

    // Injecter les animations keyframes
    const existingStyle = document.querySelector('[data-intel-keyframes]');
    if (existingStyle) existingStyle.remove();

    const keyframes = document.createElement('style');
    keyframes.setAttribute('data-intel-keyframes', 'true');
    keyframes.textContent = `
      @keyframes float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(30px, -30px) rotate(120deg); }
        66% { transform: translate(-20px, 20px) rotate(240deg); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
      }
      @keyframes live-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;
    document.head.appendChild(keyframes);

    return () => {
      const cleanup = document.querySelector('[data-intel-keyframes]');
      if (cleanup) cleanup.remove();
    };
  }, [resolvedTheme]);

  const handleQuickAction = async (index: number, title: string) => {
    if (isNavigating) return;

    setActiveAction(index);
    setIsNavigating(true);

    try {
      switch (index) {
        case 0:
          await prefetchProfiles();
          router.push('/dashboard/profiles');
          break;
        case 1:
          await prefetchCarte();
          router.push('/dashboard/carte');
          break;
        case 2:
          await prefetchNotes();
          router.push('/dashboard/notes');
          break;
        case 3:
          await prefetchSecurite();
          router.push('/dashboard/securite');
          break;
        default:
          success(`Action: ${title}`, 'Action exécutée avec succès');
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

  if (!mounted || statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p>Chargement du centre de commandement...</p>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (profilesError || mapError) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold">Erreur de connexion</h2>
          <p className="text-muted-foreground">
            Impossible de charger les données du dashboard. Vérifiez votre connexion
            internet.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const currentUser = currentUserData || { name: 'Agent Intelligence', id: 'default' };

  const stats = {
    profiles: dashboardStats?.totalProfiles || 2847,
    locations: profilesData?.total || 1234,
    notes: dashboardStats?.notesThisPeriod || 156,
    alerts: 23,
  };

  return (
    <div
      style={{
        background: 'var(--bg-primary)',
        minHeight: '100vh',
        position: 'relative',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      <BackgroundEffects />

      {/* Container avec sidebar */}
      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <CustomSidebar currentUser={currentUser} />

        {/* Main Content */}
        <main
          className="flex-1 transition-all duration-300 ease-in-out overflow-x-hidden"
          style={{
            marginLeft: '276px',
            paddingTop: '2rem',
            paddingRight: '2rem',
            paddingBottom: '2rem',
            paddingLeft: '0',
          }}
        >
          {/* Top bar et stats */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Tableau de bord Intelligence
                </h1>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Bienvenue, {currentUser.name}
                </p>
              </div>
              <LiveIndicator />
            </div>

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
                  title: 'Localisations actives',
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
                  title: 'Alertes actives',
                  value: stats.alerts,
                  change: '0%',
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
                        {stat.value.toLocaleString()}
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
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
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
              {
                title: 'Audit sécurité',
                desc: "Journaux d'activité",
                icon: <Lock className="h-4 w-4" />,
                color: 'red',
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

          {/* Widgets sous la carte */}
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
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
