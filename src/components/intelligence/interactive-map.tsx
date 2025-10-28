'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Import dynamique de Leaflet pour éviter les erreurs SSR
const L = typeof window !== 'undefined' ? require('leaflet') : null;

// Import CSS seulement côté client
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
}
import { Badge } from '@/components/ui/badge';

// Fix pour les icônes Leaflet (seulement côté client)
if (L && typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
  });
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

interface InteractiveMapProps {
  profiles: ProfileMapData[];
  onProfileClick?: (profileId: string) => void;
  className?: string;
}

export default function InteractiveMap({
  profiles,
  onProfileClick,
  className,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current || !L || typeof window === 'undefined') return;

    // Vérifier si Leaflet est disponible
    if (!L) {
      setIsLoading(false);
      return;
    }

    try {
      // Initialiser la carte avec gestion d'erreur
      const map = L.map(mapRef.current, {
        center: [0.4162, 9.4673], // Gabon
        zoom: 6,
        zoomControl: true,
        attributionControl: false,
        preferCanvas: true, // Améliore les performances
      });

      // Ajouter les tuiles de carte avec gestion d'erreur
      const tileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          attribution: '',
          errorTileUrl:
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSI+Q2hhcmdlbWVudC4uLjwvdGV4dD48L3N2Zz4=',
        },
      );

      tileLayer.addTo(map);

      // Initialiser et ajouter le groupe de marqueurs
      markersRef.current = new L.LayerGroup();
      markersRef.current.addTo(map);

      mapInstanceRef.current = map;
      setIsLoading(false);
    } catch (error) {
      console.warn("Erreur lors de l'initialisation de la carte:", error);
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
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return;

    // Nettoyer les marqueurs existants
    markersRef.current.clearLayers();

    // Ajouter les nouveaux marqueurs
    profiles.forEach((profile) => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${profile.hasNotes ? '16px' : '12px'}; 
            height: ${profile.hasNotes ? '16px' : '12px'}; 
            background: ${profile.hasNotes ? '#ef4444' : '#3b82f6'};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
          "></div>
        `,
        iconSize: [profile.hasNotes ? 20 : 16, profile.hasNotes ? 20 : 16],
        iconAnchor: [profile.hasNotes ? 10 : 8, profile.hasNotes ? 10 : 8],
      });

      const marker = L.marker([profile.latitude, profile.longitude], { icon })
        .bindPopup(
          `
          <div style="min-width: 140px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <div style="font-size: 13px; font-weight: 600; color: #1f2937; line-height: 1.2;">
                ${profile.name}
              </div>
              ${
                profile.hasNotes
                  ? `
                <span style="
                  background: rgba(239, 68, 68, 0.2); 
                  color: #ef4444; 
                  padding: 1px 4px; 
                  border-radius: 3px; 
                  font-size: 10px;
                  font-weight: 500;
                  line-height: 1;
                ">
                  • ${profile.notesCount}
                </span>
              `
                  : ''
              }
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 6px; line-height: 1.2;">
              ${profile.city || 'Ville inconnue'}, ${profile.country || 'Pays inconnu'}
            </div>
            <button 
              onclick="window.profileClick?.('${profile.id}')"
              style="
                background: #3b82f6; 
                color: white; 
                border: none; 
                padding: 4px 8px; 
                border-radius: 4px; 
                font-size: 11px;
                cursor: pointer;
                width: 100%;
                text-align: center;
              "
            >
              → Profil
            </button>
          </div>
        `,
        )
        .on('click', () => {
          onProfileClick?.(profile.id);
        });

      markersRef.current.addLayer(marker);
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (profiles.length > 0) {
      const group = new L.featureGroup(markersRef.current.getLayers());
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    // Fonction globale pour les clics depuis les popups
    (window as any).profileClick = (profileId: string) => {
      onProfileClick?.(profileId);
    };
  }, [profiles, onProfileClick, isLoading]);

  return (
    <div className={`relative ${className || ''}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span style={{ color: 'var(--text-secondary)' }}>
              Chargement de la carte...
            </span>
          </div>
        </div>
      )}

      {/* Indicateurs */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Données en temps réel
        </Badge>
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span style={{ color: 'var(--text-secondary)' }}>Profils standards</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span style={{ color: 'var(--text-secondary)' }}>Avec renseignements</span>
          </div>
        </div>
      </div>

      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.1); 
          }
        }
      `}</style>
    </div>
  );
}
