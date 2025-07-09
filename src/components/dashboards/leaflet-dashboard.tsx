'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { Loader2, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
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

// Composant pour forcer le redimensionnement de la carte
function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export function LeafletDashboard({ data, height = '600px' }: LeafletDashboardProps) {
  const t = useTranslations('admin.dashboard.map');
  const [geocodedLocations, setGeocodedLocations] = useState<GeocodedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Gérer les changements d'état du plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fonction pour basculer le mode plein écran
  const toggleFullscreen = async () => {
    if (!mapContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await mapContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Erreur lors du basculement en plein écran:', error);
    }
  };

  // Vérifier si l'API Fullscreen est supportée
  const isFullscreenSupported = 'requestFullscreen' in document.documentElement;

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

  // Calculer les couleurs et tailles des marqueurs + centre de la carte
  const markerConfig = useMemo(() => {
    if (!geocodedLocations.length)
      return {
        maxCount: 0,
        getColor: () => '#22c55e',
        getRadius: () => 8,
        center: [46.2276, 2.2137] as [number, number], // Centre de la France par défaut
      };

    const maxCount = Math.max(...geocodedLocations.map((loc) => loc.count));

    // Trouver la ville avec le plus grand nombre de profils
    const largestCity = geocodedLocations.reduce((prev, current) =>
      prev.count > current.count ? prev : current,
    );

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

    return {
      maxCount,
      getColor,
      getRadius,
      center: [largestCity.lat, largestCity.lng] as [number, number],
    };
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Carte - 2/3 de l'espace */}
      <div className="lg:col-span-2">
        <div
          ref={mapContainerRef}
          className={`rounded-lg overflow-hidden border relative bg-white ${
            isFullscreen ? 'fixed inset-0 z-50' : 'aspect-square'
          }`}
          style={{ height: isFullscreen ? '100vh' : undefined }}
        >
          {/* Bouton plein écran */}
          {isFullscreenSupported && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-3 right-3 z-[1000] bg-white hover:bg-gray-50 border-gray-300 shadow-lg"
              onClick={toggleFullscreen}
              title={isFullscreen ? t('fullscreen.exit') : t('fullscreen.enter')}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          )}

          <MapContainer
            center={markerConfig.center}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
            whenReady={() => {
              // Forcer le redimensionnement après le chargement
              setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
              }, 100);
            }}
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
            <MapResizer />
          </MapContainer>
        </div>
      </div>

      {/* Statistiques et légende - 1/3 de l'espace */}
      <div className="lg:col-span-1 space-y-4">
        {/* Légende - En ligne */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Légende</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">1-2 profils</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">3-5 profils</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">6-10 profils</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">10+ profils</span>
            </div>
          </div>
        </div>

        {/* Statistiques - En 2 colonnes */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Statistiques</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-blue-900">
                {geocodedLocations.length}
              </div>
              <div className="text-xs text-blue-700">Villes géocodées</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-green-900">
                {geocodedLocations.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <div className="text-xs text-green-700">Profils totaux</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-purple-900">
                {geocodedLocations.filter((item) => item.country !== 'France').length}
              </div>
              <div className="text-xs text-purple-700">Villes internationales</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-orange-900">
                {markerConfig.maxCount}
              </div>
              <div className="text-xs text-orange-700">Max par ville</div>
            </div>
          </div>
        </div>

        {/* Top 5 des villes - En 2 colonnes */}
        <div className="bg-white rounded-lg border p-3">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Top 5 des villes</h3>
          <div className="grid grid-cols-2 gap-2">
            {geocodedLocations
              .sort((a, b) => b.count - a.count)
              .slice(0, 6)
              .map((location, index) => (
                <div
                  key={location.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {location.city}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {location.country}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 flex-shrink-0">
                    {location.count}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
