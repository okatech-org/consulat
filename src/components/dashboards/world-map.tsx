'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin } from 'lucide-react';
import type { CityProfileData } from '@/actions/dashboard';

interface WorldMapProps {
  data: CityProfileData[];
  height?: string;
  className?: string;
}

// Composant pour créer des icônes de cluster personnalisées
const createClusterIcon = (count: number) => {
  const size = Math.min(Math.max(count * 2 + 20, 30), 60);
  const color =
    count > 50 ? '#dc2626' : count > 20 ? '#ea580c' : count > 10 ? '#ca8a04' : '#16a34a';

  return divIcon({
    html: `
      <div style="
        background-color: ${color};
        color: white;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${Math.min(size / 3, 14)}px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${count}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default function WorldMap({
  data,
  height = '500px',
  className = '',
}: WorldMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {data.map((item, index) => {
          if (!item.coordinates) return null;

          return (
            <Marker
              key={`${item.city}-${item.country}-${index}`}
              position={[item.coordinates.lat, item.coordinates.lng]}
              icon={createClusterIcon(item.count)}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-lg mb-2">
                    {item.city}, {item.countryName}
                  </h3>

                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {item.count} profil{item.count > 1 ? 's' : ''}
                    </span>
                  </div>

                  <Badge
                    variant={
                      item.count > 50
                        ? 'destructive'
                        : item.count > 20
                          ? 'secondary'
                          : item.count > 10
                            ? 'default'
                            : 'outline'
                    }
                    className="text-xs"
                  >
                    {item.count > 50
                      ? 'Très élevé'
                      : item.count > 20
                        ? 'Élevé'
                        : item.count > 10
                          ? 'Moyen'
                          : 'Faible'}
                  </Badge>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
