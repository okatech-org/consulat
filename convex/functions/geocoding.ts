import { action } from '../_generated/server';
import { v } from 'convex/values';

export const getLocationCoordinates = action({
  args: {
    city: v.string(),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    const address = args.country
      ? `${args.city}, ${args.country}`
      : args.city;

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', apiKey);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        return {
          latitude: 46.603354,
          longitude: 1.888334,
        };
      }

      if (data.status !== 'OK') {
        throw new Error(`Geocoding API error: ${data.status}`);
      }

      const location = data.results[0]?.geometry?.location;
      if (!location) {
        return {
          latitude: 46.603354,
          longitude: 1.888334,
        };
      }

      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } catch (error) {
      console.error('Error geocoding location:', error);
      return {
        latitude: 46.603354,
        longitude: 1.888334,
      };
    }
  },
});

