import { prisma } from '../../config/database.config';
import { AppError } from '../../common/errors/AppError';

export class MatchingService {
  /**
   * Finds nearby ONLINE drivers using PostGIS ST_DWithin.
   * Enforces strict accessibility rules.
   */
  static async findNearbyDrivers(
    lat: number, 
    lng: number, 
    requiresAccessibleTier: boolean,
    radiusMeters: number = 5000,
    limit: number = 10
  ) {
    // 1. Base PostGIS Query matching driver locations within radius
    const baseQuery = `
      SELECT dp.id as "driverId", v.id as "vehicleId", ST_Distance(dl.geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distance
      FROM "driver_locations" dl
      JOIN "driver_profiles" dp ON dl."driverId" = dp.id
      JOIN "vehicles" v ON v."driverId" = dp.id
      WHERE dp.status = 'ONLINE'
      AND v."verificationStatus" = 'VERIFIED'
      AND ST_DWithin(dl.geom, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
    `;

    // 2. Accessibility Filtering Constraint
    const accessibilityConstraint = requiresAccessibleTier 
      ? `AND dp."isAccessibleCertified" = true AND v."isWAV" = true` 
      : ``;

    const orderLimit = `ORDER BY distance ASC LIMIT $4`;

    const fullQuery = `${baseQuery} ${accessibilityConstraint} ${orderLimit}`;

    // 3. Execute Raw SQL
    const drivers = await prisma.$queryRawUnsafe<any[]>(
      fullQuery,
      lng, // Note: PostGIS is Longitude, Latitude
      lat,
      radiusMeters,
      limit
    );

    return drivers;
  }
}
