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

// Fallback pour les principales villes françaises et africaines
const FALLBACK_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'paris-france': { lat: 48.8566, lng: 2.3522 },
  'marseille-france': { lat: 43.2965, lng: 5.3698 },
  'lyon-france': { lat: 45.7640, lng: 4.8357 },
  'toulouse-france': { lat: 43.6047, lng: 1.4442 },
  'nice-france': { lat: 43.7102, lng: 7.2620 },
  'nantes-france': { lat: 47.2184, lng: -1.5536 },
  'strasbourg-france': { lat: 48.5734, lng: 7.7521 },
  'montpellier-france': { lat: 43.6110, lng: 3.8767 },
  'bordeaux-france': { lat: 44.8378, lng: -0.5792 },
  'lille-france': { lat: 50.6292, lng: 3.0573 },
  'rennes-france': { lat: 48.1173, lng: -1.6778 },
  'reims-france': { lat: 49.2583, lng: 4.0317 },
  'toulon-france': { lat: 43.1242, lng: 5.9280 },
  'grenoble-france': { lat: 45.1885, lng: 5.7245 },
  'rouen-france': { lat: 49.4431, lng: 1.0993 },
  'tours-france': { lat: 47.3941, lng: 0.6848 },
  'clermont-ferrand-france': { lat: 45.7772, lng: 3.0870 },
  'limoges-france': { lat: 45.8336, lng: 1.2611 },
  'pau-france': { lat: 43.2951, lng: -0.3708 },
  'pessac-france': { lat: 44.8063, lng: -0.6097 },
  'villeurbanne-france': { lat: 45.7661, lng: 4.8795 },
  'libreville-gabon': { lat: 0.4162, lng: 9.4673 },
  'port-gentil-gabon': { lat: -0.7193, lng: 8.7815 },
  'douala-cameroon': { lat: 4.0511, lng: 9.7679 },
  'yaounde-cameroon': { lat: 3.8480, lng: 11.5021 },
  'dakar-senegal': { lat: 14.7167, lng: -17.4677 },
  'abidjan-ivory coast': { lat: 5.3600, lng: -4.0083 },
  'casablanca-morocco': { lat: 33.5731, lng: -7.5898 },
  'rabat-morocco': { lat: 34.0209, lng: -6.8416 },
  'tunis-tunisia': { lat: 36.8065, lng: 10.1815 },
  'algiers-algeria': { lat: 36.7538, lng: 3.0588 },
};

// Service de géolocalisation avec API Google Geocoding
async function getCoordinatesForCity(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
  const key = `${city.toLowerCase()}-${country.toLowerCase()}`;
  
  // Vérifier le cache
  if (coordinatesCache.has(key)) {
    return coordinatesCache.get(key)!;
  }

  // Vérifier le fallback en premier
  const fallbackKey = `${city.toLowerCase()}-${country.toLowerCase()}`;
  if (FALLBACK_COORDINATES[fallbackKey]) {
    const coordinates = FALLBACK_COORDINATES[fallbackKey];
    coordinatesCache.set(key, coordinates);
    return coordinates;
  }

  try {
    const query = `${city}, ${country}`;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found');
      coordinatesCache.set(key, null);
      return null;
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      coordinatesCache.set(key, null);
      return null;
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const coordinates = {
        lat: location.lat,
        lng: location.lng,
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

    // Fonction pour normaliser les noms de villes
    const normalizeCity = (city: string): string => {
      return city.trim().toLowerCase()
        .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
        .replace(/[()]/g, '') // Supprimer les parenthèses
        .replace(/\s*-\s*/g, '-') // Normaliser les tirets
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Fonction pour corriger les pays
    const normalizeCountry = (country: string, city: string): string => {
      const cityLower = city.toLowerCase();
      
      // Corrections spécifiques pour les villes africaines
      if (cityLower.includes('libreville') || cityLower.includes('port-gentil')) {
        return 'Gabon';
      }
      if (cityLower.includes('douala') || cityLower.includes('yaounde') || cityLower.includes('yaoundé')) {
        return 'Cameroon';
      }
      if (cityLower.includes('dakar')) {
        return 'Senegal';
      }
      if (cityLower.includes('abidjan')) {
        return 'Ivory Coast';
      }
      
      // Normaliser les pays
      const countryMap: Record<string, string> = {
        'fr': 'France',
        'france': 'France',
        'ga': 'Gabon',
        'gabon': 'Gabon',
        'cm': 'Cameroon',
        'cameroon': 'Cameroon',
        'sn': 'Senegal',
        'senegal': 'Senegal',
      };
      
      return countryMap[country.toLowerCase()] || country;
    };

    // Grouper par ville et pays normalisés
    const cityGroups = new Map<string, CityProfileData>();

    profiles.forEach((profile) => {
      if (!profile.address) return;

      // Ignorer les codes postaux ou les entrées invalides
      if (/^\d+$/.test(profile.address.city.trim())) return;
      if (profile.address.city.trim().length < 2) return;

      const normalizedCity = normalizeCity(profile.address.city);
      const normalizedCountry = normalizeCountry(profile.address.country, profile.address.city);
      const key = `${normalizedCity}-${normalizedCountry}`;
      
      if (cityGroups.has(key)) {
        cityGroups.get(key)!.count += 1;
      } else {
        cityGroups.set(key, {
          city: normalizedCity,
          country: normalizedCountry,
          countryName: normalizedCountry,
          count: 1,
        });
      }
    });

    const cityData = Array.from(cityGroups.values()).sort((a, b) => b.count - a.count);
    
    // Géocoder toutes les villes avec Google Geocoding API (plus rapide et fiable)
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