'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Users, 
  Eye,
  ExternalLink,
  Globe,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLocationCoordinates } from '@/lib/services/geocoding-service';

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

interface CountryData {
  country: string;
  count: number;
  withNotes: number;
  percentage: number;
  coordinates: [number, number];
}

interface MiniMapWidgetProps {
  profiles: ProfileMapData[];
  isLoading?: boolean;
  className?: string;
}

export default function MiniMapWidget({
  profiles,
  isLoading = false,
  className = "",
}: MiniMapWidgetProps) {
  const router = useRouter();

  // Analyse des données par pays
  const countryStats = useMemo(() => {
    if (!profiles) return { countries: [], total: 0, withAddress: 0, withNotes: 0 };

    const profilesWithAddress = profiles.filter(profile => 
      profile.address?.city && 
      profile.address.city.trim() !== '' &&
      profile.address?.country && 
      profile.address.country.trim() !== ''
    );

    const countryMap = new Map<string, { count: number; withNotes: number; coordinates: [number, number] }>();

    profilesWithAddress.forEach(profile => {
      const country = profile.address!.country;
      const hasNotes = profile.intelligenceNotes && profile.intelligenceNotes.length > 0;
      
      const current = countryMap.get(country) || { count: 0, withNotes: 0, coordinates: [0, 0] };
      current.count++;
      if (hasNotes) current.withNotes++;
      
      // Utiliser les coordonnées du service de géolocalisation
      const coords = getLocationCoordinates(profile.address!.city, country);
      current.coordinates = [coords.latitude, coords.longitude];
      
      countryMap.set(country, current);
    });

    const countries: CountryData[] = Array.from(countryMap.entries())
      .map(([country, data]) => ({
        country,
        count: data.count,
        withNotes: data.withNotes,
        percentage: (data.count / profilesWithAddress.length) * 100,
        coordinates: data.coordinates,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4); // Top 4 pays

    return {
      countries,
      total: profiles.length,
      withAddress: profilesWithAddress.length,
      withNotes: profilesWithAddress.filter(p => p.intelligenceNotes && p.intelligenceNotes.length > 0).length,
    };
  }, [profiles]);

  const handleViewFullMap = () => {
    router.push('/dashboard/carte');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-200 animate-pulse" />
                <div className="w-20 h-4 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="w-12 h-4 rounded bg-gray-200 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-2 rounded">
                  <div className="w-16 h-3 rounded bg-gray-200 animate-pulse" />
                  <div className="w-8 h-3 rounded bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`${className}`}
      style={{
        background: 'var(--bg-glass-secondary)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid var(--border-glass-secondary)',
        boxShadow: 'var(--shadow-glass)',
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Globe className="h-4 w-4 text-blue-600" />
            Distribution Mondiale
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleViewFullMap}
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {/* Statistiques globales */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="space-y-1">
            <div className="text-lg font-bold text-blue-600">
              {countryStats.withAddress}
            </div>
            <div className="text-xs text-muted-foreground">Géolocalisés</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-lg font-bold text-red-600">
              {countryStats.withNotes}
            </div>
            <div className="text-xs text-muted-foreground">Surveillés</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-lg font-bold text-green-600">
              {countryStats.countries.length}
            </div>
            <div className="text-xs text-muted-foreground">Pays</div>
          </div>
        </div>

        {/* Top pays */}
        <div className="space-y-2">
          <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            <Target className="h-3 w-3 inline mr-1" />
            Zones Principales
          </div>
          
          {countryStats.countries.map((country, index) => (
            <div 
              key={country.country}
              className="flex items-center justify-between p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              onClick={handleViewFullMap}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#f59e0b' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {country.country}
                </span>
                {country.withNotes > 0 && (
                  <Badge className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0">
                    <Eye className="h-2 w-2 mr-1" />
                    {country.withNotes}
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {country.count}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {country.percentage.toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewFullMap}
          className="w-full mt-3 text-xs bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
        >
          <MapPin className="h-3 w-3 mr-1" />
          Carte Complète ({countryStats.withAddress} profils)
        </Button>
      </CardContent>
    </Card>
  );
}
