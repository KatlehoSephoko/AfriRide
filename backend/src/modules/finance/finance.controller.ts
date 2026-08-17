import { Request, Response, NextFunction } from 'express';
import { FinanceService } from './finance.service';
import { WalletService } from './wallet.service';
import { successResponse } from '../../common/utils/api-response';

export const processRidePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    const payment = await FinanceService.processRidePayment(req.user!.userId, req.body.rideId, req.body.paymentMethod, idempotencyKey);
    res.status(200).json(successResponse(payment, 'Payment processed successfully'));
  } catch (error) {
    next(error);
  }
};

export const addFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    const result = await FinanceService.addFundsToWallet(req.user!.userId, req.body.amount, idempotencyKey);
    res.status(200).json(successResponse(result, 'Funds added to wallet'));
  } catch (error) {
    next(error);
  }
};

export const getWalletBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const balance = await WalletService.getBalance(req.user!.userId);
    res.status(200).json(successResponse({ balance }));
  } catch (error) {
    next(error);
  }
};
