'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useDGSSRealTimeData } from '@/hooks/use-dgss-realtime-data';
import { AlertTriangle, Shield, Users, Activity } from 'lucide-react';

export function RealTimeAlerts() {
  const { data: realTimeData } = useDGSSRealTimeData();
  const previousData = useRef<typeof realTimeData>(null);

  useEffect(() => {
    if (!realTimeData || !previousData.current) {
      previousData.current = realTimeData;
      return;
    }

    const prev = previousData.current;
    const current = realTimeData;

    // Détecter les changements critiques et afficher des alertes
    
    // Nouvelles entités critiques
    if (current.criticalEntities > prev.criticalEntities) {
      const newCritical = current.criticalEntities - prev.criticalEntities;
      toast.error(
        `🚨 ${newCritical} nouvelle${newCritical > 1 ? 's' : ''} entité${newCritical > 1 ? 's' : ''} critique${newCritical > 1 ? 's' : ''} détectée${newCritical > 1 ? 's' : ''}`,
        {
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 8000,
          action: {
            label: 'Voir',
            onClick: () => window.open('/dashboard/entities?tab=critical', '_blank')
          }
        }
      );
    }

    // Nouvelles alertes de sécurité
    if (current.securityAlerts > prev.securityAlerts) {
      const newAlerts = current.securityAlerts - prev.securityAlerts;
      toast.warning(
        `⚠️ ${newAlerts} nouvelle${newAlerts > 1 ? 's' : ''} alerte${newAlerts > 1 ? 's' : ''} de sécurité`,
        {
          icon: <Shield className="h-4 w-4" />,
          duration: 6000,
          action: {
            label: 'Sécurité',
            onClick: () => window.open('/dashboard/securite', '_blank')
          }
        }
      );
    }

    // Changement de niveau de surveillance
    if (current.surveillanceStatus !== prev.surveillanceStatus && 
        current.surveillanceStatus !== 'normal') {
      toast.info(
        `📡 Niveau de surveillance: ${current.surveillanceStatus.toUpperCase()}`,
        {
          icon: <Activity className="h-4 w-4" />,
          duration: 5000,
        }
      );
    }

    // Pics d'activité (nouveaux profils)
    if (current.newProfilesToday > prev.newProfilesToday) {
      const newProfiles = current.newProfilesToday - prev.newProfilesToday;
      if (newProfiles >= 5) { // Seulement si c'est significatif
        toast.success(
          `📈 Pic d'activité: +${newProfiles} nouveaux profils aujourd'hui`,
          {
            icon: <Users className="h-4 w-4" />,
            duration: 4000,
            action: {
              label: 'Voir',
              onClick: () => window.open('/dashboard/profiles', '_blank')
            }
          }
        );
      }
    }

    // Système dégradé
    if (current.systemStatus !== prev.systemStatus && current.systemStatus !== 'operational') {
      toast.error(
        `🔧 Système ${current.systemStatus === 'degraded' ? 'dégradé' : current.systemStatus}`,
        {
          duration: 10000,
        }
      );
    }

    // Mise à jour de la référence
    previousData.current = current;
  }, [realTimeData]);

  // Ce composant ne rend rien visuellement, il gère juste les alertes
  return null;
}

// Hook pour utiliser les alertes dans n'importe quel composant
export function useRealTimeAlerts() {
  const { data: realTimeData } = useDGSSRealTimeData();

  const showCriticalAlert = () => {
    if (realTimeData?.criticalEntities && realTimeData.criticalEntities > 10) {
      toast.error(
        `🚨 ALERTE: ${realTimeData.criticalEntities} entités en surveillance critique`,
        {
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: Infinity, // Reste affiché jusqu'à action
          action: {
            label: 'Action requise',
            onClick: () => window.open('/dashboard/entities?tab=critical', '_blank')
          }
        }
      );
    }
  };

  const showSecurityAlert = () => {
    if (realTimeData?.securityAlerts && realTimeData.securityAlerts > 5) {
      toast.error(
        `🛡️ SÉCURITÉ: ${realTimeData.securityAlerts} alertes actives`,
        {
          icon: <Shield className="h-4 w-4" />,
          duration: Infinity,
          action: {
            label: 'Centre sécurité',
            onClick: () => window.open('/dashboard/securite', '_blank')
          }
        }
      );
    }
  };

  return {
    showCriticalAlert,
    showSecurityAlert,
    hasActiveCriticalAlerts: realTimeData?.criticalEntities && realTimeData.criticalEntities > 10,
    hasActiveSecurityAlerts: realTimeData?.securityAlerts && realTimeData.securityAlerts > 5,
  };
}
