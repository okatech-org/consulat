'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDGSSRealTimeData, useDGSSNotifications, useDGSSSystemStatus } from '@/hooks/use-dgss-realtime-data';
import { 
  Activity, 
  Users, 
  FileText, 
  Building2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Wifi,
  WifiOff,
  Shield,
  Clock
} from 'lucide-react';

export function RealTimeStatusWidget() {
  const { data: realTimeData, isLoading } = useDGSSRealTimeData();
  const { unreadCount, hasUnread } = useDGSSNotifications();
  const { status: systemStatus, uptime, isHealthy } = useDGSSSystemStatus();

  if (isLoading || !realTimeData) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="h-6 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-6 bg-muted rounded w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'elevated':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Statut Temps Réel</span>
          </div>
          <div className="flex items-center gap-2">
            {isHealthy ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-orange-500" />
            )}
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {realTimeData.lastUpdate.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Métriques principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Profils</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">
                  {realTimeData.totalProfiles.toLocaleString()}
                </span>
                {getTrendIcon(realTimeData.profilesTrend)}
              </div>
            </div>
            {realTimeData.newProfilesToday > 0 && (
              <div className="text-xs text-muted-foreground">
                +{realTimeData.newProfilesToday} aujourd'hui
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Entités</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">{realTimeData.totalEntities}</span>
                {getTrendIcon(realTimeData.entitiesTrend)}
              </div>
            </div>
            {realTimeData.criticalEntities > 0 && (
              <div className="text-xs text-red-400 font-medium">
                {realTimeData.criticalEntities} critique{realTimeData.criticalEntities > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Notes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">{realTimeData.totalNotes}</span>
                {getTrendIcon(realTimeData.notesTrend)}
              </div>
            </div>
            {realTimeData.newNotesToday > 0 && (
              <div className="text-xs text-muted-foreground">
                +{realTimeData.newNotesToday} aujourd'hui
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Compétences</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">{realTimeData.totalSkills}</span>
              </div>
            </div>
            {realTimeData.jobSeekers > 0 && (
              <div className="text-xs text-blue-400">
                {realTimeData.jobSeekers} en recherche d'emploi
              </div>
            )}
          </div>
        </div>

        {/* Statut de surveillance */}
        {realTimeData.surveillanceStatus !== 'normal' && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Niveau de surveillance</span>
              <Badge className={`${getStatusColor(realTimeData.surveillanceStatus)} border`}>
                {realTimeData.surveillanceStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}

        {/* Alertes de sécurité */}
        {realTimeData.securityAlerts > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                <span className="text-sm font-medium">Alertes sécurité</span>
              </div>
              <Badge variant="destructive" className="animate-pulse">
                {realTimeData.securityAlerts}
              </Badge>
            </div>
          </div>
        )}

        {/* Notifications */}
        {hasUnread && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Notifications non lues</span>
              <Badge variant="secondary">
                {unreadCount}
              </Badge>
            </div>
          </div>
        )}

        {/* Statut système */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Disponibilité système</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isHealthy ? 'bg-green-400' : 'bg-orange-400'
              } ${isHealthy ? '' : 'animate-pulse'}`} />
              <span className="text-sm font-bold">{uptime}%</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Indicateur de mise à jour */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>
    </Card>
  );
}
