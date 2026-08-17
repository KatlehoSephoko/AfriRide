import { Prisma } from '@prisma/client';

/**
 * Strict server-side pricing engine. 
 * Never uses standard JS floats for financial calculations.
 */
export class PricingEngine {
  private static readonly BASE_FARE = new Prisma.Decimal(15.00); // ZAR
  private static readonly PER_KM = new Prisma.Decimal(8.50);
  private static readonly PER_MINUTE = new Prisma.Decimal(1.50);
  private static readonly MINIMUM_FARE = new Prisma.Decimal(30.00);
  
  // Empathy pricing policy: Accessible rides do not incur surge multipliers in MVP
  static calculateEstimatedFare(distanceMeters: number, durationSeconds: number, isAccessible: boolean): Prisma.Decimal {
    const km = new Prisma.Decimal(distanceMeters).dividedBy(1000);
    const minutes = new Prisma.Decimal(durationSeconds).dividedBy(60);

    const distanceFare = km.times(this.PER_KM);
    const timeFare = minutes.times(this.PER_MINUTE);
    
    let total = this.BASE_FARE.plus(distanceFare).plus(timeFare);

    if (total.lessThan(this.MINIMUM_FARE)) {
      total = this.MINIMUM_FARE;
    }

    // Ensure rounding to 2 decimal places (Cents)
    return total.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
  }
}
