import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.config';
import { AppError } from '../../common/errors/AppError';

export class WalletService {
  
  /**
   * Processes an atomic wallet credit/debit using a database transaction.
   * Ensures the balance never falls below zero.
   */
  static async transact(userId: string, amount: Prisma.Decimal, type: 'CREDIT' | 'DEBIT', reference: string, description: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get or create wallet
      let wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { userId, balance: new Prisma.Decimal(0) } });
      }

      // 2. Calculate new balance
      const newBalance = type === 'CREDIT' 
        ? wallet.balance.plus(amount) 
        : wallet.balance.minus(amount);

      if (newBalance.isNegative()) {
        throw new AppError('Insufficient wallet balance', 400);
      }

      // 3. Insert immutable transaction ledger record
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type,
          reference,
          description
        }
      });

      // 4. Update aggregate balance
      return await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance }
      });
    });
  }

  static async getBalance(userId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    return wallet?.balance || new Prisma.Decimal(0);
  }
}
