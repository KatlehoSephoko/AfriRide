import { MapsProvider, RouteCalculation } from './MapsProvider';
import { env } from '../../config/env.config';

/**
 * Development Mock for route calculation. 
 * Replaced by Google Maps / Mapbox provider in production via DI.
 */
export class MockMapsProvider implements MapsProvider {
  async calculateRoute(originLat: number, originLng: number, destLat: number, destLng: number): Promise<RouteCalculation> {
    if (env.NODE_ENV === 'production') {
      throw new Error('MockMapsProvider cannot be used in production.');
    }
    
    // Haversine formula approximation for mock distance
    const R = 6371e3; // metres
    const φ1 = originLat * Math.PI/180;
    const φ2 = destLat * Math.PI/180;
    const Δφ = (destLat-originLat) * Math.PI/180;
    const Δλ = (destLng-originLng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceMeters = Math.floor(R * c);

    // Assume average urban speed of 40 km/h (11.1 m/s)
    const durationSeconds = Math.floor(distanceMeters / 11.1);

    return {
      distanceMeters,
      durationSeconds,
      polyline: "mock_encoded_polyline_string_replace_with_actual",
    };
  }
}

export const mapsProvider: MapsProvider = new MockMapsProvider();
