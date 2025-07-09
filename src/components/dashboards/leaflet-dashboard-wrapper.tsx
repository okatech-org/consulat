'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ProfileLocation } from '@/actions/dashboard';

interface LeafletDashboardWrapperProps {
  data: ProfileLocation[];
  height?: string;
}

export function LeafletDashboardWrapper({
  data,
  height = '400px',
}: LeafletDashboardWrapperProps) {
  const [LeafletDashboard, setLeafletDashboard] =
    useState<React.ComponentType<LeafletDashboardWrapperProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger le composant Leaflet uniquement côté client
    const loadLeafletDashboard = async () => {
      try {
        const { LeafletDashboard: LoadedComponent } = await import('./leaflet-dashboard');
        setLeafletDashboard(() => LoadedComponent);
      } catch (error) {
        console.error('Erreur lors du chargement de Leaflet:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeafletDashboard();
  }, []);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg border"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (!LeafletDashboard) {
    return (
      <div
        className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600 font-medium">
            Erreur de chargement de la carte
          </p>
        </div>
      </div>
    );
  }

  return <LeafletDashboard data={data} height={height} />;
}
