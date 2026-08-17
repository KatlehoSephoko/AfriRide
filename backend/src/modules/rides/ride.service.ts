import { prisma } from '../../config/database.config';
import { AppError } from '../../common/errors/AppError';
import { mapsProvider } from '../../providers/maps/MockMapsProvider';
import { PricingEngine } from '../pricing/pricing.engine';
import { MatchingService } from '../matching/matching.service';
import { RideStatus } from '@prisma/client';

export class RideService {
  
  static async requestRide(passengerId: string, data: any) {
    // 1. Check if passenger already has an active ride
    const activeRide = await prisma.ride.findFirst({
      where: {
        passengerId,
        status: { in: [RideStatus.REQUESTED, RideStatus.TOKEN_SENT, RideStatus.VERIFIED, RideStatus.DRIVER_ASSIGNED, RideStatus.DRIVER_EN_ROUTE, RideStatus.ARRIVED, RideStatus.IN_TRIP] }
      }
    });

    if (activeRide) throw new AppError('You already have an active ride', 400);

    // 2. Calculate Distance and Pricing
    const route = await mapsProvider.calculateRoute(
      data.pickupLat, data.pickupLng, data.destinationLat, data.destinationLng
    );
    const estimatedFare = PricingEngine.calculateEstimatedFare(route.distanceMeters, route.durationSeconds, data.requiresAccessibleTier);

    // 3. Apply Wait-Time Empathy Rule
    const gracePeriodMinutes = data.requiresAccessibleTier ? 12 : 3;

    // 4. Create Ride (Initial status: REQUESTED)
    const ride = await prisma.ride.create({
      data: {
        passengerId,
        pickupLat: data.pickupLat,
        pickupLng: data.pickupLng,
        pickupAddress: data.pickupAddress,
        destinationLat: data.destinationLat,
        destinationLng: data.destinationLng,
        destinationAddress: data.destinationAddress,
        paymentMethod: data.paymentMethod,
        requiresAccessibleTier: data.requiresAccessibleTier,
        gracePeriodMinutes,
        estimatedFare,
      }
    });

    // 5. Fire asynchronous dispatch event (To be handled via Redis/BullMQ + Socket.io in Phase E/F)
    // For now, we simulate finding drivers to return to the passenger app
    const nearbyDrivers = await MatchingService.findNearbyDrivers(
      data.pickupLat, data.pickupLng, data.requiresAccessibleTier
    );

    return { ride, nearbyDriversFound: nearbyDrivers.length };
  }

  static async acceptRide(driverId: string, rideId: string, vehicleId: string) {
    // CONDITIONAL UPDATE: Solves the Race Condition (Verification vs Cancellation vs Acceptance)
    // Driver can only accept if the ride is REQUESTED or VERIFIED.
    const result = await prisma.ride.updateMany({
      where: { 
        id: rideId, 
        status: { in: [RideStatus.REQUESTED, RideStatus.VERIFIED] } 
      },
      data: {
        driverId,
        vehicleId,
        status: RideStatus.DRIVER_ASSIGNED,
        acceptedAt: new Date(),
      }
    });

    if (result.count === 0) {
      throw new AppError('Ride is no longer available', 409);
    }

    // Set Driver status to IN_TRIP
    await prisma.driverProfile.update({
      where: { id: driverId },
      data: { status: 'IN_TRIP' }
    });

    return await prisma.ride.findUnique({ where: { id: rideId } });
  }

  static async updateRideState(driverId: string, rideId: string, newState: RideStatus, previousStates: RideStatus[]) {
    // Conditional update enforcing strict state transitions
    const result = await prisma.ride.updateMany({
      where: { id: rideId, driverId, status: { in: previousStates } },
      data: { 
        status: newState,
        ...(newState === RideStatus.ARRIVED ? { arrivedAt: new Date() } : {}),
        ...(newState === RideStatus.IN_TRIP ? { startedAt: new Date() } : {}),
      }
    });

    if (result.count === 0) {
      throw new AppError('Invalid state transition or unauthorized access', 409);
    }

    return await prisma.ride.findUnique({ where: { id: rideId } });
  }

  static async completeRide(driverId: string, rideId: string) {
    // Using transaction to ensure financial consistency upon completion
    return await prisma.$transaction(async (tx) => {
      const ride = await tx.ride.findUnique({ where: { id: rideId } });
      if (!ride || ride.driverId !== driverId || ride.status !== RideStatus.IN_TRIP) {
        throw new AppError('Ride cannot be completed', 400);
      }

      // In production, recalculate actual route distance/time here.
      // For MVP, we settle on the estimated fare.
      const finalFare = ride.estimatedFare; 

      await tx.ride.update({
        where: { id: rideId },
        data: {
          status: RideStatus.COMPLETED,
          completedAt: new Date(),
          finalFare,
        }
      });

      await tx.driverProfile.update({
        where: { id: driverId },
        data: { status: 'ONLINE' }
      });

      return { rideId, status: RideStatus.COMPLETED, finalFare };
    });
  }

  static async cancelRide(userId: string, userRole: string, rideId: string, reason?: string) {
    // Fetch ride to check ownership
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new AppError('Ride not found', 404);

    if (userRole === 'PASSENGER' && ride.passengerId !== userId) throw new AppError('Unauthorized', 403);
    if (userRole === 'DRIVER' && ride.driverId !== userId) throw new AppError('Unauthorized', 403);

    // Conditional idempotent update for cancellation race conditions
    const updatableStates = [
      RideStatus.REQUESTED, RideStatus.TOKEN_SENT, RideStatus.VERIFIED, 
      RideStatus.DRIVER_ASSIGNED, RideStatus.DRIVER_EN_ROUTE, RideStatus.ARRIVED
    ];

    const result = await prisma.ride.updateMany({
      where: { id: rideId, status: { in: updatableStates } },
      data: {
        status: RideStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: reason,
      }
    });

    if (result.count === 0) {
      throw new AppError('Ride cannot be cancelled at this stage', 409);
    }

    // Free up driver if one was assigned
    if (ride.driverId) {
      await prisma.driverProfile.update({
        where: { id: ride.driverId },
        data: { status: 'ONLINE' }
      });
    }

    return { rideId, status: RideStatus.CANCELLED };
  }
}
