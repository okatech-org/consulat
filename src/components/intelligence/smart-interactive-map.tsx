'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProfilesMapDataItem } from '@/convex/lib/types';
import { useTranslations } from 'next-intl';
import { MapPin, Users, RotateCcw } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CardContainer from '../layouts/card-container';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface SmartInteractiveMapProps {
  profiles?: ProfilesMapDataItem[];
  onProfileClick?: (profileId: string) => void;
  className?: string;
}

interface ProfileWithCoords {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

function FitBounds({ profiles }: { profiles: ProfileWithCoords[] }) {
  const map = useMap();

  useEffect(() => {
    if (profiles.length > 0) {
      const bounds = L.latLngBounds(
        profiles.map((p) => [p.latitude, p.longitude] as [number, number]),
      );
      map.fitBounds(bounds.pad(0.1));
    }
  }, [profiles, map]);

  return null;
}

export default function SmartInteractiveMap({
  profiles = [],
  onProfileClick,
  className,
}: SmartInteractiveMapProps) {
  const t = useTranslations('sa.profilesMap');
  const t_countries = useTranslations('countries');

  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Transform profiles with coordinates
  const profilesWithCoords = profiles
    .filter((p) => p.address?.coordinates)
    .map((profile) => {
      return {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        name: `${profile.firstName} ${profile.lastName}`,
        latitude: Number(profile.address?.coordinates?.latitude) || 0,
        longitude: Number(profile.address?.coordinates?.longitude) || 0,
        city: profile.address?.city,
        country: profile.address?.country
          ? t_countries(profile.address?.country)
          : undefined,
      };
    });

  // Get unique countries and cities for filters
  const countries = useMemo(() => {
    const countrySet = new Set(profilesWithCoords.map((p) => p.country).filter(Boolean));
    return Array.from(countrySet).sort();
  }, [profilesWithCoords]);

  const cities = useMemo(() => {
    const filtered =
      selectedCountry === 'all'
        ? profilesWithCoords
        : profilesWithCoords.filter((p) => p.country === selectedCountry);
    const citySet = new Set(filtered.map((p) => p.city).filter(Boolean));
    return Array.from(citySet).sort();
  }, [profilesWithCoords, selectedCountry]);

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    let filtered = profilesWithCoords;
    if (selectedCountry !== 'all') {
      filtered = filtered.filter((p) => p.country === selectedCountry);
    }
    if (selectedCity !== 'all') {
      filtered = filtered.filter((p) => p.city === selectedCity);
    }
    return filtered;
  }, [profilesWithCoords, selectedCountry, selectedCity]);

  // Stats by country
  const statsByCountry = useMemo(() => {
    const stats = new Map<string, number>();
    profilesWithCoords.forEach((p) => {
      const country = p.country || 'Unknown';
      stats.set(country, (stats.get(country) || 0) + 1);
    });
    return Array.from(stats.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  }, [profilesWithCoords]);

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <style>
        {`
        .leaflet-pane {
            z-index: 0;
          }

          .leaflet-control {
            z-index: 1;
          }
        `}
      </style>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardContainer className="border-primary/10" contentClass="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('totalProfiles')}
              </p>
              <p className="text-3xl font-bold mt-1">{profilesWithCoords.length}</p>
            </div>
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="size-6 text-primary" />
            </div>
          </div>
        </CardContainer>

        <CardContainer className="border-primary/10" contentClass="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('countries')}
              </p>
              <p className="text-3xl font-bold mt-1">{countries.length}</p>
            </div>
            <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MapPin className="size-6 text-blue-500" />
            </div>
          </div>
        </CardContainer>

        <CardContainer className="border-primary/10" contentClass="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('cities')}</p>
              <p className="text-3xl font-bold mt-1">{cities.length}</p>
            </div>
            <div className="size-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <MapPin className="size-6 text-emerald-500" />
            </div>
          </div>
        </CardContainer>
      </div>

      {/* Filters */}
      <div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">{t('selectCountry')}</label>
            <Select
              value={selectedCountry}
              onValueChange={(value) => {
                setSelectedCountry(value);
                setSelectedCity('all');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectCountryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCountries')}</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country || ''}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">{t('selectCity')}</label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectCityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCities')}</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city || ''}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setSelectedCountry('all');
                setSelectedCity('all');
              }}
            >
              <RotateCcw className="size-4" />
              {t('reset')}
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCountry !== 'all' || selectedCity !== 'all') && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('activeFilters')}:</span>
            {selectedCountry !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {selectedCountry}
              </Badge>
            )}
            {selectedCity !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {selectedCity}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              ({filteredProfiles.length} {t('profilesFound')})
            </span>
          </div>
        )}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CardContainer
          className="border-primary/10"
          title={
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              <span>{t('profilesByCountry')}</span>
            </div>
          }
        >
          <div className="space-y-2 flex flex-wrap gap-2">
            {statsByCountry.length > 0 ? (
              statsByCountry.map(({ country, count }) => (
                <div
                  key={country}
                  className="flex justify-between items-center px-3 py-2 gap-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{country}</span>
                  <Badge variant="secondary" className="font-bold">
                    {count}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noData')}
              </p>
            )}
          </div>
        </CardContainer>
      </div>

      {/* Map */}
      <CardContainer
        className="border-primary/10"
        title={
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <span>{t('interactiveMap')}</span>
          </div>
        }
        action={
          <Badge variant="outline" className="gap-1">
            <Users className="size-3" />
            {filteredProfiles.length} {t('profilesShown')}
          </Badge>
        }
        contentClass="p-0"
      >
        <div className="rounded-b-lg overflow-hidden z-0">
          <MapContainer
            center={[0.4162, 9.4673]}
            zoom={3}
            scrollWheelZoom={true}
            className="w-full"
            style={{ height: '600px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            {filteredProfiles.map((profile) => (
              <CircleMarker
                key={profile.id}
                center={[Number(profile?.latitude) || 0, Number(profile?.longitude) || 0]}
                radius={8}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.6,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => {
                    onProfileClick?.(profile.id);
                  },
                }}
              >
                <Popup>
                  <div className="p-0">
                    <p className="font-semibold text-base">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.city || ''}
                      {profile.city && profile.country ? ', ' : ''}
                      {profile.country || ''}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            <FitBounds profiles={filteredProfiles} />
          </MapContainer>
        </div>
      </CardContainer>
    </div>
  );
}
