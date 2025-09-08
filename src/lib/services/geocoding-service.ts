/**
 * Service de géocodage pour obtenir les coordonnées des villes
 * Contient une base de données des principales villes du monde
 */

export interface CityCoordinates {
  latitude: number;
  longitude: number;
  country: string;
  region?: string;
}

// Base de données des coordonnées des principales villes
const CITY_COORDINATES: Record<string, CityCoordinates> = {
  // Gabon - Principales villes
  'libreville': { latitude: 0.4162, longitude: 9.4673, country: 'Gabon', region: 'Estuaire' },
  'port-gentil': { latitude: -0.7193, longitude: 8.7815, country: 'Gabon', region: 'Ogooué-Maritime' },
  'port gentil': { latitude: -0.7193, longitude: 8.7815, country: 'Gabon', region: 'Ogooué-Maritime' },
  'franceville': { latitude: -1.6333, longitude: 13.5833, country: 'Gabon', region: 'Haut-Ogooué' },
  'oyem': { latitude: 1.5995, longitude: 11.5795, country: 'Gabon', region: 'Woleu-Ntem' },
  'moanda': { latitude: -1.5539, longitude: 13.1928, country: 'Gabon', region: 'Haut-Ogooué' },
  'lambaréné': { latitude: -0.7000, longitude: 10.2419, country: 'Gabon', region: 'Moyen-Ogooué' },
  'lambarene': { latitude: -0.7000, longitude: 10.2419, country: 'Gabon', region: 'Moyen-Ogooué' },
  'tchibanga': { latitude: -2.9167, longitude: 11.0167, country: 'Gabon', region: 'Nyanga' },
  'koulamoutou': { latitude: -1.1376, longitude: 12.4626, country: 'Gabon', region: 'Ogooué-Lolo' },
  'makokou': { latitude: 0.5738, longitude: 12.8644, country: 'Gabon', region: 'Ogooué-Ivindo' },

  // France - Principales villes
  'paris': { latitude: 48.8566, longitude: 2.3522, country: 'France', region: 'Île-de-France' },
  'marseille': { latitude: 43.2965, longitude: 5.3698, country: 'France', region: 'PACA' },
  'lyon': { latitude: 45.7640, longitude: 4.8357, country: 'France', region: 'Auvergne-Rhône-Alpes' },
  'toulouse': { latitude: 43.6047, longitude: 1.4442, country: 'France', region: 'Occitanie' },
  'nice': { latitude: 43.7102, longitude: 7.2620, country: 'France', region: 'PACA' },
  'nantes': { latitude: 47.2184, longitude: -1.5536, country: 'France', region: 'Pays de la Loire' },
  'strasbourg': { latitude: 48.5734, longitude: 7.7521, country: 'France', region: 'Grand Est' },
  'montpellier': { latitude: 43.6110, longitude: 3.8767, country: 'France', region: 'Occitanie' },
  'bordeaux': { latitude: 44.8378, longitude: -0.5792, country: 'France', region: 'Nouvelle-Aquitaine' },
  'lille': { latitude: 50.6292, longitude: 3.0573, country: 'France', region: 'Hauts-de-France' },
  
  // France - Villes spécifiques des profils
  'saint-babel': { latitude: 45.8547, longitude: 3.1594, country: 'France', region: 'Auvergne-Rhône-Alpes' },
  'saint babel': { latitude: 45.8547, longitude: 3.1594, country: 'France', region: 'Auvergne-Rhône-Alpes' },
  'clermont-ferrand': { latitude: 45.7797, longitude: 3.0863, country: 'France', region: 'Auvergne-Rhône-Alpes' },
  'rennes': { latitude: 48.1173, longitude: -1.6778, country: 'France', region: 'Bretagne' },
  'reims': { latitude: 49.2583, longitude: 4.0317, country: 'France', region: 'Grand Est' },
  'le havre': { latitude: 49.4944, longitude: 0.1079, country: 'France', region: 'Normandie' },
  'saint-etienne': { latitude: 45.4397, longitude: 4.3872, country: 'France', region: 'Auvergne-Rhône-Alpes' },
  'toulon': { latitude: 43.1242, longitude: 5.9280, country: 'France', region: 'PACA' },
  'grenoble': { latitude: 45.1885, longitude: 5.7245, country: 'France', region: 'Auvergne-Rhône-Alpes' },
  'dijon': { latitude: 47.3220, longitude: 5.0415, country: 'France', region: 'Bourgogne-Franche-Comté' },

  // Afrique centrale et de l'Ouest
  'douala': { latitude: 4.0483, longitude: 9.7043, country: 'Cameroon', region: 'Littoral' },
  'yaoundé': { latitude: 3.8480, longitude: 11.5021, country: 'Cameroon', region: 'Centre' },
  'yaounde': { latitude: 3.8480, longitude: 11.5021, country: 'Cameroon', region: 'Centre' },
  'brazzaville': { latitude: -4.2634, longitude: 15.2429, country: 'Congo', region: 'Pool' },
  'kinshasa': { latitude: -4.4419, longitude: 15.2663, country: 'DR Congo', region: 'Kinshasa' },
  'dakar': { latitude: 14.7167, longitude: -17.4677, country: 'Senegal', region: 'Dakar' },
  'abidjan': { latitude: 5.3600, longitude: -4.0083, country: 'Ivory Coast', region: 'Lagunes' },
  'bamako': { latitude: 12.6392, longitude: -8.0029, country: 'Mali', region: 'Bamako' },
  'ouagadougou': { latitude: 12.3714, longitude: -1.5197, country: 'Burkina Faso', region: 'Centre' },

  // États-Unis et Canada
  'new york': { latitude: 40.7128, longitude: -74.0060, country: 'USA', region: 'New York' },
  'washington': { latitude: 38.9072, longitude: -77.0369, country: 'USA', region: 'DC' },
  'los angeles': { latitude: 34.0522, longitude: -118.2437, country: 'USA', region: 'California' },
  'chicago': { latitude: 41.8781, longitude: -87.6298, country: 'USA', region: 'Illinois' },
  'toronto': { latitude: 43.6532, longitude: -79.3832, country: 'Canada', region: 'Ontario' },
  'montreal': { latitude: 45.5017, longitude: -73.5673, country: 'Canada', region: 'Quebec' },
  'vancouver': { latitude: 49.2827, longitude: -123.1207, country: 'Canada', region: 'BC' },

  // Europe
  'london': { latitude: 51.5074, longitude: -0.1278, country: 'UK', region: 'England' },
  'berlin': { latitude: 52.5200, longitude: 13.4050, country: 'Germany', region: 'Berlin' },
  'madrid': { latitude: 40.4168, longitude: -3.7038, country: 'Spain', region: 'Madrid' },
  'rome': { latitude: 41.9028, longitude: 12.4964, country: 'Italy', region: 'Lazio' },
  'amsterdam': { latitude: 52.3676, longitude: 4.9041, country: 'Netherlands', region: 'North Holland' },
  'brussels': { latitude: 50.8503, longitude: 4.3517, country: 'Belgium', region: 'Brussels' },
  'bruxelles': { latitude: 50.8503, longitude: 4.3517, country: 'Belgium', region: 'Brussels' },
};

/**
 * Normalise le nom d'une ville pour la recherche
 */
function normalizeCityName(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .replace(/[àáâãäåæ]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõöø]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Obtient les coordonnées d'une ville
 */
export function getCityCoordinates(city: string, country?: string): CityCoordinates | null {
  const normalizedCity = normalizeCityName(city);
  
  // Recherche directe
  let coordinates = CITY_COORDINATES[normalizedCity];
  
  // Si pas trouvé, essayer avec des variantes courantes
  if (!coordinates) {
    // Essayer sans les mots courants
    const cleanedCity = normalizedCity
      .replace(/\b(ville|city|town|sur|sous|les|de|du|des|la|le)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    coordinates = CITY_COORDINATES[cleanedCity];
  }
  
  // Si toujours pas trouvé et qu'on a le pays, essayer les coordonnées du pays
  if (!coordinates && country) {
    coordinates = getCountryDefaultCoordinates(country);
  }
  
  return coordinates;
}

/**
 * Obtient les coordonnées par défaut d'un pays
 */
export function getCountryDefaultCoordinates(country: string): CityCoordinates | null {
  const normalizedCountry = country.toLowerCase().trim();
  
  const countryCoordinates: Record<string, CityCoordinates> = {
    'gabon': { latitude: 0.4162, longitude: 9.4673, country: 'Gabon' },
    'france': { latitude: 48.8566, longitude: 2.3522, country: 'France' }, // Paris comme centre de la France
    'fr': { latitude: 48.8566, longitude: 2.3522, country: 'France' }, // Code pays France
    'cameroon': { latitude: 7.3697, longitude: 12.3547, country: 'Cameroon' },
    'cameroun': { latitude: 7.3697, longitude: 12.3547, country: 'Cameroon' },
    'congo': { latitude: -0.2280, longitude: 15.8277, country: 'Congo' },
    'senegal': { latitude: 14.4974, longitude: -14.4524, country: 'Senegal' },
    'sénégal': { latitude: 14.4974, longitude: -14.4524, country: 'Senegal' },
    'ivory coast': { latitude: 7.5400, longitude: -5.5471, country: 'Ivory Coast' },
    'côte d\'ivoire': { latitude: 7.5400, longitude: -5.5471, country: 'Ivory Coast' },
    'usa': { latitude: 39.8283, longitude: -98.5795, country: 'USA' },
    'united states': { latitude: 39.8283, longitude: -98.5795, country: 'USA' },
    'canada': { latitude: 56.1304, longitude: -106.3468, country: 'Canada' },
    'germany': { latitude: 51.1657, longitude: 10.4515, country: 'Germany' },
    'allemagne': { latitude: 51.1657, longitude: 10.4515, country: 'Germany' },
    'uk': { latitude: 55.3781, longitude: -3.4360, country: 'UK' },
    'united kingdom': { latitude: 55.3781, longitude: -3.4360, country: 'UK' },
    'spain': { latitude: 40.4637, longitude: -3.7492, country: 'Spain' },
    'espagne': { latitude: 40.4637, longitude: -3.7492, country: 'Spain' },
  };
  
  return countryCoordinates[normalizedCountry] || null;
}

/**
 * Obtient les coordonnées avec fallback intelligent
 */
export function getLocationCoordinates(
  city?: string,
  country?: string
): { latitude: number; longitude: number } {
  if (city) {
    const coordinates = getCityCoordinates(city, country);
    if (coordinates) {
      return { latitude: coordinates.latitude, longitude: coordinates.longitude };
    }
  }
  
  if (country) {
    const coordinates = getCountryDefaultCoordinates(country);
    if (coordinates) {
      return { latitude: coordinates.latitude, longitude: coordinates.longitude };
    }
  }
  
  // Fallback: coordonnées du Gabon (siège du consulat)
  return { latitude: 0.4162, longitude: 9.4673 };
}

/**
 * Vérifie si une ville est connue dans notre base de données
 */
export function isCityKnown(city: string): boolean {
  const normalizedCity = normalizeCityName(city);
  return normalizedCity in CITY_COORDINATES;
}

/**
 * Obtient la liste des villes d'un pays
 */
export function getCitiesByCountry(country: string): string[] {
  const normalizedCountry = country.toLowerCase();
  return Object.entries(CITY_COORDINATES)
    .filter(([_, coords]) => coords.country.toLowerCase() === normalizedCountry)
    .map(([city]) => city);
}
