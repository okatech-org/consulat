'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { Loader2 } from 'lucide-react';
import type { ProfileLocation } from '@/actions/dashboard';
import { GeocodingService } from '@/lib/services/geocoding';

// Importer les styles Leaflet
import 'leaflet/dist/leaflet.css';

interface LeafletDashboardProps {
  data: ProfileLocation[];
  height?: string;
}

interface GeocodedLocation extends ProfileLocation {
  lat: number;
  lng: number;
}

// Composant pour ajuster automatiquement la vue de la carte
function MapBounds({ locations }: { locations: GeocodedLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = new LatLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations, map]);

  return null;
}

export function LeafletDashboard({ data, height = '400px' }: LeafletDashboardProps) {
  const [geocodedLocations, setGeocodedLocations] = useState<GeocodedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Géocoder les locations au montage
  useEffect(() => {
    const geocodeLocations = async () => {
      if (!data.length) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setProgress(0);

      try {
        const results = await GeocodingService.geocodeMultiple(data);

        // Convertir les résultats au format attendu
        const geocoded: GeocodedLocation[] = results.map((result) => ({
          id: result.id,
          address: result.address,
          city: result.city,
          country: result.country,
          count: result.count,
          lat: result.lat,
          lng: result.lng,
        }));

        setGeocodedLocations(geocoded);
      } catch (error) {
        console.error('Erreur lors du géocodage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    geocodeLocations();
  }, [data]);

  // Calculer les couleurs et tailles des marqueurs
  const markerConfig = useMemo(() => {
    if (!geocodedLocations.length)
      return { maxCount: 0, getColor: () => '#22c55e', getRadius: () => 8 };

    const maxCount = Math.max(...geocodedLocations.map((loc) => loc.count));

    const getColor = (count: number): string => {
      const ratio = count / maxCount;
      if (ratio >= 0.7) return '#ef4444'; // Rouge
      if (ratio >= 0.4) return '#f97316'; // Orange
      if (ratio >= 0.2) return '#eab308'; // Jaune
      return '#22c55e'; // Vert
    };

    const getRadius = (count: number): number => {
      const ratio = count / maxCount;
      return Math.max(8, Math.min(25, 8 + ratio * 17));
    };

    return { maxCount, getColor, getRadius };
  }, [geocodedLocations]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg border"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Géocodage en cours...</p>
          <p className="text-xs text-muted-foreground mt-1">
            {progress > 0 && `${progress}/${data.length} villes traitées`}
          </p>
        </div>
      </div>
    );
  }

  if (!geocodedLocations.length) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg border"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-400 mb-2">🗺️</div>
          <p className="text-sm text-muted-foreground">
            Aucune donnée géographique disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Légende */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-muted-foreground">1-2 profils</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-muted-foreground">3-5 profils</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-muted-foreground">6-10 profils</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-muted-foreground">10+ profils</span>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="font-medium text-blue-900">{geocodedLocations.length}</div>
          <div className="text-blue-600">Villes géocodées</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="font-medium text-green-900">
            {geocodedLocations.reduce((sum, item) => sum + item.count, 0)}
          </div>
          <div className="text-green-600">Profils totaux</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="font-medium text-purple-900">
            {geocodedLocations.filter((item) => item.country !== 'France').length}
          </div>
          <div className="text-purple-600">Villes internationales</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="font-medium text-orange-900">{markerConfig.maxCount}</div>
          <div className="text-orange-600">Max par ville</div>
        </div>
      </div>

      {/* Carte Leaflet */}
      <div className="rounded-lg overflow-hidden border" style={{ height }}>
        <MapContainer
          center={[46.2276, 2.2137]} // Centre de la France
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {geocodedLocations.map((location) => (
            <CircleMarker
              key={location.id}
              center={[location.lat, location.lng]}
              radius={markerConfig.getRadius(location.count)}
              fillColor={markerConfig.getColor(location.count)}
              fillOpacity={0.8}
              color="#ffffff"
              weight={2}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {location.city}, {location.country}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <strong>{location.count}</strong> profil
                    {location.count > 1 ? 's' : ''} consulaire
                    {location.count > 1 ? 's' : ''}
                  </p>
                  <p className="text-gray-500 text-sm">{location.address}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          <MapBounds locations={geocodedLocations} />
        </MapContainer>
      </div>
    </div>
  );
}
