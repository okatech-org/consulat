// Service de géocodage utilisant Google Maps API
interface GeocodingResult {
  lat: number;
  lng: number;
  address: string;
}

interface GeocodingCache {
  [key: string]: GeocodingResult;
}

// Cache en mémoire pour éviter les appels répétés
const geocodingCache: GeocodingCache = {};

export class GeocodingService {
  private static apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  /**
   * Géocode une adresse en utilisant Google Maps API
   */
  static async geocodeAddress(
    address: string,
    city: string,
    country: string
  ): Promise<GeocodingResult | null> {
    if (!this.apiKey) {
      console.error('Clé API Google manquante');
      return null;
    }

    // Utiliser ville + pays comme clé de cache
    const cacheKey = `${city}, ${country}`;
    
    if (geocodingCache[cacheKey]) {
      return geocodingCache[cacheKey];
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results[0]) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        const geocodingResult: GeocodingResult = {
          lat: location.lat,
          lng: location.lng,
          address: result.formatted_address
        };

        // Mettre en cache
        geocodingCache[cacheKey] = geocodingResult;
        
        return geocodingResult;
      } else {
        console.warn(`Géocodage échoué pour ${address}:`, data.status);
        return null;
      }
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
      return null;
    }
  }

  /**
   * Géocode plusieurs adresses en parallèle avec délai
   */
  static async geocodeMultiple(
    locations: Array<{
      address: string;
      city: string;
      country: string;
      count: number;
      id: string;
    }>
  ): Promise<Array<GeocodingResult & { count: number; id: string; city: string; country: string }>> {
    const results = await Promise.all(
      locations.map(async (location, index) => {
        // Délai progressif pour éviter la surcharge API
        await new Promise(resolve => setTimeout(resolve, index * 100));
        
        const geocoded = await this.geocodeAddress(
          location.address,
          location.city,
          location.country
        );
        
        if (geocoded) {
          return {
            ...geocoded,
            count: location.count,
            id: location.id,
            city: location.city,
            country: location.country
          };
        }
        return null;
      })
    );

    return results.filter((result): result is NonNullable<typeof result> => result !== null);
  }

  /**
   * Vider le cache
   */
  static clearCache(): void {
    Object.keys(geocodingCache).forEach(key => {
      delete geocodingCache[key];
    });
  }

  /**
   * Obtenir les statistiques du cache
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: Object.keys(geocodingCache).length,
      keys: Object.keys(geocodingCache)
    };
  }
} 