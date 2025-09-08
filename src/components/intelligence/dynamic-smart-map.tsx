'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Chargement dynamique de la carte pour éviter les erreurs SSR
const SmartInteractiveMap = dynamic(
  () => import('./smart-interactive-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Chargement de la carte intelligente</p>
          <p className="text-sm opacity-70 mt-2">Préparation des données géographiques...</p>
        </div>
      </div>
    ),
  }
);

export default SmartInteractiveMap;
