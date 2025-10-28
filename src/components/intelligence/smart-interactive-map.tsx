'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Users,
  Eye,
  Filter,
  Target,
  Layers,
  Navigation,
  Home,
} from 'lucide-react';

// Import dynamique de Leaflet pour éviter les erreurs SSR
let L: any = null;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
  require('leaflet.markercluster/dist/MarkerCluster.css');
  require('leaflet.markercluster/dist/MarkerCluster.Default.css');
  require('leaflet.markercluster');
}

interface ProfileMapData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  hasNotes: boolean;
  notesCount: number;
}

interface CountryStats {
  country: string;
  count: number;
  withNotes: number;
  center: [number, number];
  zoom: number;
}

interface SmartInteractiveMapProps {
  profiles: ProfileMapData[];
  onProfileClick?: (profileId: string) => void;
  className?: string;
}

export default function SmartInteractiveMap({
  profiles,
  onProfileClick,
  className,
}: SmartInteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'global' | 'country'>('global');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [clusteringEnabled, setClusteringEnabled] = useState(true);

  // Calcul des statistiques par pays
  const countryStats = useMemo((): CountryStats[] => {
    const statsMap = new Map<
      string,
      { count: number; withNotes: number; coordinates: [number, number][] }
    >();

    profiles.forEach((profile) => {
      if (!profile.country) return;

      const current = statsMap.get(profile.country) || {
        count: 0,
        withNotes: 0,
        coordinates: [],
      };

      current.count++;
      if (profile.hasNotes) current.withNotes++;
      current.coordinates.push([profile.latitude, profile.longitude]);

      statsMap.set(profile.country, current);
    });

    return Array.from(statsMap.entries())
      .map(([country, data]) => {
        // Calculer le centre géographique du pays
        const avgLat =
          data.coordinates.reduce((sum, coord) => sum + coord[0], 0) /
          data.coordinates.length;
        const avgLng =
          data.coordinates.reduce((sum, coord) => sum + coord[1], 0) /
          data.coordinates.length;

        // Déterminer le niveau de zoom basé sur la dispersion
        const latRange =
          Math.max(...data.coordinates.map((c) => c[0])) -
          Math.min(...data.coordinates.map((c) => c[0]));
        const lngRange =
          Math.max(...data.coordinates.map((c) => c[1])) -
          Math.min(...data.coordinates.map((c) => c[1]));
        const maxRange = Math.max(latRange, lngRange);

        let zoom = 8;
        if (maxRange > 10) zoom = 5;
        else if (maxRange > 5) zoom = 6;
        else if (maxRange > 2) zoom = 7;
        else if (maxRange > 0.5) zoom = 9;
        else zoom = 10;

        return {
          country,
          count: data.count,
          withNotes: data.withNotes,
          center: [avgLat, avgLng] as [number, number],
          zoom,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [profiles]);

  // Pays principal (celui avec le plus de profils)
  const primaryCountry = countryStats[0];

  // Initialisation de la carte
  useEffect(() => {
    if (!mapRef.current || !L || mapInstanceRef.current) return;

    try {
      // Déterminer la vue initiale
      let initialCenter: [number, number] = [0.4162, 9.4673]; // Gabon par défaut
      let initialZoom = 6;

      if (primaryCountry) {
        initialCenter = primaryCountry.center;
        initialZoom = primaryCountry.zoom;
      }

      // Initialiser la carte
      const map = L.map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false, // On va créer nos propres contrôles
        attributionControl: false,
        preferCanvas: true,
        maxZoom: 18,
        minZoom: 2,
        worldCopyJump: true,
      });

      // Couche de tuiles avec fallback hors ligne
      const tileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '',
          subdomains: 'abc',
          errorTileUrl:
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzJkM2E0ZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk0YTNiOCI+Q2FydGUgaG9ycyBsaWduZTwvdGV4dD48L3N2Zz4=',
        },
      );

      tileLayer.addTo(map);

      // Initialiser le groupe de clustering
      if (L.markerClusterGroup) {
        markersRef.current = L.markerClusterGroup({
          chunkedLoading: true,
          chunkProgress: (processed: number, total: number) => {
            // Optionnel: Afficher le progrès de chargement
          },
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';

            return L.divIcon({
              html: `<div class="cluster-marker cluster-${size}">
                <span class="cluster-count">${count}</span>
              </div>`,
              className: 'custom-cluster-icon',
              iconSize: L.point(40, 40),
            });
          },
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: 50,
        });
      } else {
        markersRef.current = L.layerGroup();
      }

      markersRef.current.addTo(map);
      mapInstanceRef.current = map;
      setIsLoading(false);

      // Animations fluides
      map.on('zoomstart', () => {
        if (mapRef.current) {
          mapRef.current.style.cursor = 'wait';
        }
      });

      map.on('zoomend', () => {
        if (mapRef.current) {
          mapRef.current.style.cursor = '';
        }
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la carte:", error);
      setIsLoading(false);
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (error) {
        console.warn('Erreur lors de la suppression de la carte:', error);
      }
    };
  }, [primaryCountry]);

  // Mise à jour des marqueurs
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || isLoading) return;

    // Nettoyer les marqueurs existants
    markersRef.current.clearLayers();

    // Créer les marqueurs avec des styles améliorés
    profiles.forEach((profile) => {
      const markerColor = profile.hasNotes ? '#ef4444' : '#3b82f6';
      const markerSize = profile.hasNotes ? 12 : 10;
      const pulseClass = profile.hasNotes ? 'marker-pulse-red' : 'marker-pulse-blue';

      const icon = L.divIcon({
        className: 'custom-smart-marker',
        html: `
          <div class="smart-marker ${pulseClass}" style="
            width: ${markerSize}px; 
            height: ${markerSize}px; 
            background: ${markerColor};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            position: relative;
          ">
            ${
              profile.hasNotes
                ? `
              <div style="
                position: absolute;
                top: -8px;
                right: -8px;
                width: 16px;
                height: 16px;
                background: #fbbf24;
                border: 1px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                font-weight: bold;
                color: white;
              ">${profile.notesCount}</div>
            `
                : ''
            }
          </div>
        `,
        iconSize: [markerSize + 4, markerSize + 4],
        iconAnchor: [(markerSize + 4) / 2, (markerSize + 4) / 2],
      });

      const marker = L.marker([profile.latitude, profile.longitude], { icon })
        .bindPopup(
          `
          <div class="smart-popup-compact">
            <div class="popup-header-compact">
              <div class="popup-title-compact">${profile.name}</div>
              ${
                profile.hasNotes
                  ? `
                <span class="popup-badge-compact">• ${profile.notesCount}</span>
              `
                  : ''
              }
            </div>
            <div class="popup-location-compact">
              ${profile.city || 'Ville inconnue'}, ${profile.country || 'Pays inconnu'}
            </div>
            <button 
              onclick="window.smartMapProfileClick?.('${profile.id}')"
              class="popup-button-compact"
            >
              → Profil
            </button>
          </div>
        `,
          {
            maxWidth: 200,
            className: 'smart-popup-container-compact',
          },
        )
        .on('click', () => {
          onProfileClick?.(profile.id);
        });

      markersRef.current.addLayer(marker);
    });

    // Fonction globale pour les clics depuis les popups
    (window as any).smartMapProfileClick = (profileId: string) => {
      onProfileClick?.(profileId);
    };
  }, [profiles, onProfileClick, isLoading]);

  // Fonctions de contrôle de la carte
  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const resetView = () => {
    if (mapInstanceRef.current && primaryCountry) {
      mapInstanceRef.current.setView(primaryCountry.center, primaryCountry.zoom);
      setCurrentView('global');
    }
  };

  const focusOnCountry = (country: CountryStats) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(country.center, country.zoom);
      setSelectedCountry(country.country);
      setCurrentView('country');
    }
  };

  const fitAllProfiles = () => {
    if (mapInstanceRef.current && profiles.length > 0) {
      const group = L.featureGroup(markersRef.current.getLayers());
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      setCurrentView('global');
    }
  };

  if (typeof window === 'undefined' || !L) {
    return (
      <div
        className={`flex items-center justify-center bg-background rounded-lg ${className}`}
      >
        <div className="text-center p-8">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Initialisation de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      {/* États de chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-[1000]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Chargement des {profiles.length.toLocaleString()} profils...
            </p>
          </div>
        </div>
      )}

      {/* Panneau de statistiques pays - Compact */}
      <Card
        className="absolute top-4 left-4 z-[1000] w-64 max-h-80 overflow-y-auto text-white shadow-xl"
        style={{
          background: 'rgba(30, 30, 30, 0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: '#ffffff' }}
          >
            <Target className="h-3 w-3" style={{ color: '#3b82f6' }} />
            Focus Intelligent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pb-3 px-3">
          <div className="text-[10px] mb-1.5" style={{ color: '#b3b3b3' }}>
            {profiles.length.toLocaleString()} profils • {countryStats.length} pays
          </div>

          {countryStats.slice(0, 4).map((country, index) => (
            <button
              key={country.country}
              onClick={() => focusOnCountry(country)}
              className="w-full text-left p-1.5 rounded-md transition-all"
              style={{
                background:
                  selectedCountry === country.country
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                border:
                  selectedCountry === country.country
                    ? '1px solid #3b82f6'
                    : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (selectedCountry !== country.country) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCountry !== country.country) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div
                    className="font-medium text-xs truncate"
                    style={{ color: '#ffffff' }}
                  >
                    {country.country}
                  </div>
                  <div className="text-[10px]" style={{ color: '#b3b3b3' }}>
                    {country.count} profils
                    {country.withNotes > 0 && (
                      <span className="ml-1" style={{ color: '#ef4444' }}>
                        • {country.withNotes}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant={index === 0 ? 'default' : 'secondary'}
                  className="text-[10px] px-1 py-0 ml-2"
                >
                  #{index + 1}
                </Badge>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Contrôles de la carte - Compact */}
      <div className="absolute top-4 right-4 z-[1000] space-y-1">
        {/* Indicateurs de statut - Compact */}
        <div className="space-y-0.5">
          <div
            className="text-[10px] px-2 py-0.5 rounded"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse inline-block"
              style={{ background: '#10b981' }}
            />
            LIVE
          </div>
          {clusteringEnabled && (
            <div
              className="block text-[10px] px-2 py-0.5 rounded"
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <Layers className="w-2.5 h-2.5 mr-1 inline" />
              Clusters
            </div>
          )}
        </div>

        {/* Boutons de contrôle - Compact */}
        <div
          className="rounded-lg p-1.5 space-y-0.5"
          style={{
            background: 'rgba(30, 30, 30, 0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            className="w-full justify-start h-7 px-2 text-xs"
            style={{ color: '#ffffff' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ZoomIn className="h-3 w-3 mr-1.5" />+
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="w-full justify-start h-7 px-2 text-xs"
            style={{ color: '#ffffff' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ZoomOut className="h-3 w-3 mr-1.5" />-
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetView}
            className="w-full justify-start h-7 px-2 text-xs"
            style={{ color: '#ffffff' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Home className="h-3 w-3 mr-1.5" />
            Centre
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={fitAllProfiles}
            className="w-full justify-start h-7 px-2 text-xs"
            style={{ color: '#ffffff' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Navigation className="h-3 w-3 mr-1.5" />
            Tout
          </Button>
        </div>
      </div>

      {/* Légende - Compact */}
      <div
        className="absolute bottom-4 left-4 z-[1000] rounded-lg p-2.5 text-white"
        style={{
          background: 'rgba(30, 30, 30, 0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px]">
            <div
              className="w-2.5 h-2.5 rounded-full border border-white"
              style={{ background: '#3b82f6' }}
            />
            <span>Standards ({profiles.filter((p) => !p.hasNotes).length})</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="relative">
              <div
                className="w-2.5 h-2.5 rounded-full border border-white"
                style={{ background: '#ef4444' }}
              />
              <div
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white"
                style={{ background: '#f59e0b' }}
              />
            </div>
            <span>Surveillés ({profiles.filter((p) => p.hasNotes).length})</span>
          </div>
        </div>
      </div>

      {/* Carte */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '500px' }}
      />

      {/* Styles CSS personnalisés */}
      <style>{`
        .custom-smart-marker {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .smart-marker {
          transition: all 0.3s ease;
        }
        
        .marker-pulse-red {
          animation: pulseRed 2s infinite;
        }
        
        .marker-pulse-blue {
          animation: pulseBlue 2s infinite;
        }
        
        @keyframes pulseRed {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 3px 10px rgba(239, 68, 68, 0.4);
          }
          50% { 
            transform: scale(1.2);
            box-shadow: 0 3px 20px rgba(239, 68, 68, 0.8);
          }
        }
        
        @keyframes pulseBlue {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 3px 10px rgba(59, 130, 246, 0.4);
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 3px 15px rgba(59, 130, 246, 0.6);
          }
        }
        
        .cluster-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
          color: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        .cluster-small {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          width: 30px;
          height: 30px;
        }
        
        .cluster-medium {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          width: 40px;
          height: 40px;
        }
        
        .cluster-large {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          width: 50px;
          height: 50px;
        }
        
        .cluster-count {
          font-size: 12px;
          font-weight: bold;
        }
        
        .smart-popup-compact {
          font-family: system-ui, -apple-system, sans-serif;
          padding: 0;
          min-width: 140px;
        }
        
        .popup-header-compact {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        
        .popup-title-compact {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.2;
          margin: 0;
        }
        
        .popup-badge-compact {
          background: #fef2f2;
          color: #dc2626;
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 500;
          line-height: 1;
        }
        
        .popup-location-compact {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 8px;
          line-height: 1.2;
        }
        
        .popup-button-compact {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
          text-align: center;
        }
        
        .popup-button-compact:hover {
          background: #2563eb;
        }
        
        .smart-popup-container-compact .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 8px !important;
        }
        
        .smart-popup-container-compact .leaflet-popup-content {
          margin: 0 !important;
          line-height: 1.2 !important;
        }
        
        .smart-popup-container-compact .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
}
