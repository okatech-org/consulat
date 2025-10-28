'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

declare const L: any;

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

export default function SmartInteractiveMap({
  profiles = [],
  onProfileClick,
  className,
}: SmartInteractiveMapProps) {
  const t_countries = useTranslations('countries');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

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

  // Stats by city
  const statsByCity = useMemo(() => {
    const stats = new Map<string, number>();
    const filtered =
      selectedCountry === 'all'
        ? profilesWithCoords
        : profilesWithCoords.filter((p) => p.country === selectedCountry);

    filtered.forEach((p) => {
      const city = p.city || 'Unknown';
      stats.set(city, (stats.get(city) || 0) + 1);
    });
    return Array.from(stats.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  }, [profilesWithCoords, selectedCountry]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || typeof window === 'undefined' || !L)
      return;

    const map = L.map(mapRef.current, {
      center: [0.4162, 9.4673],
      zoom: 3,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when filtered profiles change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredProfiles.forEach((profile) => {
      const marker = L.marker([profile.latitude, profile.longitude])
        .bindPopup(
          `
          <div>
            <strong>${profile.name}</strong><br/>
            ${profile.city || ''}, ${profile.country || ''}
          </div>
          `,
        )
        .on('click', () => {
          onProfileClick?.(profile.id);
        });

      marker.addTo(mapInstanceRef.current);
      markersRef.current.push(marker);
    });

    // Fit bounds if profiles exist
    if (filteredProfiles.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [filteredProfiles, onProfileClick]);

  if (typeof window === 'undefined' || !L) {
    return (
      <div
        className={`flex items-center justify-center bg-background rounded-lg ${className}`}
      >
        <div className="text-center p-8">
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Select
              value={selectedCountry}
              onValueChange={(value) => {
                setSelectedCountry(value);
                setSelectedCity('all');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country || ''}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city || ''}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCountry('all');
              setSelectedCity('all');
            }}
          >
            Reset
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profiles by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {statsByCountry.map(({ country, count }) => (
                <div key={country} className="flex justify-between items-center">
                  <span className="text-sm">{country}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profiles by City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {statsByCity.map(({ city, count }) => (
                <div key={city} className="flex justify-between items-center">
                  <span className="text-sm">{city}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div ref={mapRef} className="w-full rounded-lg" style={{ height: '600px' }} />
        </CardContent>
      </Card>
    </div>
  );
}
