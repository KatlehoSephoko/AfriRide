export interface PaymentIntent {
  amount: number; // in Cents to avoid floating point issues at the provider level
  currency: string;
  reference: string;
  paymentMethod: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  rawResponse?: any;
}

export interface PaymentProvider {
  processPayment(intent: PaymentIntent): Promise<PaymentResult>;
  processPayout(driverAccountId: string, amountCents: number): Promise<PaymentResult>;
}
