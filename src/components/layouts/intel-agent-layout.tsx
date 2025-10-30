'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ThemeToggleIntel } from '@/components/ui/theme-toggle-intel';
import { useOptimizedNavigation } from '@/hooks/use-optimized-navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useIntelligenceDashboardStats } from '@/hooks/use-optimized-queries';
import {
  useDGSSRealTimeData,
  useDGSSNotifications,
  useDGSSSystemStatus,
} from '@/hooks/use-dgss-realtime-data';
import {
  Users,
  MapPin,
  FileText,
  AlertTriangle,
  Home,
  BarChart3,
  ChevronLeft,
  BookOpen,
  Network,
  Target,
  Brain,
  Building2,
} from 'lucide-react';

// Composant pour les effets de fond
function BackgroundEffects() {
  return (
    <>
      {/* Pattern de fond */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          opacity: 0.03,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, var(--pattern-color) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, var(--pattern-color) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Orbes animés */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute w-96 h-96 rounded-full blur-[100px] animate-float-1"
          style={{
            background: 'radial-gradient(circle, var(--accent-intel), transparent)',
            opacity: 'var(--orb-opacity)',
            top: '-200px',
            left: '-200px',
            animationDuration: '25s',
          }}
        />
        <div
          className="absolute w-72 h-72 rounded-full blur-[100px] animate-float-2"
          style={{
            background: 'radial-gradient(circle, var(--accent-warning), transparent)',
            opacity: 'var(--orb-opacity)',
            bottom: '-150px',
            right: '-150px',
            animationDuration: '30s',
            animationDelay: '-5s',
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full blur-[100px] animate-float-3"
          style={{
            background: 'radial-gradient(circle, var(--accent-success), transparent)',
            opacity: 'var(--orb-opacity)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animationDuration: '35s',
            animationDelay: '-10s',
          }}
        />
      </div>
    </>
  );
}

// Composant pour l'indicateur LIVE
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
        color: '#ef4444',
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          background: '#ef4444',
          opacity: isActive ? 1 : 0.3,
          animation: 'live-pulse 1.5s infinite',
        }}
      />
      LIVE
    </div>
  );
}

// Composant pour la sidebar
function CustomSidebar({
  currentPage,
  navigateTo,
  handleMouseEnter,
}: {
  currentPage: string;
  navigateTo: (path: string) => void;
  handleMouseEnter: (path: string) => () => void;
}) {
  const { resolvedTheme } = useTheme();
  const { data: stats } = useIntelligenceDashboardStats('month');

  // Données en temps réel
  const { data: realTimeData, isLoading: realTimeLoading } = useDGSSRealTimeData();
  const { unreadCount, hasUnread } = useDGSSNotifications();
  const { uptime, isHealthy } = useDGSSSystemStatus();

  const isDark = resolvedTheme === 'dark';
  const themeText = isDark ? 'Mode sombre' : 'Mode clair';

  const navigationItems = [
    {
      key: 'dashboard',
      label: 'Tableau de bord',
      icon: Home,
      path: '/dashboard',
      badge: realTimeData?.newProfilesToday
        ? `+${realTimeData.newProfilesToday}`
        : undefined,
      trend: realTimeData?.profilesTrend,
    },
    {
      key: 'profiles',
      label: 'Profils',
      icon: Users,
      path: '/dashboard/profiles',
      badge: realTimeLoading
        ? '...'
        : realTimeData?.totalProfiles?.toLocaleString() ||
          stats?.totalProfiles ||
          '2,226',
      trend: realTimeData?.profilesTrend,
    },
    { key: 'carte', label: 'Carte', icon: MapPin, path: '/dashboard/carte' },
    {
      key: 'projets',
      label: 'Projets',
      icon: Building2,
      path: '/dashboard/projets',
      badge: '5',
    },
  ];

  const cartographieItems = [
    {
      key: 'associations-map',
      label: 'Carte des Associations',
      icon: MapPin,
      path: '/dashboard/maps/associations',
      badge: realTimeData?.totalEntities?.toString() || '129',
    },
  ];

  const entitiesSurveilleesItems = [
    {
      key: 'entities',
      label: "Vue d'ensemble",
      icon: Building2,
      path: '/dashboard/entities',
      badge: realTimeData?.totalEntities?.toString() || '129',
      trend: realTimeData?.entitiesTrend,
    },
    {
      key: 'entities-critical',
      label: 'Surveillance critique',
      icon: AlertTriangle,
      path: '/dashboard/entities?tab=critical',
      badge: realTimeData?.criticalEntities?.toString() || '6',
      critical: true,
      pulse: realTimeData?.criticalEntities && realTimeData.criticalEntities > 6,
    },
  ];

  const renseignementItems = [
    {
      key: 'notes',
      label: 'Notes',
      icon: FileText,
      path: '/dashboard/notes',
      badge: realTimeData?.totalNotes?.toString() || stats?.notesThisPeriod || '12',
      trend: realTimeData?.notesTrend,
    },
    {
      key: 'competences',
      label: 'Annuaire Compétences',
      icon: BookOpen,
      path: '/dashboard/competences',
      badge: realTimeData?.totalSkills?.toString() || '487',
      subBadge: realTimeData?.jobSeekers
        ? `${realTimeData.jobSeekers} en recherche`
        : undefined,
    },
    {
      key: 'reseaux',
      label: "Réseaux d'Influence",
      icon: Network,
      path: '/dashboard/reseaux',
    },
  ];

  const analysesItems = [
    {
      key: 'dashboard-analytics',
      label: 'Analyses Avancées',
      icon: BarChart3,
      path: '/dashboard/analytics',
    },
    {
      key: 'clusters',
      label: 'Détection Clusters',
      icon: Target,
      path: '/dashboard/clusters',
    },
    {
      key: 'predictions',
      label: 'Prédictions IA',
      icon: Brain,
      path: '/dashboard/predictions',
    },
  ];

  // Fonction helper pour rendre les badges avec indicateurs - Design 2.1
  const renderBadge = (item: {
    badge?: string;
    subBadge?: string;
    critical?: boolean;
    pulse?: boolean;
    trend?: string;
  }) => {
    if (!item.badge && !item.subBadge) return null;

    return (
      <div className="flex flex-col items-end gap-1">
        {item.badge && (
          <div className="flex items-center gap-1">
            <span
              className={`px-2.5 py-1 text-xs rounded-full font-semibold transition-all duration-300 ${
                item.critical ? 'text-red-400 shadow-lg' : 'text-blue-400 shadow-md'
              } ${item.pulse ? 'animate-pulse' : ''}`}
              style={{
                background: item.critical
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(59, 130, 246, 0.15)',
                border: item.critical
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : '1px solid rgba(59, 130, 246, 0.3)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: item.critical
                  ? '0 4px 12px rgba(239, 68, 68, 0.2)'
                  : '0 4px 12px rgba(59, 130, 246, 0.2)',
              }}
            >
              {item.badge}
            </span>
            {item.trend && (
              <div
                className={`w-2 h-2 rounded-full ${
                  item.trend === 'up'
                    ? 'bg-green-400 animate-pulse'
                    : item.trend === 'down'
                      ? 'bg-red-400 animate-pulse'
                      : 'bg-gray-400'
                }`}
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              />
            )}
          </div>
        )}
        {item.subBadge && (
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {item.subBadge}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes scan {
          0% { 
            left: -100px;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% { 
            left: 100%;
            opacity: 0;
          }
        }
      `}</style>

      <aside
        className="fixed h-screen z-20 md:block hidden"
        style={{
          width: '260px',
          padding: '1rem',
        }}
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
            className="flex items-center gap-3 mb-8 pb-6 relative"
            style={{
              borderBottom: '1px solid var(--border-glass-secondary)',
            }}
          >
            <div className="relative">
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
              {/* Badge de notifications */}
              {hasUnread && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
              {/* Indicateur d'alertes critiques */}
              {realTimeData?.securityAlerts && realTimeData.securityAlerts > 0 && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                DGSS
              </div>
              <div
                className="text-xs flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>Consulat.ga</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            {/* Section Principal */}
            <div className="mb-6">
              <div
                className="text-xs uppercase tracking-wide mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Principal
              </div>

              {navigationItems.map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer relative transition-all duration-300 group overflow-hidden ${
                    currentPage === item.key ? 'active' : ''
                  }`}
                  style={{
                    background:
                      currentPage === item.key ? 'var(--bg-glass-light)' : 'transparent',
                    border:
                      currentPage === item.key
                        ? '1px solid var(--border-glass-primary)'
                        : '1px solid transparent',
                    boxShadow: currentPage === item.key ? 'var(--shadow-glass)' : 'none',
                  }}
                  onClick={() => navigateTo(item.path)}
                  onMouseEnter={(e) => {
                    handleMouseEnter(item.path)();
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = 'var(--bg-glass-light)';
                      e.currentTarget.style.border =
                        '1px solid var(--border-glass-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.border = '1px solid transparent';
                    }
                  }}
                >
                  {/* Barre de scan animée pour l'élément actif */}
                  {currentPage === item.key && (
                    <div
                      className="absolute top-0 left-0 h-1 opacity-80"
                      style={{
                        width: '100px',
                        background:
                          'linear-gradient(90deg, transparent, var(--accent-intel) 50%, transparent)',
                        animation: 'scan 2s infinite linear',
                      }}
                    />
                  )}

                  {/* Indicateur actif */}
                  {currentPage === item.key && (
                    <div
                      className="absolute left-0 top-0 h-full w-1"
                      style={{
                        background: 'var(--accent-intel)',
                        borderRadius: '0 4px 4px 0',
                      }}
                    />
                  )}

                  <item.icon
                    className="w-5 h-5 flex-shrink-0"
                    style={{
                      color:
                        currentPage === item.key
                          ? 'var(--accent-intel)'
                          : 'var(--text-muted)',
                      opacity: currentPage === item.key ? 1 : 0.7,
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        currentPage === item.key
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      fontWeight: currentPage === item.key ? '600' : '500',
                    }}
                  >
                    {item.label}
                  </span>
                  <div className="ml-auto">{renderBadge(item)}</div>
                </div>
              ))}
            </div>

            {/* Section Renseignements - 2e position */}
            <div className="mb-6">
              <div
                className="text-xs uppercase tracking-wide mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Renseignements
              </div>

              {renseignementItems.map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer relative transition-all duration-300 group overflow-hidden ${
                    currentPage === item.key ? 'active' : ''
                  }`}
                  style={{
                    background:
                      currentPage === item.key ? 'var(--bg-glass-light)' : 'transparent',
                    border:
                      currentPage === item.key
                        ? '1px solid var(--border-glass-primary)'
                        : '1px solid transparent',
                    boxShadow: currentPage === item.key ? 'var(--shadow-glass)' : 'none',
                  }}
                  onClick={() => navigateTo(item.path)}
                  onMouseEnter={(e) => {
                    handleMouseEnter(item.path)();
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = 'var(--bg-glass-light)';
                      e.currentTarget.style.border =
                        '1px solid var(--border-glass-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.border = '1px solid transparent';
                    }
                  }}
                >
                  {/* Barre de scan animée pour l'élément actif */}
                  {currentPage === item.key && (
                    <div
                      className="absolute top-0 left-0 h-1 opacity-80"
                      style={{
                        width: '100px',
                        background:
                          'linear-gradient(90deg, transparent, var(--accent-intel) 50%, transparent)',
                        animation: 'scan 2s infinite linear',
                      }}
                    />
                  )}

                  {/* Indicateur actif */}
                  {currentPage === item.key && (
                    <div
                      className="absolute left-0 top-0 h-full w-1"
                      style={{
                        background: 'var(--accent-intel)',
                        borderRadius: '0 4px 4px 0',
                      }}
                    />
                  )}

                  <item.icon
                    className="w-5 h-5 flex-shrink-0"
                    style={{
                      color:
                        currentPage === item.key
                          ? 'var(--accent-intel)'
                          : 'var(--text-muted)',
                      opacity: currentPage === item.key ? 1 : 0.7,
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        currentPage === item.key
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      fontWeight: currentPage === item.key ? '600' : '500',
                    }}
                  >
                    {item.label}
                  </span>
                  <div className="ml-auto">{renderBadge(item)}</div>
                </div>
              ))}
            </div>

            {/* Section Cartographie */}
            <div className="mb-6">
              <div
                className="text-xs uppercase tracking-wide mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Cartographie
              </div>

              {cartographieItems.map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer relative transition-all duration-300 group overflow-hidden ${
                    currentPage === item.key ? 'active' : ''
                  }`}
                  style={{
                    background:
                      currentPage === item.key ? 'var(--bg-glass-light)' : 'transparent',
                    border:
                      currentPage === item.key
                        ? '1px solid var(--border-glass-primary)'
                        : '1px solid transparent',
                    boxShadow: currentPage === item.key ? 'var(--shadow-glass)' : 'none',
                  }}
                  onClick={() => navigateTo(item.path)}
                  onMouseEnter={(e) => {
                    handleMouseEnter(item.path)();
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = 'var(--bg-glass-light)';
                      e.currentTarget.style.border =
                        '1px solid var(--border-glass-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.border = '1px solid transparent';
                    }
                  }}
                >
                  {/* Barre de scan animée pour l'élément actif */}
                  {currentPage === item.key && (
                    <div
                      className="absolute top-0 left-0 h-1 opacity-80"
                      style={{
                        width: '100px',
                        background:
                          'linear-gradient(90deg, transparent, var(--accent-intel) 50%, transparent)',
                        animation: 'scan 2s infinite linear',
                      }}
                    />
                  )}

                  {/* Indicateur actif */}
                  {currentPage === item.key && (
                    <div
                      className="absolute left-0 top-0 h-full w-1"
                      style={{
                        background: 'var(--accent-intel)',
                        borderRadius: '0 4px 4px 0',
                      }}
                    />
                  )}

                  <item.icon
                    className="w-5 h-5 flex-shrink-0"
                    style={{
                      color:
                        currentPage === item.key
                          ? 'var(--accent-intel)'
                          : 'var(--text-muted)',
                      opacity: currentPage === item.key ? 1 : 0.7,
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        currentPage === item.key
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      fontWeight: currentPage === item.key ? '600' : '500',
                    }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className="ml-auto px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-300"
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#f59e0b',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Section Entités Surveillées */}
            <div className="mb-6">
              <div
                className="text-xs uppercase tracking-wide mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Entités Surveillées
              </div>

              {entitiesSurveilleesItems.map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer relative transition-all duration-300 group overflow-hidden ${
                    currentPage === item.key ? 'active' : ''
                  }`}
                  style={{
                    background:
                      currentPage === item.key
                        ? 'var(--bg-glass-light)'
                        : item.critical
                          ? 'rgba(239, 68, 68, 0.08)'
                          : 'transparent',
                    border:
                      currentPage === item.key
                        ? '1px solid var(--border-glass-primary)'
                        : item.critical
                          ? '1px solid rgba(239, 68, 68, 0.3)'
                          : '1px solid transparent',
                    boxShadow:
                      currentPage === item.key
                        ? 'var(--shadow-glass)'
                        : item.critical
                          ? '0 4px 12px rgba(239, 68, 68, 0.15)'
                          : 'none',
                  }}
                  onClick={() => navigateTo(item.path)}
                  onMouseEnter={(e) => {
                    handleMouseEnter(item.path)();
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = item.critical
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'var(--bg-glass-light)';
                      e.currentTarget.style.border = item.critical
                        ? '1px solid rgba(239, 68, 68, 0.4)'
                        : '1px solid var(--border-glass-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = item.critical
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'transparent';
                      e.currentTarget.style.border = item.critical
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid transparent';
                    }
                  }}
                >
                  {/* Barre de scan animée pour l'élément actif */}
                  {currentPage === item.key && (
                    <div
                      className="absolute top-0 left-0 h-1 opacity-80"
                      style={{
                        width: '100px',
                        background: item.critical
                          ? 'linear-gradient(90deg, transparent, #ef4444 50%, transparent)'
                          : 'linear-gradient(90deg, transparent, var(--accent-intel) 50%, transparent)',
                        animation: 'scan 2s infinite linear',
                      }}
                    />
                  )}

                  {/* Indicateur actif */}
                  {currentPage === item.key && (
                    <div
                      className="absolute left-0 top-0 h-full w-1"
                      style={{
                        background: item.critical ? '#ef4444' : 'var(--accent-intel)',
                        borderRadius: '0 4px 4px 0',
                      }}
                    />
                  )}

                  <item.icon
                    className="w-5 h-5 flex-shrink-0"
                    style={{
                      color:
                        currentPage === item.key
                          ? item.critical
                            ? '#ef4444'
                            : 'var(--accent-intel)'
                          : item.critical
                            ? '#ef4444'
                            : 'var(--text-muted)',
                      opacity: currentPage === item.key ? 1 : 0.8,
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        currentPage === item.key
                          ? 'var(--text-primary)'
                          : item.critical
                            ? '#ef4444'
                            : 'var(--text-secondary)',
                      fontWeight:
                        currentPage === item.key ? '600' : item.critical ? '600' : '500',
                    }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`ml-auto px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                        item.pulse ? 'animate-pulse' : ''
                      }`}
                      style={{
                        background: item.critical
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(16, 185, 129, 0.15)',
                        border: item.critical
                          ? '1px solid rgba(239, 68, 68, 0.3)'
                          : '1px solid rgba(16, 185, 129, 0.3)',
                        color: item.critical ? '#ef4444' : '#10b981',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        boxShadow: item.critical
                          ? '0 4px 12px rgba(239, 68, 68, 0.2)'
                          : '0 4px 12px rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.critical && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" />
                  )}
                </div>
              ))}
            </div>

            {/* Section Analyses */}
            <div className="mb-6">
              <div
                className="text-xs uppercase tracking-wide mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Analyses
              </div>

              {analysesItems.map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer relative transition-all duration-300 group overflow-hidden ${
                    currentPage === item.key ? 'active' : ''
                  }`}
                  style={{
                    background:
                      currentPage === item.key ? 'var(--bg-glass-light)' : 'transparent',
                    border:
                      currentPage === item.key
                        ? '1px solid var(--border-glass-primary)'
                        : '1px solid transparent',
                    boxShadow: currentPage === item.key ? 'var(--shadow-glass)' : 'none',
                  }}
                  onClick={() => navigateTo(item.path)}
                  onMouseEnter={(e) => {
                    handleMouseEnter(item.path)();
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = 'var(--bg-glass-light)';
                      e.currentTarget.style.border =
                        '1px solid var(--border-glass-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.border = '1px solid transparent';
                    }
                  }}
                >
                  {/* Barre de scan animée pour l'élément actif */}
                  {currentPage === item.key && (
                    <div
                      className="absolute top-0 left-0 h-1 opacity-80"
                      style={{
                        width: '100px',
                        background:
                          'linear-gradient(90deg, transparent, var(--accent-intel) 50%, transparent)',
                        animation: 'scan 2s infinite linear',
                      }}
                    />
                  )}

                  {/* Indicateur actif */}
                  {currentPage === item.key && (
                    <div
                      className="absolute left-0 top-0 h-full w-1"
                      style={{
                        background: 'var(--accent-intel)',
                        borderRadius: '0 4px 4px 0',
                      }}
                    />
                  )}

                  <item.icon
                    className="w-5 h-5 flex-shrink-0"
                    style={{
                      color:
                        currentPage === item.key
                          ? 'var(--accent-intel)'
                          : 'var(--text-muted)',
                      opacity: currentPage === item.key ? 1 : 0.7,
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        currentPage === item.key
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      fontWeight: currentPage === item.key ? '600' : '500',
                    }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className="ml-auto px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-300"
                      style={{
                        background: 'rgba(168, 85, 247, 0.15)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        color: '#a855f7',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Section Données Temps Réel */}
          <div
            className="pt-4 pb-4"
            style={{
              borderTop: '1px solid var(--border-glass-secondary)',
            }}
          >
            <div
              className="text-xs uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Statut Système
            </div>

            <div className="space-y-2">
              {/* Statut système */}
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Disponibilité</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isHealthy ? 'bg-green-400' : 'bg-orange-400'
                    } ${isHealthy ? '' : 'animate-pulse'}`}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>{uptime}%</span>
                </div>
              </div>

              {/* Agents actifs */}
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Agents actifs</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {realTimeData?.activeAgents || 3}
                </span>
              </div>

              {/* Alertes de sécurité */}
              {realTimeData?.securityAlerts && realTimeData.securityAlerts > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--text-secondary)' }}>Alertes sécurité</span>
                  <span className="text-red-400 font-medium animate-pulse">
                    {realTimeData.securityAlerts}
                  </span>
                </div>
              )}

              {/* Dernière mise à jour */}
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Dernière MAJ</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {realTimeData?.lastUpdate
                    ? realTimeData.lastUpdate.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </span>
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div
            className="pt-4"
            style={{
              borderTop: '1px solid var(--border-glass-secondary)',
            }}
          >
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'var(--bg-glass-light)' }}
            >
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span>{themeText}</span>
              </div>
              <ThemeToggleIntel />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface IntelAgentLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  currentPage: string;
  backButton?: boolean;
}

export default function IntelAgentLayout({
  children,
  title,
  description,
  currentPage,
  backButton = false,
}: IntelAgentLayoutProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { navigateTo, handleMouseEnter, isPending } = useOptimizedNavigation();

  // Récupérer l'utilisateur actuel
  const { user: currentUserData } = useCurrentUser();

  // Données en temps réel pour le layout principal
  const { unreadCount, hasUnread } = useDGSSNotifications();
  const { uptime, isHealthy } = useDGSSSystemStatus();

  // Initialiser le composant
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Chargement du centre de commandement...</p>
        </div>
      </div>
    );
  }

  // Données utilisateur réelles
  const currentUser = {
    name: currentUserData?.name || 'Agent Intelligence',
    role: currentUserData?.roles?.[0] || 'INTEL_AGENT',
    initials: currentUserData?.name
      ? currentUserData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'AI',
  };

  return (
    <div
      style={{
        background: 'var(--bg-primary)',
        minHeight: '100vh',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Indicateur de chargement global */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
            style={{
              animation: 'loading-slide 1s ease-in-out infinite',
              width: '30%',
            }}
          />
        </div>
      )}

      <BackgroundEffects />

      {/* Container avec sidebar */}
      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <CustomSidebar
          currentPage={currentPage}
          navigateTo={navigateTo}
          handleMouseEnter={handleMouseEnter}
        />

        {/* Top bar mobile */}
        <div className="fixed top-0 left-0 right-0 z-30 md:hidden backdrop-blur-sm bg-card/60 border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {backButton && (
                <button
                  onClick={() => router.back()}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                style={{
                  background:
                    'linear-gradient(135deg, var(--accent-intel), var(--accent-warning))',
                }}
              >
                DG
              </div>
              <div>
                <div className="font-semibold text-sm">DGSS Intelligence</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notifications */}
              {hasUnread && (
                <div className="relative">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                </div>
              )}

              {/* Statut système */}
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isHealthy ? 'bg-green-400' : 'bg-orange-400'
                  } ${isHealthy ? '' : 'animate-pulse'}`}
                />
                <span className="text-xs text-muted-foreground">{uptime}%</span>
              </div>

              <LiveIndicator />
              <ThemeToggleIntel />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 md:ml-[260px] pt-20 md:pt-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {backButton && (
                <button
                  onClick={() => router.back()}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
                  style={{
                    background: 'var(--bg-glass-secondary)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1
                  className="text-3xl font-bold mb-1"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--text-primary), var(--text-secondary))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {title}
                </h1>
                {description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <LiveIndicator />
              <div
                className="flex items-center gap-3 p-2 rounded-xl"
                style={{
                  background: 'var(--bg-glass-secondary)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid var(--border-glass-secondary)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--accent-intel), var(--accent-warning))',
                  }}
                >
                  {currentUser.initials}
                </div>
                <div className="hidden sm:block">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {currentUser.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {currentUser.role}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
