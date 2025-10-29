'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
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
import { getLocationCoordinates } from '@/lib/services/geocoding-service';
import { useTranslations } from 'next-intl';
import { MapPin, Users, RotateCcw } from 'lucide-react';
import { env } from '@/env';
import CardContainer from '../layouts/card-container';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 0.4162,
  lng: 9.4673,
};

const GOOGLE_MAPS_LIBRARIES: (
  | 'marker'
  | 'places'
  | 'geometry'
  | 'drawing'
  | 'visualization'
)[] = [];

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

function calculateBounds(
  profiles: ProfileWithCoords[],
  googleMaps: typeof google,
): google.maps.LatLngBounds | null {
  if (profiles.length === 0 || !googleMaps) {
    return null;
  }

  const bounds = new googleMaps.maps.LatLngBounds();
  profiles.forEach((profile) => {
    bounds.extend({ lat: profile.latitude, lng: profile.longitude });
  });
  return bounds;
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
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const circlesRef = useRef<Map<string, google.maps.Circle>>(new Map());
  const infoWindowsRef = useRef<Map<string, google.maps.InfoWindow>>(new Map());

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Transform profiles with coordinates
  const profilesWithCoords = useMemo<ProfileWithCoords[]>(() => {
    return profiles
      .filter((p) => p.address)
      .map((profile) => {
        const coords = getLocationCoordinates(
          profile.address?.city,
          profile.address?.country,
        );
        return {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: `${profile.firstName} ${profile.lastName}`,
          latitude: coords.latitude,
          longitude: coords.longitude,
          city: profile.address?.city,
          country: profile.address?.country
            ? t_countries(profile.address?.country)
            : undefined,
        };
      });
  }, [profiles]);

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

  // Create and update circle markers
  useEffect(() => {
    if (!map || filteredProfiles.length === 0 || typeof google === 'undefined') {
      return;
    }

    const defaultCircleOptions: google.maps.CircleOptions = {
      strokeColor: '#3b82f6',
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.6,
      radius: 200,
      clickable: true,
      zIndex: 1,
    };

    const selectedCircleOptions: google.maps.CircleOptions = {
      strokeColor: '#1d4ed8',
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: '#3b82f6',
      fillOpacity: 0.8,
      radius: 300,
      clickable: true,
      zIndex: 2,
    };

    filteredProfiles.forEach((profile) => {
      const existingCircle = circlesRef.current.get(profile.id);
      const isSelected = selectedMarker === profile.id;

      if (!existingCircle) {
        const circle = new google.maps.Circle({
          ...(isSelected ? selectedCircleOptions : defaultCircleOptions),
          center: { lat: profile.latitude, lng: profile.longitude },
          map,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <p style="font-weight: 600; font-size: 16px; margin: 0 0 4px 0;">${profile.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              <p style="font-size: 14px; color: #666; margin: 0;">${[profile.city, profile.country].filter(Boolean).join(', ').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
          `,
        });

        circle.addListener('click', () => {
          setSelectedMarker(profile.id);
          onProfileClick?.(profile.id);

          infoWindowsRef.current.forEach((iw) => iw.close());
          infoWindow.open({
            position: { lat: profile.latitude, lng: profile.longitude },
            map,
          });
        });

        circlesRef.current.set(profile.id, circle);
        infoWindowsRef.current.set(profile.id, infoWindow);
      } else {
        const options = isSelected ? selectedCircleOptions : defaultCircleOptions;
        existingCircle.setOptions(options);
        existingCircle.setCenter({ lat: profile.latitude, lng: profile.longitude });
      }
    });

    const currentProfileIds = new Set(filteredProfiles.map((p) => p.id));
    circlesRef.current.forEach((circle, profileId) => {
      if (!currentProfileIds.has(profileId)) {
        circle.setMap(null);
        const infoWindow = infoWindowsRef.current.get(profileId);
        if (infoWindow) {
          infoWindow.close();
        }
        circlesRef.current.delete(profileId);
        infoWindowsRef.current.delete(profileId);
      }
    });
  }, [map, filteredProfiles, selectedMarker, onProfileClick]);

  // Update info windows visibility
  useEffect(() => {
    if (!map) return;

    circlesRef.current.forEach((circle, profileId) => {
      const infoWindow = infoWindowsRef.current.get(profileId);
      if (!infoWindow) return;

      if (selectedMarker === profileId) {
        const center = circle.getCenter();
        if (center) {
          infoWindow.open({
            position: center,
            map,
          });
        }
      } else {
        infoWindow.close();
      }
    });
  }, [map, selectedMarker]);

  // Fit bounds to markers
  useEffect(() => {
    if (map && filteredProfiles.length > 0 && isLoaded && typeof google !== 'undefined') {
      const bounds = calculateBounds(filteredProfiles, google);
      if (bounds) {
        map.fitBounds(bounds);
        const listener = google.maps.event.addListener(map, 'bounds_changed', () => {
          google.maps.event.removeListener(listener);
          if (map.getZoom() && map.getZoom()! > 15) {
            map.setZoom(15);
          }
        });
      }
    }
  }, [map, filteredProfiles, isLoaded]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    circlesRef.current.forEach((circle) => circle.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    circlesRef.current.clear();
    infoWindowsRef.current.clear();
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <CardContainer className="border-primary/10" contentClass="pt-6">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">{t('loadingMap')}</p>
          </div>
        </CardContainer>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
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
        <div className="rounded-b-lg overflow-hidden">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={3}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
          />
        </div>
      </CardContainer>
    </div>
  );
}
