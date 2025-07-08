'use server';

import { db } from '@/server/db';

export interface CityProfileData {
  city: string;
  country: string;
  countryName: string;
  count: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Cache pour éviter les appels API répétés
const coordinatesCache = new Map<string, { lat: number; lng: number } | null>();

// Service de géolocalisation avec API Nominatim
async function getCoordinatesForCity(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
  const key = `${city.toLowerCase()}-${country.toLowerCase()}`;
  
  // Vérifier le cache
  if (coordinatesCache.has(key)) {
    return coordinatesCache.get(key)!;
  }

  try {
    const query = `${city}, ${country}`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Consulat.bis/1.0',
        },
      }
    );

    if (!response.ok) {
      coordinatesCache.set(key, null);
      return null;
    }

    const data = await response.json();
    
    if (data.length > 0) {
      const coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
      coordinatesCache.set(key, coordinates);
      return coordinates;
    }
    
    coordinatesCache.set(key, null);
    return null;
  } catch (error) {
    console.error(`Error geocoding ${city}, ${country}:`, error);
    coordinatesCache.set(key, null);
    return null;
  }
}

export async function getProfilesGeographicData(): Promise<CityProfileData[]> {
  try {
    // Debug: Compter tous les profils
    const totalProfiles = await db.profile.count();
    console.log('Total profiles:', totalProfiles);

    // Debug: Compter les profils avec adresses
    const profilesWithAddress = await db.profile.count({
      where: {
        addressId: {
          not: null,
        },
      },
    });
    console.log('Profiles with address:', profilesWithAddress);

    // Récupérer les profils avec leurs adresses (sans filtre de statut pour le moment)
    const profiles = await db.profile.findMany({
      where: {
        addressId: {
          not: null,
        },
      },
      include: {
        address: true,
      },
    });

    console.log('Found profiles with addresses:', profiles.length);

    // Grouper par ville et pays
    const cityGroups = new Map<string, CityProfileData>();

    profiles.forEach((profile) => {
      if (!profile.address) return;

      const key = `${profile.address.city}-${profile.address.country}`;
      
      if (cityGroups.has(key)) {
        cityGroups.get(key)!.count += 1;
      } else {
        cityGroups.set(key, {
          city: profile.address.city,
          country: profile.address.country,
          countryName: profile.address.country,
          count: 1,
        });
      }
    });

    const cityData = Array.from(cityGroups.values()).sort((a, b) => b.count - a.count);
    console.log('City data:', cityData);
    
    // Ajouter les coordonnées aux données via géocodage
    const cityDataWithCoordinates = await Promise.all(
      cityData.map(async (item) => {
        const coordinates = await getCoordinatesForCity(item.city, item.country);
        return {
          ...item,
          coordinates: coordinates || undefined,
        };
      })
    );

    return cityDataWithCoordinates;
  } catch (error) {
    console.error('Error fetching geographic data:', error);
    return [];
  }
} 