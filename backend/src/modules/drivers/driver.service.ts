import { prisma } from '../../config/database.config';
import { AppError } from '../../common/errors/AppError';
import { Role, DriverStatus, VerificationStatus } from '@prisma/client';
import { logger } from '../../config/logger.config';

export class DriverService {
  static async onboardDriver(userId: string, data: any) {
    const existingProfile = await prisma.driverProfile.findUnique({ where: { userId } });
    if (existingProfile) {
      throw new AppError('User is already registered as a driver', 400);
    }

    // Wrap in transaction to ensure profile, vehicle, documents, and role update atomically
    const driverProfile = await prisma.$transaction(async (tx) => {
      // 1. Create Profile
      const profile = await tx.driverProfile.create({
        data: {
          userId,
          licenseNumber: data.licenseNumber,
          isAccessibleCertified: false, // Must be manually verified by admin later
        },
      });

      // 2. Add Vehicle
      await tx.vehicle.create({
        data: {
          driverId: profile.id,
          ...data.vehicle,
        },
      });

      // 3. Add Documents
      if (data.documents && data.documents.length > 0) {
        await tx.driverDocument.createMany({
          data: data.documents.map((doc: any) => ({
            driverId: profile.id,
            type: doc.type,
            fileUrl: doc.fileUrl,
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
          })),
        });
      }

      // 4. Upgrade User Role to DRIVER
      await tx.user.update({
        where: { id: userId },
        data: { role: Role.DRIVER },
      });

      return profile;
    });

    return driverProfile;
  }

  static async updateStatus(userId: string, status: 'ONLINE' | 'OFFLINE') {
    const profile = await prisma.driverProfile.findUnique({
      where: { userId },
      include: { vehicles: true, documents: true },
    });

    if (!profile) throw new AppError('Driver profile not found', 404);

    // Business Logic: Prevent going ONLINE if documents/vehicles are not verified
    if (status === 'ONLINE') {
      const activeVehicle = profile.vehicles.find(v => v.verificationStatus === VerificationStatus.VERIFIED);
      if (!activeVehicle) {
        throw new AppError('Cannot go online without a verified vehicle', 403);
      }
      // In production, ensure all mandatory documents are VERIFIED here as well
    }

    await prisma.driverProfile.update({
      where: { id: profile.id },
      data: { status: status as DriverStatus },
    });

    return { status };
  }

  static async updateLocation(userId: string, locationData: { latitude: number, longitude: number, heading?: number, speed?: number, accuracy?: number }) {
    const profile = await prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError('Driver profile not found', 404);
    if (profile.status === 'OFFLINE') throw new AppError('Cannot update location while offline', 400);

    const { latitude, longitude, heading, speed, accuracy } = locationData;

    // Use Raw SQL to atomically insert/update the PostGIS 'geom' Geography column.
    // This allows the matching engine (Phase D) to use ST_DWithin for ultra-fast radius searches.
    await prisma.$executeRaw`
      INSERT INTO "driver_locations" ("driverId", "latitude", "longitude", "heading", "speed", "accuracy", "updatedAt", "geom")
      VALUES (
        ${profile.id}, 
        ${latitude}, 
        ${longitude}, 
        ${heading ?? null}, 
        ${speed ?? null}, 
        ${accuracy ?? null}, 
        NOW(), 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      )
      ON CONFLICT ("driverId") DO UPDATE SET
        "latitude" = EXCLUDED."latitude",
        "longitude" = EXCLUDED."longitude",
        "heading" = EXCLUDED."heading",
        "speed" = EXCLUDED."speed",
        "accuracy" = EXCLUDED."accuracy",
        "updatedAt" = NOW(),
        "geom" = ST_SetSRID(ST_MakePoint(EXCLUDED."longitude", EXCLUDED."latitude"), 4326)::geography;
    `;

    // Emit event to Redis/Socket.io here in later phases
  }
}
