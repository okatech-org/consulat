'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Users, 
  Eye,
  ExternalLink,
  Navigation,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLocationCoordinates } from '@/lib/services/geocoding-service';

// Import dynamique de la carte pour éviter les erreurs SSR
const SmartInteractiveMap = dynamic(
  () => import('./smart-interactive-map'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Chargement de la carte...</p>
        </div>
      </div>
    ),
  }
);

interface ProfileMapData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address?: {
    city: string;
    country: string;
  } | null;
  intelligenceNotes?: Array<{
    type: string;
    priority: string;
    createdAt: Date;
  }>;
}

interface DashboardCompactMapProps {
  profiles: ProfileMapData[];
  isLoading?: boolean;
  className?: string;
}

export default function DashboardCompactMap({
  profiles,
  isLoading = false,
  className = "",
}: DashboardCompactMapProps) {
  const router = useRouter();

  // Traitement des données pour la carte
  const mapData = useMemo(() => {
    if (!profiles) return { mapProfiles: [], stats: { total: 0, withAddress: 0, withNotes: 0, countries: 0 } };

    const profilesWithAddress = profiles.filter(profile => 
      profile.address?.city && 
      profile.address.city.trim() !== '' &&
      profile.address?.country && 
      profile.address.country.trim() !== ''
    );

    const mapProfiles = profilesWithAddress.map(profile => {
      const coordinates = getLocationCoordinates(
        profile.address!.city,
        profile.address!.country
      );

      return {
        id: profile.id,
        name: `${profile.firstName || 'Prénom'} ${profile.lastName || 'Nom'}`,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        city: profile.address!.city,
        country: profile.address!.country,
        hasNotes: profile.intelligenceNotes && profile.intelligenceNotes.length > 0,
        notesCount: profile.intelligenceNotes?.length || 0,
      };
    });

    const stats = {
      total: profiles.length,
      withAddress: profilesWithAddress.length,
      withNotes: profilesWithAddress.filter(p => p.intelligenceNotes && p.intelligenceNotes.length > 0).length,
      countries: new Set(profilesWithAddress.map(p => p.address!.country)).size,
    };

    return { mapProfiles, stats };
  }, [profiles]);

  const handleFullScreen = () => {
    router.push('/dashboard/carte');
  };

  const handleProfileClick = (profileId: string) => {
    router.push(`/dashboard/profiles/${profileId}`);
  };

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Répartition Géographique
            </CardTitle>
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-80 relative">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
          <div className="p-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`${className} overflow-hidden`}
      style={{
        background: 'var(--bg-glass-primary)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--border-glass-primary)',
        boxShadow: 'var(--shadow-glass)',
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Target className="h-5 w-5 text-blue-600" />
            Carte Intelligence
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
              {mapData.stats.withAddress} géolocalisés
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleFullScreen}
              className="h-8 w-8 p-0"
              title="Voir en plein écran"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Carte interactive pleine largeur */}
        <div className="h-full relative">
          <SmartInteractiveMap 
            profiles={mapData.mapProfiles}
            onProfileClick={handleProfileClick}
            className="w-full h-full"
          />
        </div>

        {/* Panneau d'information ultra-compact */}
        <div className="absolute bottom-3 left-3 z-[1000]">
          <div 
            className="rounded-md px-3 py-1.5"
            style={{
              background: 'rgba(30, 30, 30, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center gap-3" style={{ color: '#ffffff' }}>
              <div className="flex items-center gap-1">
                <div className="text-sm font-bold" style={{ color: '#3b82f6' }}>{mapData.stats.withAddress}</div>
                <div className="text-[10px]" style={{ color: '#b3b3b3' }}>localisés</div>
              </div>
              
              <div className="w-px h-4" style={{ background: '#666666' }} />
              
              <div className="flex items-center gap-1">
                <div className="text-sm font-bold" style={{ color: '#ef4444' }}>{mapData.stats.withNotes}</div>
                <div className="text-[10px]" style={{ color: '#b3b3b3' }}>surveillés</div>
              </div>
              
              <div className="w-px h-4" style={{ background: '#666666' }} />
              
              <div className="flex items-center gap-1">
                <div className="text-sm font-bold" style={{ color: '#10b981' }}>{mapData.stats.countries}</div>
                <div className="text-[10px]" style={{ color: '#b3b3b3' }}>pays</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bouton plein écran - séparé */}
        <div className="absolute bottom-3 right-3 z-[1000]">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFullScreen}
            className="h-7 px-2 text-[10px]"
            style={{
              background: 'rgba(30, 30, 30, 0.6)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: '#3b82f6'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(30, 30, 30, 0.6)'}
          >
            <Navigation className="h-2.5 w-2.5 mr-1" />
            Agrandir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
