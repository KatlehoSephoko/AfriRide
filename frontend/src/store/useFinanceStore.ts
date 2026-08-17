import { create } from 'zustand';
import { financeApi } from '../api/finance.api';

interface FinanceState {
  balance: number;
  isLoading: boolean;
  paymentMethod: 'CASH' | 'CARD' | 'WALLET';
  fetchBalance: () => Promise<void>;
  setPaymentMethod: (method: 'CASH' | 'CARD' | 'WALLET') => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  balance: 0,
  isLoading: false,
  paymentMethod: 'CASH', // Default for African markets

  fetchBalance: async () => {
    set({ isLoading: true });
    try {
      const response = await financeApi.getWalletBalance();
      // Prisma Decimal returns as a string or number depending on serialization, cast safely
      set({ balance: Number(response.data.balance) });
    } catch (error) {
      console.error('Failed to fetch balance', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setPaymentMethod: (method) => set({ paymentMethod: method }),
}));
