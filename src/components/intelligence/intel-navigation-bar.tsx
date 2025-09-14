'use client';

import { Home, ChevronRight, Shield, Zap, Activity } from 'lucide-react';
import { useOptimizedNavigation } from '@/hooks/use-optimized-navigation';
import { useState, useEffect } from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface IntelNavigationBarProps {
  currentPage: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
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
        border: '1px solid rgba(239, 68, 68, 0.3)',
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          background: '#ef4444',
          opacity: isActive ? 1 : 0.3,
          boxShadow: isActive ? '0 0 6px #ef4444' : 'none',
          transition: 'all 0.3s ease',
        }}
      />
      LIVE
    </div>
  );
}

export function IntelNavigationBar({ currentPage, breadcrumbs = [] }: IntelNavigationBarProps) {
  const { navigateTo, handleMouseEnter } = useOptimizedNavigation();
  const [systemStatus, setSystemStatus] = useState<'online' | 'scanning' | 'alert'>('online');

  // Simulation d'activité système
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses: Array<'online' | 'scanning' | 'alert'> = ['online', 'scanning', 'online', 'alert'];
      setSystemStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style jsx>{`
        .intel-nav-bar {
          background: var(--bg-glass-primary);
          border: 1px solid var(--border-glass-primary);
          box-shadow: var(--shadow-glass);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .intel-nav-home {
          color: var(--text-muted);
        }
        .intel-nav-text-muted {
          color: var(--text-muted);
        }
        .intel-nav-breadcrumb {
          color: var(--text-secondary);
        }
        .intel-nav-current {
          color: var(--text-primary);
        }
        @keyframes status-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes breadcrumb-hover {
          0% { transform: translateY(0); }
          100% { transform: translateY(-2px); }
        }
      `}</style>
      
      <div className="sticky top-0 z-50 mb-8">
        {/* Barre de navigation Intel Premium */}
        <div className="intel-nav-bar flex items-center justify-between gap-4 text-sm p-4 rounded-2xl relative overflow-hidden group">
          
          {/* Effet de scan sur la barre */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse"></div>
          
          {/* Navigation breadcrumb améliorée */}
          <div className="flex items-center gap-3 relative z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group/home relative">
                  <Home 
                    className="intel-nav-home h-5 w-5 cursor-pointer hover:scale-110 transition-all duration-300 group-hover/home:rotate-12" 
                    onClick={() => navigateTo('/intel', { instant: true })}
                    onMouseEnter={() => handleMouseEnter('/intel')}
                  />
                  <div className="absolute -inset-2 bg-blue-500/20 rounded-lg opacity-0 group-hover/home:opacity-100 transition-opacity duration-300"></div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-blue-800 text-white">
                <p>Retour au centre d'intelligence DGSS</p>
              </TooltipContent>
            </Tooltip>
            
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={index} className="flex items-center gap-3">
                <ChevronRight className="intel-nav-text-muted h-3 w-3 animate-pulse" />
                {breadcrumb.href ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span 
                        className="intel-nav-breadcrumb cursor-pointer hover:scale-105 transition-all duration-300 font-semibold px-2 py-1 rounded-lg"
                        onClick={() => navigateTo(breadcrumb.href!, { instant: true })}
                        onMouseEnter={() => handleMouseEnter(breadcrumb.href!)}
                      >
                        {breadcrumb.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Naviguer vers {breadcrumb.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span 
                    className="intel-nav-current font-semibold truncate max-w-[200px] px-2 py-1 rounded-lg"
                    style={{ background: 'var(--bg-glass-light)' }}
                  >
                    {breadcrumb.label}
                  </span>
                )}
              </div>
            ))}
            
            {currentPage && (
              <div className="flex items-center gap-3">
                <ChevronRight className="intel-nav-text-muted h-3 w-3 animate-pulse" />
                <span 
                  className="intel-nav-current font-bold truncate max-w-[250px] px-3 py-1.5 rounded-xl"
                  style={{ 
                    background: 'var(--bg-glass-primary)', 
                    border: '1px solid var(--border-glass-primary)' 
                  }}
                >
                  {currentPage}
                </span>
              </div>
            )}
          </div>

          {/* Indicateurs de statut système avancés */}
          <div className="flex items-center gap-4 relative z-10">
            
            {/* Indicateur d'activité système */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="group/status flex items-center gap-2 px-3 py-1.5 backdrop-blur-sm rounded-full cursor-help transition-all duration-300"
                  style={{
                    background: 'var(--bg-glass-light)',
                    border: '1px solid var(--border-glass-secondary)',
                  }}
                >
                  <Activity 
                    className="h-4 w-4 group-hover/status:animate-pulse" 
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <span 
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {systemStatus === 'online' ? 'En ligne' : 
                     systemStatus === 'scanning' ? 'Analyse' : 'Alerte'}
                  </span>
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      background: systemStatus === 'online' ? '#10b981' :
                                 systemStatus === 'scanning' ? '#3b82f6' : '#ef4444',
                      animation: 'status-pulse 2s infinite'
                    }}
                  ></div>
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                style={{ 
                  background: 'var(--bg-glass-primary)', 
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-glass-primary)'
                }}
              >
                <p>Statut système DGSS: {systemStatus === 'online' ? 'Opérationnel' : systemStatus === 'scanning' ? 'Analyse en cours' : 'Alerte détectée'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mise à jour en temps réel</p>
              </TooltipContent>
            </Tooltip>

            {/* Indicateur LIVE amélioré */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <LiveIndicator />
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                style={{ 
                  background: 'var(--bg-glass-primary)', 
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-glass-primary)'
                }}
              >
                <p>Session de surveillance active</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Connexion sécurisée DGSS</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Badge Intel Premium */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="group/intel relative">
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                    style={{
                      background: 'var(--bg-glass-primary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-glass-primary)',
                    }}
                  >
                    <div className="relative">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center backdrop-blur-sm group-hover/intel:rotate-12 transition-transform duration-300"
                        style={{ background: 'var(--bg-glass-light)' }}
                      >
                        <Shield className="h-3 w-3" style={{ color: 'var(--text-primary)' }} />
                      </div>
                      <div 
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping"
                        style={{ background: 'var(--accent-intel)' }}
                      ></div>
                    </div>
                    <span className="tracking-wider">INTEL</span>
                  </div>
                  
                  {/* Effet de halo */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-0 group-hover/intel:opacity-100 transition-opacity duration-500 blur-md scale-150"
                    style={{ background: 'var(--bg-glass-light)' }}
                  ></div>
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                style={{ 
                  background: 'var(--bg-glass-primary)', 
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-glass-primary)'
                }}
              >
                <p>Agent Intel - Niveau de sécurité maximum</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Classification: Top Secret</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
}
