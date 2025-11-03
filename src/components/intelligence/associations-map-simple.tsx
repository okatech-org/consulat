'use client';

import { useEffect, useRef, useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

interface AssociationData {
  id: string;
  name: string;
  category: string;
  city: string;
  riskLevel: 'faible' | 'moyen' | 'eleve' | 'critique';
  memberCount?: number;
  zone: string;
  status: 'actif' | 'passif' | 'archive';
  activities?: string[];
  influence?: 'local' | 'regional' | 'national' | 'international';
}

interface AssociationsMapSimpleProps {
  associations: AssociationData[];
  onAssociationClick?: (associationId: string) => void;
  className?: string;
  showClusters?: boolean;
}

export default function AssociationsMapSimple({
  associations,
  onAssociationClick,
  className = '',
  showClusters = true,
}: AssociationsMapSimpleProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const getLocationCoordinates = useAction(
    api.functions.geocoding.getLocationCoordinates,
  );

  useEffect(() => {
    // Fonction pour initialiser la carte
    const initializeMap = async () => {
      try {
        // Vérifier qu'on est côté client
        if (typeof window === 'undefined' || !mapRef.current) {
          return;
        }

        // Nettoyer l'ancienne carte si elle existe
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.off();
            mapInstanceRef.current.remove();
          } catch (e) {
            console.warn('Erreur lors du nettoyage de la carte:', e);
          }
          mapInstanceRef.current = null;
        }

        // Vider le conteneur DOM
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }

        // Vérifier qu'il n'y a pas déjà une carte sur cet élément
        if ((mapRef.current as any)._leaflet_id) {
          console.warn('Une carte existe déjà sur cet élément');
          return;
        }

        // Créer la carte
        const map = L.map(mapRef.current, {
          center: [46.603354, 1.888334], // Centre de la France
          zoom: 6,
          zoomControl: true,
          attributionControl: false,
        });

        // Ajouter le fond de carte
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors, © CARTO',
        }).addTo(map);

        // Créer la couche de marqueurs
        if (showClusters && (L as any).markerClusterGroup) {
          markersLayerRef.current = (L as any).markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            maxClusterRadius: 50,
          });
        } else {
          markersLayerRef.current = L.layerGroup();
        }

        markersLayerRef.current.addTo(map);
        mapInstanceRef.current = map;

        // Obtenir les coordonnées pour toutes les associations
        const coordinatesPromises = associations.map(async (association) => {
          try {
            const coords = await getLocationCoordinates({
              city: association.city,
              country: 'France',
            });
            return { association, coords };
          } catch (error) {
            console.error(`Error geocoding ${association.city}:`, error);
            return {
              association,
              coords: { latitude: 46.603354, longitude: 1.888334 },
            };
          }
        });

        const associationsWithCoords = await Promise.all(coordinatesPromises);

        // Ajouter les marqueurs
        associationsWithCoords.forEach(({ association, coords }) => {
          // Définir la couleur selon le niveau de risque
          const color =
            association.riskLevel === 'critique'
              ? '#ef4444'
              : association.riskLevel === 'eleve'
                ? '#f97316'
                : association.riskLevel === 'moyen'
                  ? '#eab308'
                  : '#22c55e';

          // Créer un marqueur simple avec icône par défaut colorée
          const icon = L.divIcon({
            html: `
              <div style="
                background: ${color};
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>
            `,
            className: 'custom-div-icon',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, -8],
          });

          const marker = L.marker([coords.latitude, coords.longitude], { icon })
            .bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
                  ${association.name}
                </h3>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">
                  <strong>Catégorie:</strong> ${association.category}
                </p>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">
                  <strong>Ville:</strong> ${association.city}
                </p>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">
                  <strong>Zone:</strong> ${association.zone}
                </p>
                <p style="margin: 4px 0; font-size: 12px;">
                  <strong>Risque:</strong> 
                  <span style="
                    background: ${color}20;
                    color: ${color};
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 11px;
                  ">${association.riskLevel.toUpperCase()}</span>
                </p>
                ${
                  association.memberCount
                    ? `
                  <p style="margin: 4px 0; font-size: 12px; color: #666;">
                    <strong>Membres:</strong> ${association.memberCount}
                  </p>
                `
                    : ''
                }
              </div>
            `);

          if (onAssociationClick) {
            marker.on('click', () => {
              onAssociationClick(association.id);
            });
          }

          markersLayerRef.current.addLayer(marker);
        });

        // Ajuster la vue pour inclure tous les marqueurs
        if (associations.length > 0) {
          const bounds = markersLayerRef.current.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }

        setIsLoading(false);
        setMapError(null);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la carte:", error);
        setMapError('Erreur lors du chargement de la carte');
        setIsLoading(false);
      }
    };

    // Lancer l'initialisation avec un petit délai pour s'assurer que le DOM est prêt
    const timeoutId = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timeoutId);

      // Nettoyer les marqueurs
      if (markersLayerRef.current) {
        try {
          markersLayerRef.current.clearLayers();
        } catch (e) {
          console.warn('Erreur lors du nettoyage des marqueurs:', e);
        }
      }

      // Nettoyer la carte
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Erreur lors du nettoyage de la carte:', e);
        }
        mapInstanceRef.current = null;
      }

      // Vider le conteneur DOM
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, [associations, onAssociationClick, showClusters]);

  if (mapError) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
      >
        <div className="text-center">
          <p className="text-red-500 mb-2">⚠️ {mapError}</p>
          <p className="text-sm text-gray-600">Veuillez rafraîchir la page</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-[1000]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-600">Chargement de la carte...</p>
          </div>
        </div>
      )}

      {/* Légende simplifiée */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="p-3 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700">Niveau de risque</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs">
                  Critique (
                  {associations.filter((a) => a.riskLevel === 'critique').length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-xs">
                  Élevé ({associations.filter((a) => a.riskLevel === 'eleve').length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs">
                  Moyen ({associations.filter((a) => a.riskLevel === 'moyen').length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs">
                  Faible ({associations.filter((a) => a.riskLevel === 'faible').length})
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Compteur total */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Badge className="bg-blue-600 text-white px-3 py-1">
          {associations.length} associations
        </Badge>
      </div>
    </div>
  );
}
