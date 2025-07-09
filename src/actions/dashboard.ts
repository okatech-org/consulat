'use server';

import { db } from '@/server/db';

export interface ProfileLocation {
  id: string;
  address: string;
  city: string;
  country: string;
  count: number;
}

export async function getProfilesGeographicData(): Promise<ProfileLocation[]> {
  try {
    // Récupérer les profils avec leurs adresses
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

    // Grouper par adresse complète
    const locationGroups = new Map<string, ProfileLocation>();

    profiles.forEach((profile) => {
      if (!profile.address) return;

      // Ignorer les codes postaux ou les entrées invalides
      if (/^\d+$/.test(profile.address.city.trim())) return;
      if (profile.address.city.trim().length < 2) return;

      const normalizedCity = normalizeCity(profile.address.city);
      const normalizedCountry = normalizeCountry(profile.address.country, profile.address.city);
      
      // Construire l'adresse complète pour Google Maps
      const fullAddress = `${profile.address.firstLine}${profile.address.secondLine ? ', ' + profile.address.secondLine : ''}, ${normalizedCity}${profile.address.zipCode ? ', ' + profile.address.zipCode : ''}, ${normalizedCountry}`;
      
      // Utiliser la ville + pays comme clé pour grouper
      const key = `${normalizedCity}-${normalizedCountry}`;
      
      if (locationGroups.has(key)) {
        locationGroups.get(key)!.count += 1;
      } else {
        locationGroups.set(key, {
          id: key,
          address: fullAddress,
          city: normalizedCity,
          country: normalizedCountry,
          count: 1,
        });
      }
    });

    return Array.from(locationGroups.values()).sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching geographic data:', error);
    return [];
  }
} 