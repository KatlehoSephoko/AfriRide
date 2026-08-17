import crypto from 'crypto';
import { prisma } from '../../config/database.config';
import { verificationQueue } from '../../jobs/verification.queue';
import { PricingEngine } from '../pricing/pricing.engine';
import { mapsProvider } from '../../providers/maps/MockMapsProvider';
import { notificationProvider } from '../../providers/notifications/MockNotificationProvider';
import { AppError } from '../../common/errors/AppError';
import { RideStatus } from '@prisma/client';

export class TripsService {
  
  static async requestForFriend(requesterId: string, data: any) {
    // 1. Calc pricing
    const route = await mapsProvider.calculateRoute(data.pickupLat, data.pickupLng, data.destinationLat, data.destinationLng);
    const estimatedFare = PricingEngine.calculateEstimatedFare(route.distanceMeters, route.durationSeconds, data.requiresAccessibleTier);

    // 2. Generate secure token
    const token = crypto.randomInt(100000, 999999).toString();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // 3. Create Ride in TOKEN_SENT state using transaction
    const ride = await prisma.$transaction(async (tx) => {
      const newRide = await tx.ride.create({
        data: {
          passengerId: requesterId, // The requester initially holds the liability
          status: RideStatus.TOKEN_SENT,
          pickupLat: data.pickupLat,
          pickupLng: data.pickupLng,
          pickupAddress: data.pickupAddress,
          destinationLat: data.destinationLat,
          destinationLng: data.destinationLng,
          destinationAddress: data.destinationAddress,
          requiresAccessibleTier: data.requiresAccessibleTier,
          estimatedFare,
        }
      });

      await tx.rideVerification.create({
        data: {
          rideId: newRide.id,
          requesterId,
          passengerPhone: data.passengerPhone,
          tokenHash,
          expiresAt: new Date(Date.now() + 180000), // 180 seconds from now
        }
      });

      return newRide;
    });

    // 4. Send SMS to friend
    await notificationProvider.send({
      userId: 'SYSTEM', // Using system for guest SMS
      title: 'AfriRide Verification',
      body: `Your friend ordered an AfriRide for you. Verify with code: ${token} within 3 minutes.`,
      channels: ['SMS'],
      data: { phone: data.passengerPhone }
    });

    // 5. Start Redis 180-second Expiration Job
    await verificationQueue.add('verify-timeout', { rideId: ride.id }, { delay: 180000 });

    return { rideId: ride.id, status: RideStatus.TOKEN_SENT };
  }

  static async verifyPassenger(rideId: string, token: string) {
    const verification = await prisma.rideVerification.findUnique({ where: { rideId } });
    if (!verification) throw new AppError('Verification not found', 404);

    if (verification.isVerified) throw new AppError('Already verified', 400);
    if (new Date() > verification.expiresAt) throw new AppError('Verification expired', 400);

    const providedHash = crypto.createHash('sha256').update(token).digest('hex');
    if (providedHash !== verification.tokenHash) throw new AppError('Invalid token', 401);

    // RACE CONDITION HANDLING:
    // Update ride status ONLY IF it's still in TOKEN_SENT state.
    const result = await prisma.ride.updateMany({
      where: { 
        id: rideId, 
        status: RideStatus.TOKEN_SENT 
      },
      data: { status: RideStatus.VERIFIED }
    });

    if (result.count === 0) {
      throw new AppError('Ride cancellation or timeout already occurred', 409);
    }

    // Mark verification as used
    await prisma.rideVerification.update({
      where: { id: verification.id },
      data: { isVerified: true }
    });

    // At this point, the matching engine would automatically look for drivers.
    return { rideId, status: RideStatus.VERIFIED };
  }
}
