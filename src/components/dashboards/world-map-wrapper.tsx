'use client';

import dynamic from 'next/dynamic';
import { Globe } from 'lucide-react';
import type { CityProfileData } from '@/actions/dashboard';

const WorldMapSuspense = dynamic(() => import('@/components/dashboards/world-map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
      <div className="text-center">
        <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
        <p className="text-muted-foreground">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

interface WorldMapWrapperProps {
  data: CityProfileData[];
  height?: string;
  className?: string;
}

export function WorldMapWrapper({
  data,
  height = '400px',
  className = '',
}: WorldMapWrapperProps) {
  return <WorldMapSuspense data={data} height={height} className={className} />;
}
