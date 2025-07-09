'use client';

import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useEffect, useRef, useState } from 'react';
import type { ProfileLocation } from '@/actions/dashboard';
import { Loader2 } from 'lucide-react';

interface GoogleMapsProps {
  data: ProfileLocation[];
  height?: string;
}

// Cache pour le géocodage
const geocodeCache = new Map<string, google.maps.LatLng>();

// Interface pour les résultats de géocodage
interface GeocodedLocation extends ProfileLocation {
  position: google.maps.LatLng;
}

// Fonction utilitaire pour le géocodage avec cache
const geocodeWithCache = async (
  geocoder: google.maps.Geocoder,
  address: string,
  city: string,
  country: string,
): Promise<google.maps.LatLng | null> => {
  // Utiliser ville + pays comme clé de cache pour éviter les doublons
  const cacheKey = `${city}, ${country}`;

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const position = results[0].geometry.location;
        geocodeCache.set(cacheKey, position);
        resolve(position);
      } else {
        console.warn(`Géocodage échoué pour ${address}:`, status);
        resolve(null);
      }
    });
  });
};

// Composant de rendu de la carte
function MapComponent({ data, height = '400px' }: GoogleMapsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedLocations, setGeocodedLocations] = useState<GeocodedLocation[]>([]);

  // Initialiser la carte
  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new google.maps.Map(ref.current, {
        center: { lat: 46.2276, lng: 2.2137 }, // Centre de la France
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      setMap(newMap);

      // Créer l'InfoWindow
      const newInfoWindow = new google.maps.InfoWindow();
      setInfoWindow(newInfoWindow);
    }
  }, [map]);

  // Géocoder toutes les locations en parallèle
  useEffect(() => {
    if (!map || !data.length || isGeocoding) return;

    const geocodeAllLocations = async () => {
      setIsGeocoding(true);
      const geocoder = new google.maps.Geocoder();

      try {
        // Traiter toutes les locations en parallèle avec un délai entre les appels
        const geocodePromises = data.map(
          (location, index) =>
            new Promise<GeocodedLocation | null>((resolve) => {
              // Ajouter un délai progressif pour éviter la surcharge de l'API
              setTimeout(async () => {
                const position = await geocodeWithCache(
                  geocoder,
                  location.address,
                  location.city,
                  location.country,
                );

                if (position) {
                  resolve({
                    ...location,
                    position,
                  });
                } else {
                  resolve(null);
                }
              }, index * 100); // Délai de 100ms entre chaque appel
            }),
        );

        const results = await Promise.all(geocodePromises);
        const validLocations = results.filter(
          (loc): loc is GeocodedLocation => loc !== null,
        );

        setGeocodedLocations(validLocations);
      } catch (error) {
        console.error('Erreur lors du géocodage:', error);
      } finally {
        setIsGeocoding(false);
      }
    };

    geocodeAllLocations();
  }, [map, data, isGeocoding]);

  // Fonction pour obtenir la couleur selon la concentration
  const getMarkerColor = (count: number, maxCount: number): string => {
    const ratio = count / maxCount;
    if (ratio >= 0.7) return '#ef4444'; // Rouge pour forte concentration
    if (ratio >= 0.4) return '#f97316'; // Orange pour concentration moyenne
    if (ratio >= 0.2) return '#eab308'; // Jaune pour faible concentration
    return '#22c55e'; // Vert pour très faible concentration
  };

  // Créer les marqueurs à partir des locations géocodées
  useEffect(() => {
    if (!map || !geocodedLocations.length) return;

    // Nettoyer les anciens marqueurs
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);

    const bounds = new google.maps.LatLngBounds();
    const newMarkers: google.maps.Marker[] = [];
    const maxCount = Math.max(...geocodedLocations.map((item) => item.count));

    geocodedLocations.forEach((location) => {
      // Créer le marqueur avec couleur selon la concentration
      const marker = new google.maps.Marker({
        position: location.position,
        map: map,
        title: `${location.city}, ${location.country}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: getMarkerColor(location.count, maxCount),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: Math.max(8, Math.min(20, 8 + (location.count / maxCount) * 12)),
        },
      });

      // Ajouter l'événement click pour l'InfoWindow
      marker.addListener('click', () => {
        if (infoWindow) {
          infoWindow.setContent(`
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                  ${location.city}, ${location.country}
                </h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  <strong>${location.count}</strong> profil${location.count > 1 ? 's' : ''} consulaire${location.count > 1 ? 's' : ''}
                </p>
                <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 12px;">
                  ${location.address}
                </p>
              </div>
            `);
          infoWindow.open(map, marker);
        }
      });

      newMarkers.push(marker);
      bounds.extend(location.position);
    });

    setMarkers(newMarkers);

    // Ajuster la vue pour inclure tous les marqueurs
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);

      // Limiter le zoom maximum
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, geocodedLocations, markers, infoWindow]);

  return (
    <div className="relative">
      <div ref={ref} style={{ height, width: '100%' }} />
      {isGeocoding && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Géocodage en cours... ({geocodedLocations.length}/{data.length})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant de rendu du statut de chargement
function LoadingComponent() {
  return (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Chargement de Google Maps...</p>
      </div>
    </div>
  );
}

// Composant de rendu des erreurs
function ErrorComponent({ status }: { status: Status }) {
  return (
    <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
      <div className="text-center">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-sm text-red-600 font-medium">
          Erreur de chargement de Google Maps
        </p>
        <p className="text-xs text-red-500 mt-1">Statut: {status}</p>
      </div>
    </div>
  );
}

// Composant principal
export function GoogleMapsDashboard({ data, height }: GoogleMapsProps) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-96 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-center">
          <div className="text-yellow-500 mb-2">⚠️</div>
          <p className="text-sm text-yellow-600 font-medium">Clé API Google manquante</p>
          <p className="text-xs text-yellow-500 mt-1">
            Configurez NEXT_PUBLIC_GEMINI_API_KEY
          </p>
        </div>
      </div>
    );
  }

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <LoadingComponent />;
      case Status.FAILURE:
        return <ErrorComponent status={status} />;
      case Status.SUCCESS:
        return <MapComponent data={data} height={height} />;
      default:
        return <LoadingComponent />;
    }
  };

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
          <div className="font-medium text-blue-900">{data.length}</div>
          <div className="text-blue-600">Villes</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="font-medium text-green-900">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </div>
          <div className="text-green-600">Profils totaux</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="font-medium text-purple-900">
            {data.filter((item) => item.country !== 'France').length}
          </div>
          <div className="text-purple-600">Villes internationales</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="font-medium text-orange-900">
            {Math.max(...data.map((item) => item.count))}
          </div>
          <div className="text-orange-600">Max par ville</div>
        </div>
      </div>

      {/* Carte */}
      <div className="rounded-lg overflow-hidden border">
        <Wrapper apiKey={apiKey} render={render} />
      </div>
    </div>
  );
}
