import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis.config';
import { prisma } from '../config/database.config';
import { logger } from '../config/logger.config';
import { RideStatus } from '@prisma/client';

export const verificationQueue = new Queue('verification-timer', { connection: redis });

export const verificationWorker = new Worker('verification-timer', async (job: Job) => {
  const { rideId } = job.data;
  
  // RACE CONDITION HANDLING:
  // Conditional update ensures that if the passenger verified a millisecond ago,
  // this update fails (because status would be VERIFIED, not TOKEN_SENT).
  const result = await prisma.ride.updateMany({
    where: { 
      id: rideId, 
      status: RideStatus.TOKEN_SENT // Must strictly still be waiting
    },
    data: {
      status: RideStatus.CANCELLED,
      cancellationReason: 'VERIFICATION_TIMEOUT',
      cancelledAt: new Date(),
      cancelledBy: 'SYSTEM'
    }
  });

  if (result.count > 0) {
    logger.info(`[Verification Queue] Ride ${rideId} cancelled due to verification timeout (180s expired).`);
    // Note: Emit Socket.io event here to notify requester in production.
  }
}, { connection: redis });

verificationWorker.on('failed', (job, err) => {
  logger.error({ err }, `[Verification Queue] Job failed for ride ${job?.data.rideId}`);
});
