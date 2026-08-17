export interface RouteCalculation {
  distanceMeters: number;
  durationSeconds: number;
  polyline: string;
}

export interface MapsProvider {
  calculateRoute(
    originLat: number, originLng: number, 
    destLat: number, destLng: number
  ): Promise<RouteCalculation>;
}
