'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Users,
  Filter,
  Eye,
  Building,
  Navigation,
  Plane,
  Phone,
  Target,
  FileText,
} from 'lucide-react';
import { IntelligenceNoteType, IntelligenceNotePriority } from '@/convex/lib/constants';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface IntelligenceMapProps {
  onProfileClick?: (profileId: string) => void;
}

const priorityColors = {
  [IntelligenceNotePriority.LOW]: '#22c55e',
  [IntelligenceNotePriority.MEDIUM]: '#eab308',
  [IntelligenceNotePriority.HIGH]: '#f97316',
  [IntelligenceNotePriority.CRITICAL]: '#ef4444',
};

const typeIcons = {
  [IntelligenceNoteType.POLITICAL_OPINION]: <Building className="h-3 w-3" />,
  [IntelligenceNoteType.ORIENTATION]: <Navigation className="h-3 w-3" />,
  [IntelligenceNoteType.ASSOCIATIONS]: <Users className="h-3 w-3" />,
  [IntelligenceNoteType.TRAVEL_PATTERNS]: <Plane className="h-3 w-3" />,
  [IntelligenceNoteType.CONTACTS]: <Phone className="h-3 w-3" />,
  [IntelligenceNoteType.ACTIVITIES]: <Target className="h-3 w-3" />,
  [IntelligenceNoteType.OTHER]: <FileText className="h-3 w-3" />,
};

// Configuration des icônes Leaflet
const createCustomIcon = (color: string) =>
  new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

function MapContent({
  profiles,
  onProfileClick,
}: {
  profiles: any[];
  onProfileClick?: (profileId: string) => void;
}) {
  const map = useMap();

  // Centrer la carte sur le Gabon si des profils sont disponibles
  if (profiles.length > 0) {
    const gabonCenter = [0.4162, 9.4673]; // Coordonnées du Gabon
    map.setView(gabonCenter as [number, number], 6);
  }

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {profiles.map((profile) => {
        if (!profile.address?.latitude || !profile.address?.longitude) return null;

        const latestNote = profile.intelligenceNotes?.[0];
        const color = latestNote ? priorityColors[latestNote.priority] : '#6b7280';
        const icon = createCustomIcon(color);

        return (
          <Marker
            key={profile.id}
            position={[profile.address.latitude, profile.address.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="font-semibold text-sm mb-2">
                  {profile.firstName} {profile.lastName}
                </div>
                {profile.address && (
                  <div className="text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {profile.address.city}, {profile.address.country}
                  </div>
                )}
                {latestNote && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{typeIcons[latestNote.type]}</span>
                      <span className="text-xs font-medium">
                        {latestNote.type === 'POLITICAL_OPINION' && 'Opinion politique'}
                        {latestNote.type === 'ORIENTATION' && 'Orientation'}
                        {latestNote.type === 'ASSOCIATIONS' && 'Associations'}
                        {latestNote.type === 'TRAVEL_PATTERNS' && 'Habitudes de voyage'}
                        {latestNote.type === 'CONTACTS' && 'Contacts'}
                        {latestNote.type === 'ACTIVITIES' && 'Activités'}
                        {latestNote.type === 'OTHER' && 'Autre'}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: color, color }}
                    >
                      {latestNote.priority === 'LOW' && 'Faible'}
                      {latestNote.priority === 'MEDIUM' && 'Moyenne'}
                      {latestNote.priority === 'HIGH' && 'Élevée'}
                      {latestNote.priority === 'CRITICAL' && 'Critique'}
                    </Badge>
                  </div>
                )}
                {onProfileClick && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => onProfileClick(profile.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir le profil
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export function IntelligenceMap({ onProfileClick }: IntelligenceMapProps) {
  const t = useTranslations('intelligence.dashboard.map');
  const [filters, setFilters] = useState({
    hasNotes: undefined as boolean | undefined,
    priority: undefined as IntelligenceNotePriority | undefined,
    type: undefined as IntelligenceNoteType | undefined,
  });

  const profiles = useQuery(
    api.functions.intelligence.getProfilesMap,
    Object.keys(filters).some((key) => filters[key as keyof typeof filters] !== undefined)
      ? { filters }
      : 'skip',
  );
  const isLoading = profiles === undefined;

  const clearFilters = () => {
    setFilters({
      hasNotes: undefined,
      priority: undefined,
      type: undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">Chargement de la carte...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {profiles?.length || 0} profils
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.hasNotes?.toString() || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  hasNotes: value === 'all' ? undefined : value === 'true',
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Notes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les profils</SelectItem>
                <SelectItem value="true">Avec notes</SelectItem>
                <SelectItem value="false">Sans notes</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  priority:
                    value === 'all' ? undefined : (value as IntelligenceNotePriority),
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="LOW">Faible</SelectItem>
                <SelectItem value="MEDIUM">Moyenne</SelectItem>
                <SelectItem value="HIGH">Élevée</SelectItem>
                <SelectItem value="CRITICAL">Critique</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  type: value === 'all' ? undefined : (value as IntelligenceNoteType),
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="POLITICAL_OPINION">Opinion politique</SelectItem>
                <SelectItem value="ORIENTATION">Orientation</SelectItem>
                <SelectItem value="ASSOCIATIONS">Associations</SelectItem>
                <SelectItem value="TRAVEL_PATTERNS">Habitudes de voyage</SelectItem>
                <SelectItem value="CONTACTS">Contacts</SelectItem>
                <SelectItem value="ACTIVITIES">Activités</SelectItem>
                <SelectItem value="OTHER">Autre</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>

          {/* Légende */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Faible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Moyenne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Élevée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Critique</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Sans notes</span>
            </div>
          </div>

          {/* Carte */}
          <div className="h-[400px] border rounded-lg overflow-hidden">
            <MapContainer
              center={[0.4162, 9.4673]} // Gabon
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <MapContent profiles={profiles || []} onProfileClick={onProfileClick} />
            </MapContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
