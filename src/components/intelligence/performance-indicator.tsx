'use client';

import { useDGSSRealTimeData, useDGSSSystemStatus } from '@/hooks/use-dgss-realtime-data';
import { Activity, Wifi, WifiOff } from 'lucide-react';

export function PerformanceIndicator() {
  const { data: realTimeData, isLoading } = useDGSSRealTimeData();
  const { uptime, isHealthy } = useDGSSSystemStatus();

  if (isLoading || !realTimeData) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        <span>Chargement...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      {/* Statut connexion */}
      <div className="flex items-center gap-1">
        {isHealthy ? (
          <Wifi className="h-3 w-3 text-green-400" />
        ) : (
          <WifiOff className="h-3 w-3 text-orange-400 animate-pulse" />
        )}
        <span className="text-muted-foreground">{uptime}%</span>
      </div>

      {/* Activité système */}
      <div className="flex items-center gap-1">
        <Activity className="h-3 w-3 text-blue-400" />
        <span className="text-muted-foreground">
          {realTimeData.activeAgents} agent{realTimeData.activeAgents > 1 ? 's' : ''}
        </span>
      </div>

      {/* Dernière mise à jour */}
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-muted-foreground">
          {realTimeData.lastUpdate.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  );
}
