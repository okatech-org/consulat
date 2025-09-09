'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { ThemeToggleIntel } from '@/components/ui/theme-toggle-intel';
import { useOptimizedNavigation, usePrefetchCommonData } from '@/hooks/use-optimized-navigation';
import { useAggressivePrefetch, useBackgroundRefresh } from '@/hooks/use-aggressive-cache';
import { useCurrentUser } from '@/hooks/use-role-data';
import { useIntelligenceDashboardStats } from '@/hooks/use-optimized-queries';
import { useDGSSRealTimeData, useDGSSNotifications, useDGSSSystemStatus } from '@/hooks/use-dgss-realtime-data';
import { 
  Users, 
  MapPin, 
  FileText, 
  Shield, 
  Moon, 
  Sun,
  AlertTriangle,
  Home,
  BarChart3,
  Lock,
  Eye,
  ChevronLeft,
  Heart,
  Briefcase,
  Trophy,
  Scale,
  MessageCircle,
  BookOpen,
  Network,
  Target,
  Brain,
  Building2
} from 'lucide-react';

// Variables CSS dynamiques pour le glass morphism selon le thème
const getDynamicCSSVariables = (theme: string) => `
  :root {
    --bg-primary: ${theme === 'dark' 
      ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)'
      : 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #f0f0f0 100%)'
    };
    --bg-glass-primary: ${theme === 'dark'
      ? 'rgba(30, 30, 30, 0.6)'
      : 'rgba(255, 255, 255, 0.7)'
    };
    --bg-glass-secondary: ${theme === 'dark'
      ? 'rgba(40, 40, 40, 0.4)'
      : 'rgba(255, 255, 255, 0.5)'
    };
    --bg-glass-light: ${theme === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)'
    };
    --border-glass-primary: ${theme === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'
    };
    --border-glass-secondary: ${theme === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.08)'
    };
    --text-primary: ${theme === 'dark' ? '#ffffff' : '#1a1a1a'};
    --text-secondary: ${theme === 'dark' ? '#b3b3b3' : '#6b6b6b'};
    --text-muted: ${theme === 'dark' ? '#666666' : '#999999'};
    --interactive-hover: ${theme === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.05)'
    };
    --interactive-hover-strong: ${theme === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'
    };
    --shadow-glass: ${theme === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.08)'
    };
    --progress-bg: ${theme === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'
    };
    --pattern-color: ${theme === 'dark' ? '#fff' : '#000'};
    --orb-opacity: ${theme === 'dark' ? '0.4' : '0.2'};
    --accent-intel: #3b82f6;
    --accent-warning: #f59e0b;
    --accent-success: #10b981;
    --accent-danger: #ef4444;
  }
`;

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
          backgroundSize: '50px 50px'
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
            animationDuration: '25s'
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
            animationDelay: '-5s'
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
            animationDelay: '-10s'
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
      setIsActive(prev => !prev);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(239, 68, 68, 0.2)',
        color: '#ef4444'
      }}
    >
      <div 
        className="w-2 h-2 rounded-full"
        style={{
          background: '#ef4444',
          opacity: isActive ? 1 : 0.3,
          animation: 'live-pulse 1.5s infinite'
        }}
      />
      LIVE
    </div>
  );
}

// Composant pour la sidebar
function CustomSidebar({ 
  currentUser, 
  currentPage,
  navigateTo,
  handleMouseEnter 
}: { 
  currentUser: any, 
  currentPage: string,
  navigateTo: (path: string) => void,
  handleMouseEnter: (path: string) => () => void
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { data: stats } = useIntelligenceDashboardStats('month');
  
  // Données en temps réel
  const { data: realTimeData, isLoading: realTimeLoading } = useDGSSRealTimeData();
  const { unreadCount, hasUnread } = useDGSSNotifications();
  const { status: systemStatus, uptime, isHealthy } = useDGSSSystemStatus();
  
  const isDark = resolvedTheme === 'dark';
  const themeText = isDark ? 'Mode sombre' : 'Mode clair';

  const navigationItems = [
    { 
      key: 'dashboard', 
      label: 'Tableau de bord', 
      icon: Home, 
      path: '/dashboard',
      badge: realTimeData?.newProfilesToday ? `+${realTimeData.newProfilesToday}` : undefined,
      trend: realTimeData?.profilesTrend
    },
    { 
      key: 'profiles', 
      label: 'Profils', 
      icon: Users, 
      path: '/dashboard/profiles', 
      badge: realTimeLoading ? '...' : (realTimeData?.totalProfiles?.toLocaleString() || stats?.totalProfiles || '2,226'),
      trend: realTimeData?.profilesTrend
    },
    { key: 'carte', label: 'Carte', icon: MapPin, path: '/dashboard/carte' },
    { key: 'projets', label: 'Projets', icon: Building2, path: '/dashboard/projets', badge: '5' },
  ];

  const cartographieItems = [
    { 
      key: 'associations-map', 
      label: 'Carte des Associations', 
      icon: MapPin, 
      path: '/dashboard/maps/associations', 
      badge: realTimeData?.totalEntities?.toString() || '129' 
    },
  ];

  const entitiesSurveilleesItems = [
    { 
      key: 'entities', 
      label: 'Vue d\'ensemble', 
      icon: Building2, 
      path: '/dashboard/entities', 
      badge: realTimeData?.totalEntities?.toString() || '129',
      trend: realTimeData?.entitiesTrend
    },
    { 
      key: 'entities-critical', 
      label: 'Surveillance critique', 
      icon: AlertTriangle, 
      path: '/dashboard/entities?tab=critical', 
      badge: realTimeData?.criticalEntities?.toString() || '6', 
      critical: true,
      pulse: realTimeData?.criticalEntities && realTimeData.criticalEntities > 6
    },
  ];

  const renseignementItems = [
    { 
      key: 'notes', 
      label: 'Notes', 
      icon: FileText, 
      path: '/dashboard/notes', 
      badge: realTimeData?.totalNotes?.toString() || stats?.notesThisPeriod || '12',
      trend: realTimeData?.notesTrend
    },
    { 
      key: 'competences', 
      label: 'Annuaire Compétences', 
      icon: BookOpen, 
      path: '/dashboard/competences', 
      badge: realTimeData?.totalSkills?.toString() || '487',
      subBadge: realTimeData?.jobSeekers ? `${realTimeData.jobSeekers} en recherche` : undefined
    },
    { key: 'reseaux', label: 'Réseaux d\'Influence', icon: Network, path: '/dashboard/reseaux' },
  ];

  const analysesItems = [
    { key: 'dashboard-analytics', label: 'Analyses Avancées', icon: BarChart3, path: '/dashboard/analytics' },
    { key: 'clusters', label: 'Détection Clusters', icon: Target, path: '/dashboard/clusters' },
    { key: 'predictions', label: 'Prédictions IA', icon: Brain, path: '/dashboard/predictions' },
  ];

  // Fonction helper pour rendre les badges avec indicateurs
  const renderBadge = (item: any) => {
    if (!item.badge && !item.subBadge) return null;
    
    return (
      <div className="flex flex-col items-end gap-1">
        {item.badge && (
          <div className="flex items-center gap-1">
            <span 
              className={`px-2 py-1 text-xs rounded-full font-medium ${
                item.critical 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              } ${item.pulse ? 'animate-pulse' : ''}`}
            >
              {item.badge}
            </span>
            {item.trend && (
              <div className={`w-2 h-2 rounded-full ${
                item.trend === 'up' ? 'bg-green-400 animate-pulse' : 
                item.trend === 'down' ? 'bg-red-400 animate-pulse' : 
                'bg-gray-400'
              }`} />
            )}
          </div>
        )}
        {item.subBadge && (
          <span className="text-xs text-muted-foreground">
            {item.subBadge}
          </span>
        )}
      </div>
    );
  };
  
  return (
    <aside 
      className="fixed h-screen z-20 md:block hidden"
      style={{
        width: '260px',
        padding: '1rem'
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
          borderRadius: '1rem'
        }}
      >
        {/* Logo */}
        <div 
          className="flex items-center gap-3 mb-8 pb-6 relative"
          style={{
            borderBottom: '1px solid var(--border-glass-secondary)'
          }}
        >
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-white"
              style={{
                background: 'linear-gradient(135deg, var(--accent-intel), var(--accent-warning))',
                animation: 'pulse-glow 3s infinite'
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
            <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <span>Consulat.ga</span>
              {/* Statut de surveillance */}
              {realTimeData?.surveillanceStatus && realTimeData.surveillanceStatus !== 'normal' && (
                <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                  realTimeData.surveillanceStatus === 'critical' ? 'bg-red-500/20 text-red-400' :
                  realTimeData.surveillanceStatus === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {realTimeData.surveillanceStatus.toUpperCase()}
                </span>
              )}
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
                className={`flex items-center gap-3 p-2 rounded-lg mb-1 cursor-pointer relative transition-all ${
                  currentPage === item.key ? 'active' : ''
                }`}
                style={{
                  background: currentPage === item.key ? 'var(--interactive-hover-strong)' : 'transparent'
                }}
                onClick={() => navigateTo(item.path)}
                onMouseEnter={() => handleMouseEnter(item.path)}
              >
                {currentPage === item.key && (
                  <div 
                    className="absolute left-0 top-0 h-full w-1"
                    style={{
                      background: 'var(--accent-intel)',
                      borderRadius: '0 2px 2px 0'
                    }}
                  />
                )}
                <item.icon className="w-4 h-4 opacity-70" />
                <span className="text-sm">{item.label}</span>
                <div className="ml-auto">
                  {renderBadge(item)}
                </div>
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
                className={`flex items-center gap-3 p-2 rounded-lg mb-1 cursor-pointer relative transition-all ${
                  currentPage === item.key ? 'active' : ''
                }`}
                style={{
                  background: currentPage === item.key ? 'var(--interactive-hover-strong)' : 'transparent'
                }}
                onClick={() => navigateTo(item.path)}
                onMouseEnter={() => handleMouseEnter(item.path)}
              >
                {currentPage === item.key && (
                  <div 
                    className="absolute left-0 top-0 h-full w-1"
                    style={{
                      background: 'var(--accent-intel)',
                      borderRadius: '0 2px 2px 0'
                    }}
                  />
                )}
                <item.icon className="w-4 h-4 opacity-70" />
                <span className="text-sm">{item.label}</span>
                <div className="ml-auto">
                  {renderBadge(item)}
                </div>
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
                className={`flex items-center gap-3 p-2 rounded-lg mb-1 cursor-pointer relative transition-all ${
                  currentPage === item.key ? 'active' : ''
                }`}
                style={{
                  background: currentPage === item.key ? 'var(--interactive-hover-strong)' : 'transparent'
                }}
                onClick={() => navigateTo(item.path)}
                onMouseEnter={() => handleMouseEnter(item.path)}
              >
                {currentPage === item.key && (
                  <div 
                    className="absolute left-0 top-0 h-full w-1"
                    style={{
                      background: 'var(--accent-intel)',
                      borderRadius: '0 2px 2px 0'
                    }}
                  />
                )}
                <item.icon className="w-4 h-4 opacity-70" />
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <span 
                    className="ml-auto px-1.5 py-0.5 text-white text-xs font-semibold rounded-full"
                    style={{ background: 'var(--accent-warning)' }}
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
                className={`flex items-center gap-3 p-2 rounded-lg mb-1 cursor-pointer relative transition-all ${
                  currentPage === item.key ? 'active' : ''
                } ${item.critical ? 'border border-red-500/30' : ''}`}
                style={{
                  background: currentPage === item.key ? 'var(--interactive-hover-strong)' : 
                             item.critical ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                }}
                onClick={() => navigateTo(item.path)}
                onMouseEnter={() => handleMouseEnter(item.path)}
              >
                {currentPage === item.key && (
                  <div 
                    className="absolute left-0 top-0 h-full w-1"
                    style={{
                      background: item.critical ? 'var(--accent-danger)' : 'var(--accent-intel)',
                      borderRadius: '0 2px 2px 0'
                    }}
                  />
                )}
                <item.icon className={`w-4 h-4 opacity-70 ${item.critical ? 'text-red-500' : ''}`} />
                <span className={`text-sm ${item.critical ? 'text-red-500 font-medium' : ''}`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span 
                    className="ml-auto px-1.5 py-0.5 text-white text-xs font-semibold rounded-full"
                    style={{ 
                      background: item.critical ? 'var(--accent-danger)' : 'var(--accent-success)',
                      animation: item.critical ? 'pulse 2s infinite' : 'none'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {item.critical && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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
                className={`flex items-center gap-3 p-2 rounded-lg mb-1 cursor-pointer relative transition-all ${
                  currentPage === item.key ? 'active' : ''
                }`}
                style={{
                  background: currentPage === item.key ? 'var(--interactive-hover-strong)' : 'transparent'
                }}
                onClick={() => navigateTo(item.path)}
                onMouseEnter={() => handleMouseEnter(item.path)}
              >
                {currentPage === item.key && (
                  <div 
                    className="absolute left-0 top-0 h-full w-1"
                    style={{
                      background: 'var(--accent-intel)',
                      borderRadius: '0 2px 2px 0'
                    }}
                  />
                )}
                <item.icon className="w-4 h-4 opacity-70" />
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <span 
                    className="ml-auto px-1.5 py-0.5 text-white text-xs font-semibold rounded-full"
                    style={{ background: 'var(--accent-danger)' }}
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
            borderTop: '1px solid var(--border-glass-secondary)'
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
                <div className={`w-2 h-2 rounded-full ${
                  isHealthy ? 'bg-green-400' : 'bg-orange-400'
                } ${isHealthy ? '' : 'animate-pulse'}`} />
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
                {realTimeData?.lastUpdate ? 
                  realTimeData.lastUpdate.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : 
                  '--:--'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div 
          className="pt-4"
          style={{ 
            borderTop: '1px solid var(--border-glass-secondary)'
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
  backButton = false 
}: IntelAgentLayoutProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const { navigateTo, handleMouseEnter, isPending } = useOptimizedNavigation();
  const { prefetchCommon } = usePrefetchCommonData();
  
  // Activer le préchargement agressif et le rafraîchissement en arrière-plan
  useAggressivePrefetch();
  useBackgroundRefresh();
  
  // Récupérer l'utilisateur actuel
  const { user: currentUserData } = useCurrentUser();
  
  // Données en temps réel pour le layout principal
  const { unreadCount, hasUnread } = useDGSSNotifications();
  const { status: systemStatus, uptime, isHealthy } = useDGSSSystemStatus();

  // Mettre à jour les styles CSS immédiatement quand le thème change
  useEffect(() => {
    setMounted(true);
    
    // Appliquer immédiatement les styles par défaut
    if (resolvedTheme) {
      applyThemeStyles(resolvedTheme);
    }
    
    // Précharger les données communes au montage
    prefetchCommon();
  }, [prefetchCommon]);

  useEffect(() => {
    if (!resolvedTheme) return;
    
    // Appliquer les styles immédiatement lors du changement de thème
    applyThemeStyles(resolvedTheme);
  }, [resolvedTheme]);
  
  // Écouter les changements de thème via un event listener personnalisé
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      const newTheme = event.detail;
      if (newTheme) {
        applyThemeStyles(newTheme);
      }
    };

    window.addEventListener('theme-changed' as any, handleThemeChange);
    return () => window.removeEventListener('theme-changed' as any, handleThemeChange);
  }, []);

  // Fonction pour appliquer les styles de thème
  const applyThemeStyles = (theme: string) => {
    // Forcer l'application immédiate de la classe du thème
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    // Supprimer seulement les anciennes variables, pas les keyframes
    const existingVariables = document.querySelectorAll('[data-intel-theme="variables"]');
    existingVariables.forEach(el => el.remove());
    
    // Injecter les nouvelles variables CSS immédiatement
    const style = document.createElement('style');
    style.setAttribute('data-intel-theme', 'variables');
    style.textContent = getDynamicCSSVariables(theme);
    document.head.appendChild(style);
    
    // Forcer le reflow pour appliquer immédiatement les changements
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = '';
    
    // Injecter les animations keyframes une seule fois
    if (!document.querySelector('[data-intel-theme="keyframes"]')) {
      const keyframes = document.createElement('style');
      keyframes.setAttribute('data-intel-theme', 'keyframes');
      keyframes.textContent = `
        @keyframes live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes progress-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes loading-slide {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(400%); }
      }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
      `;
      document.head.appendChild(keyframes);
    }
  };

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
    role: currentUserData?.role || 'INTEL_AGENT',
    initials: currentUserData?.name ? 
      currentUserData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 
      'AI'
  };

  return (
    <div 
      style={{ 
        background: 'var(--bg-primary)', 
        minHeight: '100vh', 
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
    >
      {/* Indicateur de chargement global */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600" 
            style={{ 
              animation: 'loading-slide 1s ease-in-out infinite',
              width: '30%'
            }} 
          />
        </div>
      )}
      
      <BackgroundEffects />
      
      {/* Container avec sidebar */}
      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <CustomSidebar 
          currentUser={currentUser} 
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
                  background: 'linear-gradient(135deg, var(--accent-intel), var(--accent-warning))',
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
                <div className={`w-2 h-2 rounded-full ${
                  isHealthy ? 'bg-green-400' : 'bg-orange-400'
                } ${isHealthy ? '' : 'animate-pulse'}`} />
                <span className="text-xs text-muted-foreground">
                  {uptime}%
                </span>
              </div>
              
              <LiveIndicator />
              <ThemeToggleIntel />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main 
          className="flex-1 p-4 md:p-8 md:ml-[260px] pt-20 md:pt-8"
        >
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {backButton && (
                <button 
                  onClick={() => router.back()}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
                  style={{
                    background: 'var(--bg-glass-secondary)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 
                  className="text-3xl font-bold mb-1"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
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
                  border: '1px solid var(--border-glass-secondary)'
                }}
              >
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-intel), var(--accent-warning))'
                  }}
                >
                  {currentUser.initials}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
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
