import { Prisma, PaymentStatus } from '@prisma/client';
import { prisma } from '../../config/database.config';
import { paymentProvider } from '../../providers/payment/MockPaymentProvider';
import { WalletService } from './wallet.service';
import { AppError } from '../../common/errors/AppError';

export class FinanceService {
  private static readonly PLATFORM_FEE_PERCENTAGE = new Prisma.Decimal(0.15); // 15%

  static async processRidePayment(userId: string, rideId: string, paymentMethod: any, idempotencyKey: string) {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new AppError('Ride not found', 404);
    if (ride.passengerId !== userId) throw new AppError('Unauthorized', 403);
    if (ride.status !== 'COMPLETED') throw new AppError('Ride is not completed', 400);
    
    const finalFare = ride.finalFare || ride.estimatedFare;

    // Check if already paid
    const existingPayment = await prisma.payment.findUnique({ where: { rideId } });
    if (existingPayment && existingPayment.status === 'SUCCESS') {
      return existingPayment;
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Process payment based on method
      let providerRef = `INTERNAL-${Date.now()}`;
      
      if (paymentMethod === 'WALLET') {
        await WalletService.transact(userId, finalFare, 'DEBIT', `RIDE-${rideId}`, `Payment for Ride ${rideId}`);
      } else if (paymentMethod === 'CARD') {
        const intent = {
          amount: finalFare.times(100).toNumber(), // Cents
          currency: 'ZAR',
          reference: `RIDE-${rideId}`,
          paymentMethod: 'CARD'
        };
        const result = await paymentProvider.processPayment(intent);
        if (!result.success) throw new AppError('Card payment failed', 402);
        providerRef = result.transactionId;
      }

      // 2. Create Payment Record
      const payment = await tx.payment.upsert({
        where: { rideId },
        update: { status: PaymentStatus.SUCCESS, providerRef },
        create: {
          rideId,
          amount: finalFare,
          method: paymentMethod,
          status: PaymentStatus.SUCCESS,
          providerRef,
          idempotencyKey,
        }
      });

      // 3. Calculate and allocate Driver Earnings
      if (ride.driverId) {
        const platformFee = finalFare.times(this.PLATFORM_FEE_PERCENTAGE).toDecimalPlaces(2);
        const netEarning = finalFare.minus(platformFee);

        await tx.driverEarning.create({
          data: {
            rideId,
            driverId: ride.driverId,
            grossFare: finalFare,
            platformFee,
            netEarning,
          }
        });

        // Credit Driver's Wallet
        await WalletService.transact(ride.driverId, netEarning, 'CREDIT', `EARNING-${rideId}`, `Earnings for Ride ${rideId}`);
      }

      // 4. Generate basic receipt record
      await tx.rideReceipt.create({
        data: {
          rideId,
          receiptUrl: `https://afriride.com/receipts/${rideId}`, // Mocked generation
        }
      });

      return payment;
    });
  }

  static async addFundsToWallet(userId: string, amountStr: number, idempotencyKey: string) {
    const amount = new Prisma.Decimal(amountStr);
    
    // In production, initiate external payment provider checkout here.
    // For MVP/architecture, we simulate immediate success.
    const intent = {
      amount: amount.times(100).toNumber(),
      currency: 'ZAR',
      reference: `TOPUP-${Date.now()}`,
      paymentMethod: 'CARD'
    };
    
    const result = await paymentProvider.processPayment(intent);
    if (!result.success) throw new AppError('Top-up payment failed', 402);

    await WalletService.transact(userId, amount, 'CREDIT', result.transactionId, 'Wallet Top-up');
    
    return { success: true, newBalance: await WalletService.getBalance(userId) };
  }
}
