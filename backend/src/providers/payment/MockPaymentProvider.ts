import { PaymentProvider, PaymentIntent, PaymentResult } from './PaymentProvider';
import { logger } from '../../config/logger.config';
import { env } from '../../config/env.config';

export class MockPaymentProvider implements PaymentProvider {
  async processPayment(intent: PaymentIntent): Promise<PaymentResult> {
    if (env.NODE_ENV === 'production') {
      throw new Error('MockPaymentProvider cannot be used in production. Use Paystack, Yoco, etc.');
    }
    logger.info({ intent }, '[MockPayment] Processing payment intent');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      transactionId: `mock-txn-${Date.now()}`,
      status: 'SUCCESS'
    };
  }

  async processPayout(driverAccountId: string, amountCents: number): Promise<PaymentResult> {
    if (env.NODE_ENV === 'production') throw new Error('MockPaymentProvider used in prod');
    logger.info(`[MockPayout] Paying ${amountCents} cents to ${driverAccountId}`);
    return {
      success: true,
      transactionId: `mock-payout-${Date.now()}`,
      status: 'SUCCESS'
    };
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
