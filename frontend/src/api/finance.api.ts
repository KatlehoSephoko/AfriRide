import { apiClient } from './client';
import * as Crypto from 'expo-crypto';

export const financeApi = {
  getWalletBalance: async () => {
    const response = await apiClient.get('/finance/wallet/balance');
    return response.data;
  },
  
  /**
   * Automatically injects a cryptographically secure UUID into the Idempotency-Key header.
   * This guarantees the backend will not double-charge the user during network retries.
   */
  addFunds: async (amount: number) => {
    const idempotencyKey = Crypto.randomUUID();
    const response = await apiClient.post(
      '/finance/wallet/topup', 
      { amount },
      { headers: { 'Idempotency-Key': idempotencyKey } }
    );
    return response.data;
  },

  processRidePayment: async (rideId: string, paymentMethod: 'CASH' | 'CARD' | 'WALLET') => {
    const idempotencyKey = Crypto.randomUUID();
    const response = await apiClient.post(
      '/finance/payments/ride',
      { rideId, paymentMethod },
      { headers: { 'Idempotency-Key': idempotencyKey } }
    );
    return response.data;
  }
};
