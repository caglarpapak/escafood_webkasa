import { prisma } from '../../config/prisma';
import { BankRecord, BankWithBalance, CreateBankDTO, DeleteBankDTO, UpdateBankDTO } from './banks.types';
import { TransactionsService } from '../transactions/transactions.service';
import { DailyTransactionType, DailyTransactionSource } from '@prisma/client';

const transactionsService = new TransactionsService();

/**
 * Create an opening balance transaction for a newly created bank
 * This ensures the bank's balance is correctly initialized in the transaction system
 */
async function createBankOpeningBalanceTransaction(
  bankId: string,
  initialBalance: number,
  isoDate: string,
  createdBy: string
): Promise<void> {
  // Only create transaction if there's a non-zero opening balance
  if (!initialBalance || initialBalance === 0) {
    return;
  }

  // Fix: Bank opening balance should follow BANK CASH IN mapping: incoming=0, outgoing=0, bankDelta=+amount
  await transactionsService.createTransaction(
    {
      isoDate,
      type: DailyTransactionType.NAKIT_TAHSILAT, // Use NAKIT_TAHSILAT for bank cash in
      source: DailyTransactionSource.BANKA,
      counterparty: null,
      description: 'Açılış bakiyesi',
      incoming: initialBalance, // Will be normalized to 0 by transaction service
      outgoing: 0,
      bankDelta: initialBalance, // Will be normalized correctly by transaction service
      bankId,
      documentNo: null,
      cashAccountId: null,
      creditCardId: null,
      chequeId: null,
      customerId: null,
      supplierId: null,
      attachmentId: null,
      displayIncoming: null,
      displayOutgoing: null,
    },
    createdBy
  );
}

export class BanksService {
  async getAllBanksWithBalances(): Promise<BankWithBalance[]> {
    const [banks, balanceGroups] = await prisma.$transaction([
      prisma.bank.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      }),
      prisma.transaction.groupBy({
        by: ['bankId'],
        _sum: { bankDelta: true },
        where: {
          deletedAt: null,
          bankId: {
            not: null,
          },
        },
        orderBy: {
          bankId: 'asc',
        },
      }),
    ]);

    const balanceMap = new Map<string, number>();
    for (const group of balanceGroups) {
      if (group.bankId && group._sum) {
        balanceMap.set(group.bankId, Number(group._sum.bankDelta ?? 0));
      }
    }

    return banks.map((bank) => ({
      ...bank,
      currentBalance: balanceMap.get(bank.id) ?? 0,
    }));
  }

  async createBank(payload: CreateBankDTO, createdBy: string): Promise<BankWithBalance> {
    const created = await prisma.bank.create({
      data: {
        name: payload.name,
        accountNo: payload.accountNo ?? null,
        iban: payload.iban ?? null,
        createdBy,
      },
    });

    // BUG 2 FIX: Create opening balance transaction but it will be filtered from daily transaction list
    // This transaction is needed for balance calculation (bankDelta) but won't appear in "Gün içi işlemler"
    // The transaction has description "Açılış bakiyesi" which is filtered in listTransactions
    const initialBalance = payload.initialBalance ?? 0;
    if (initialBalance !== 0) {
      // Use today's date for opening balance transaction
      const today = new Date().toISOString().split('T')[0];
      await createBankOpeningBalanceTransaction(created.id, initialBalance, today, createdBy);
    }

    // Calculate current balance (will include opening balance transaction if created)
    const balanceGroups = await prisma.transaction.groupBy({
      by: ['bankId'],
      _sum: { bankDelta: true },
      where: {
        deletedAt: null,
        bankId: created.id,
      },
    });

    const currentBalance = balanceGroups.length > 0 && balanceGroups[0]._sum?.bankDelta
      ? Number(balanceGroups[0]._sum.bankDelta)
      : 0;

    return {
      ...created,
      currentBalance,
    };
  }

  async updateBank(id: string, payload: UpdateBankDTO, updatedBy: string): Promise<BankRecord> {
    const existing = await prisma.bank.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error('Bank not found.');
    }

    const data: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy,
    };

    if (payload.name !== undefined) {
      data.name = payload.name;
    }

    if (payload.accountNo !== undefined) {
      data.accountNo = payload.accountNo ?? null;
    }

    if (payload.iban !== undefined) {
      data.iban = payload.iban ?? null;
    }

    if (payload.isActive !== undefined) {
      data.isActive = payload.isActive;
    }

    const updated = await prisma.bank.update({
      where: { id },
      data,
    });

    return updated;
  }

  async softDeleteBank(id: string, deletedBy: string): Promise<BankRecord> {
    const existing = await prisma.bank.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error('Bank not found.');
    }

    const deleted = await prisma.bank.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy,
      },
    });

    return deleted;
  }
}
