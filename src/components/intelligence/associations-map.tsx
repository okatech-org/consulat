'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MapPin, 
  Users, 
  AlertTriangle,
  Info,
  Building2,
  Activity,
  Shield,
  Globe,
  Eye,
  TrendingUp
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

interface AssociationMapData {
  id: string;
  name: string;
  category: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  riskLevel: 'faible' | 'moyen' | 'eleve' | 'critique';
  memberCount?: number;
  zone: string;
  status: 'actif' | 'passif' | 'archive';
  activities?: string[];
  influence?: 'local' | 'regional' | 'national' | 'international';
}

interface AssociationsMapProps {
  associations: AssociationMapData[];
  onAssociationClick?: (associationId: string) => void;
  className?: string;
  showClusters?: boolean;
  showHeatmap?: boolean;
}

export default function AssociationsMap({ 
  associations, 
  onAssociationClick, 
  className = '',
  showClusters = true,
  showHeatmap = false
}: AssociationsMapProps) {
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const heatmapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Statistiques par zone
  const zoneStats = useMemo(() => {
    const stats: Record<string, { total: number; critique: number; eleve: number }> = {};
    
    associations.forEach(asso => {
      if (!stats[asso.zone]) {
        stats[asso.zone] = { total: 0, critique: 0, eleve: 0 };
      }
      stats[asso.zone].total++;
      if (asso.riskLevel === 'critique') stats[asso.zone].critique++;
      if (asso.riskLevel === 'eleve') stats[asso.zone].eleve++;
    });
    
    return stats;
  }, [associations]);

  // Initialisation de la carte
  useEffect(() => {
    if (!mapRef.current || !L || typeof window === 'undefined') return;

    // Nettoyer l'ancienne carte si elle existe
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Créer la nouvelle carte centrée sur la France
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([46.603354, 1.888334], 6); // Centre de la France

    // Ajouter le fond de carte avec style sombre
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors, © CARTO'
    }).addTo(map);

    // Contrôles de zoom personnalisés
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Créer le groupe de marqueurs avec clustering
    if (showClusters) {
      markersRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        iconCreateFunction: function(cluster: any) {
          const childCount = cluster.getChildCount();
          let c = ' marker-cluster-';
          if (childCount < 10) {
            c += 'small';
          } else if (childCount < 50) {
            c += 'medium';
          } else {
            c += 'large';
          }
          
          // Calculer le niveau de risque moyen du cluster
          const markers = cluster.getAllChildMarkers();
          let totalRisk = 0;
          let criticalCount = 0;
          
          markers.forEach((marker: any) => {
            const asso = marker.options.associationData;
            if (asso.riskLevel === 'critique') criticalCount++;
            totalRisk += asso.riskLevel === 'critique' ? 4 : 
                        asso.riskLevel === 'eleve' ? 3 : 
                        asso.riskLevel === 'moyen' ? 2 : 1;
          });
          
          const avgRisk = totalRisk / markers.length;
          const color = criticalCount > 0 ? '#ef4444' :
                       avgRisk >= 3 ? '#f97316' :
                       avgRisk >= 2 ? '#eab308' : '#3b82f6';
          
          return L.divIcon({
            html: `
              <div style="
                background: ${color};
                color: white;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">
                ${childCount}
              </div>
            `,
            className: 'custom-cluster-icon',
            iconSize: L.point(40, 40),
            iconAnchor: [20, 20]
          });
        }
      });
    } else {
      markersRef.current = L.layerGroup();
    }

    markersRef.current.addTo(map);
    mapInstanceRef.current = map;
    setIsLoading(false);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [showClusters]);

  // Mise à jour des marqueurs
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || isLoading) return;

    // Nettoyer les anciens marqueurs
    markersRef.current.clearLayers();

    // Créer les marqueurs pour chaque association
    associations.forEach((association) => {
      // Définir la couleur selon le niveau de risque
      const markerColor = association.riskLevel === 'critique' ? '#ef4444' :
                         association.riskLevel === 'eleve' ? '#f97316' :
                         association.riskLevel === 'moyen' ? '#eab308' : '#22c55e';
      
      // Définir la taille selon l'influence
      const markerSize = association.influence === 'international' ? 16 :
                        association.influence === 'national' ? 14 :
                        association.influence === 'regional' ? 12 : 10;

      // Créer l'icône personnalisée
      const icon = L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              background: ${markerColor};
              width: ${markerSize + 4}px;
              height: ${markerSize + 4}px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: ${markerSize - 4}px;
                height: ${markerSize - 4}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
              "></div>
            </div>
            ${association.status === 'actif' ? `
              <div style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 6px;
                height: 6px;
                background: #10b981;
                border-radius: 50%;
                border: 1px solid white;
                animation: pulse 2s infinite;
              "></div>
            ` : ''}
          </div>
        `,
        className: 'custom-marker',
        iconSize: L.point(markerSize + 4, markerSize + 4),
        iconAnchor: [(markerSize + 4) / 2, (markerSize + 4) / 2],
      });

      // Créer le contenu du popup
      const popupContent = `
        <div style="
          min-width: 280px;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 8px;
        ">
          <div style="
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 8px;
          ">
            <h3 style="
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
              margin: 0 0 4px 0;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <span style="
                display: inline-block;
                width: 8px;
                height: 8px;
                background: ${markerColor};
                border-radius: 50%;
              "></span>
              ${association.name}
            </h3>
            <div style="
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
              margin-top: 4px;
            ">
              <span style="
                background: ${markerColor}20;
                color: ${markerColor};
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 500;
                border: 1px solid ${markerColor}40;
              ">
                ${association.riskLevel.toUpperCase()}
              </span>
              <span style="
                background: #3b82f620;
                color: #3b82f6;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 500;
                border: 1px solid #3b82f640;
              ">
                ${association.zone}
              </span>
              ${association.status === 'actif' ? `
                <span style="
                  background: #10b98120;
                  color: #10b981;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 10px;
                  font-weight: 500;
                  border: 1px solid #10b98140;
                ">
                  ACTIF
                </span>
              ` : ''}
            </div>
          </div>
          
          <div style="
            display: grid;
            gap: 6px;
            font-size: 11px;
            color: #6b7280;
          ">
            <div style="display: flex; align-items: center; gap: 4px;">
              <strong style="color: #374151;">Catégorie:</strong> ${association.category}
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <strong style="color: #374151;">Ville:</strong> ${association.city}
            </div>
            ${association.memberCount ? `
              <div style="display: flex; align-items: center; gap: 4px;">
                <strong style="color: #374151;">Membres:</strong> ${association.memberCount}
              </div>
            ` : ''}
            ${association.influence ? `
              <div style="display: flex; align-items: center; gap: 4px;">
                <strong style="color: #374151;">Influence:</strong> 
                <span style="text-transform: capitalize;">${association.influence}</span>
              </div>
            ` : ''}
            ${association.activities && association.activities.length > 0 ? `
              <div>
                <strong style="color: #374151;">Activités:</strong>
                <div style="
                  margin-top: 4px;
                  display: flex;
                  flex-wrap: wrap;
                  gap: 4px;
                ">
                  ${association.activities.slice(0, 3).map(activity => `
                    <span style="
                      background: #f3f4f6;
                      padding: 2px 4px;
                      border-radius: 3px;
                      font-size: 9px;
                    ">${activity}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          
          <button 
            onclick="window.associationClick?.('${association.id}')"
            style="
              margin-top: 12px;
              background: #3b82f6;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 11px;
              cursor: pointer;
              width: 100%;
              text-align: center;
              font-weight: 500;
            "
            onmouseover="this.style.background='#2563eb'"
            onmouseout="this.style.background='#3b82f6'"
          >
            Voir les détails →
          </button>
        </div>
      `;

      const marker = L.marker([association.coordinates.lat, association.coordinates.lng], { 
        icon,
        associationData: association 
      })
        .bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup',
        })
        .on('click', () => {
          onAssociationClick?.(association.id);
        });

      markersRef.current.addLayer(marker);
    });

    // Fonction globale pour les clics depuis les popups
    (window as any).associationClick = (associationId: string) => {
      onAssociationClick?.(associationId);
    };

    // Ajuster la vue pour inclure tous les marqueurs
    if (associations.length > 0 && markersRef.current.getLayers().length > 0) {
      const group = new L.featureGroup(markersRef.current.getLayers());
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [associations, onAssociationClick, isLoading, selectedZone]);

  // Ajouter la heatmap si activée
  useEffect(() => {
    if (!mapInstanceRef.current || !showHeatmap || isLoading) return;

    // Nettoyer l'ancienne heatmap
    if (heatmapRef.current) {
      mapInstanceRef.current.removeLayer(heatmapRef.current);
    }

    // Créer les données pour la heatmap
    const heatData = associations
      .filter(asso => asso.riskLevel === 'critique' || asso.riskLevel === 'eleve')
      .map(asso => [
        asso.coordinates.lat,
        asso.coordinates.lng,
        asso.riskLevel === 'critique' ? 1 : 0.5
      ]);

    if (heatData.length > 0 && (window as any).L?.heatLayer) {
      heatmapRef.current = (window as any).L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
          0.0: 'blue',
          0.5: 'yellow',
          0.7: 'orange',
          1.0: 'red'
        }
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (heatmapRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatmapRef.current);
      }
    };
  }, [showHeatmap, associations, isLoading]);

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg ${className}`}>
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Légende */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="p-3 bg-white/90 backdrop-blur-sm">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700">Niveau de risque</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs">Critique</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-xs">Élevé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs">Moyen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs">Faible</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistiques par zone */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Card className="p-3 bg-white/90 backdrop-blur-sm">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Zones
            </h4>
            <div className="space-y-1">
              {Object.entries(zoneStats).map(([zone, stats]) => (
                <Button
                  key={zone}
                  variant={selectedZone === zone ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-between h-7 text-xs"
                  onClick={() => setSelectedZone(selectedZone === zone ? null : zone)}
                >
                  <span>{zone}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                      {stats.total}
                    </Badge>
                    {stats.critique > 0 && (
                      <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                        {stats.critique}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
        }

        .custom-popup .leaflet-popup-content {
          margin: 0;
        }

        .custom-popup .leaflet-popup-tip {
          background: white;
        }

        .marker-cluster-small {
          background-color: rgba(59, 130, 246, 0.6);
        }
        .marker-cluster-small div {
          background-color: rgba(59, 130, 246, 0.8);
        }

        .marker-cluster-medium {
          background-color: rgba(251, 146, 60, 0.6);
        }
        .marker-cluster-medium div {
          background-color: rgba(251, 146, 60, 0.8);
        }

        .marker-cluster-large {
          background-color: rgba(239, 68, 68, 0.6);
        }
        .marker-cluster-large div {
          background-color: rgba(239, 68, 68, 0.8);
        }
      `}</style>
    </div>
  );
}
