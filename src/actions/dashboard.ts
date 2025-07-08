'use server';

import { db } from '@/server/db';
import { RequestStatus } from '@prisma/client';

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

// Service de géolocalisation simplifié
const DEFAULT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'paris-france': { lat: 48.8566, lng: 2.3522 },
  'libreville-gabon': { lat: 0.4162, lng: 9.4673 },
  'douala-cameroon': { lat: 4.0511, lng: 9.7679 },
  'dakar-senegal': { lat: 14.7167, lng: -17.4677 },
  'lyon-france': { lat: 45.7640, lng: 4.8357 },
  'marseille-france': { lat: 43.2965, lng: 5.3698 },
  'yaounde-cameroon': { lat: 3.8480, lng: 11.5021 },
};

export async function getProfilesGeographicData(): Promise<CityProfileData[]> {
  try {
    // Récupérer les profils avec leurs adresses
    const profiles = await db.profile.findMany({
      where: {
        status: {
          in: [RequestStatus.COMPLETED, RequestStatus.VALIDATED],
        },
        addressId: {
          not: null,
        },
      },
      include: {
        address: true,
      },
    });

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
    
    // Ajouter les coordonnées aux données
    return cityData.map(item => {
      const key = `${item.city.toLowerCase()}-${item.country.toLowerCase()}`;
      const coordinates = DEFAULT_COORDINATES[key] || undefined;
      
      return {
        ...item,
        coordinates,
      };
    });
  } catch (error) {
    console.error('Error fetching geographic data:', error);
    return [];
  }
} 