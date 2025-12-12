import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/prisma';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionListQuery,
  TransactionListResponse,
  TransactionDto,
} from './transactions.types';
import { normalizeTransactionPayload } from './transactions.normalization';

/**
 * Calculate cash balance after a transaction
 * 
 * Refactored to be more robust:
 * - Accepts cashAccountId (optional) for future multi-account support
 * - Uses storedSource from transaction records (not client-provided source)
 * - Computes balance using aggregate or ordered findMany
 * - Handles exclusion of current transaction for updates
 * 
 * Rules:
 * - Only transactions with source = KASA affect cash balance
 * - Bank transactions (source = BANKA) do NOT affect cash balance
 * - Balance = Σ(incoming - outgoing) for all KASA transactions up to isoDate (inclusive)
 * - Transactions are ordered by isoDate (asc), then createdAt (asc) for consistency
 * 
 * @param isoDate - Date up to which to calculate balance (inclusive)
 * @param incoming - Incoming amount for current transaction
 * @param outgoing - Outgoing amount for current transaction
 * @param storedSource - Source stored in DB (KASA or BANKA)
 * @param excludeTransactionId - Optional transaction ID to exclude from calculation
 * @param cashAccountId - Optional cash account ID (for future multi-account support)
 * @returns Calculated cash balance after the transaction
 */
async function calculateBalanceAfter(
  isoDate: string,
  incoming: number,
  outgoing: number,
  storedSource: string,
  excludeTransactionId?: string,
  cashAccountId?: string | null
): Promise<number> {
  // Build where clause: only KASA transactions affect cash balance
  const where: any = {
    deletedAt: null,
    isoDate: { lte: isoDate },
    source: 'KASA', // Only include KASA transactions in cash balance calculation
  };

  // Exclude specific transaction (for updates)
  if (excludeTransactionId) {
    where.id = { not: excludeTransactionId };
  }

  // Future: filter by cashAccountId if provided
  if (cashAccountId) {
    where.cashAccountId = cashAccountId;
  }

  // Use aggregate for better performance on large datasets
  // But we need chronological order, so use findMany with ordering
  const transactions = await prisma.transaction.findMany({
    where,
    select: {
      incoming: true,
      outgoing: true,
    },
    orderBy: [
      { isoDate: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  // Calculate running balance: sum of (incoming - outgoing) for all transactions
  let balance = 0;
  for (const tx of transactions) {
    const cashDelta = Number(tx.incoming) - Number(tx.outgoing);
    balance += cashDelta;
  }

  // Add current transaction if it's a KASA transaction
  if (storedSource === 'KASA') {
    const cashDelta = incoming - outgoing;
    balance += cashDelta;
  }

  return balance;
}

export class TransactionsService {
  /**
   * Create a new transaction
   * 
   * STRICT TRANSACTION MAPPING:
   * 1) CASH IN (NAKIT_TAHSILAT, source=KASA): incoming=amount, outgoing=0, bankDelta=0
   * 2) CASH OUT (NAKIT_ODEME, source=KASA): incoming=0, outgoing=amount, bankDelta=0
   * 3) BANK CASH IN (NAKIT_TAHSILAT, source=BANKA): incoming=0, outgoing=0, bankDelta=+amount
   * 4) BANK CASH OUT (NAKIT_ODEME, source=BANKA): incoming=0, outgoing=amount, bankDelta=-amount
   * 5) POS COLLECTION (POS_TAHSILAT_BRUT): incoming=0, outgoing=0, bankDelta=+netAmount
   * 6) CREDIT CARD EXPENSE: incoming=0, outgoing=0, bankDelta=0 (cardDebtDelta handled separately)
   * 7) CREDIT CARD PAYMENT: source=BANKA, outgoing=amount, bankDelta=-amount
   */
  async createTransaction(data: CreateTransactionDto, createdBy: string): Promise<TransactionDto> {
    // Normalize transaction payload to canonical form
    const normalized = normalizeTransactionPayload(data);
    const { incoming, outgoing, bankDelta, storedSource } = normalized;

    // Calculate balance after using normalized amounts and stored source
    const balanceAfter = await calculateBalanceAfter(
      data.isoDate,
      incoming,
      outgoing,
      storedSource,
      undefined, // No exclusion for new transactions
      data.cashAccountId ?? null
    );

    // Data has already been validated by Zod schema, so bankId and creditCardId are either
    // valid UUID strings or null. We just need to ensure they're properly typed.
    const bankId: string | null = data.bankId && typeof data.bankId === 'string' ? data.bankId : null;
    const creditCardId: string | null = data.creditCardId && typeof data.creditCardId === 'string' ? data.creditCardId : null;

    // If bankId is provided, verify the bank exists (defensive check)
    if (bankId) {
      const bank = await prisma.bank.findUnique({
        where: { id: bankId },
        select: { id: true, name: true, deletedAt: true },
      });
      if (!bank) {
        // Log available banks for debugging
        const allBanks = await prisma.bank.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true },
          take: 10,
        });
        console.error(`Bank with ID ${bankId} not found. Available banks:`, allBanks.map(b => ({ id: b.id, name: b.name })));
        
        // Create a custom error that can be identified as a client error (400)
        const error = new Error(`Bank with ID ${bankId} not found. Please select a valid bank.`);
        (error as any).statusCode = 400;
        (error as any).isClientError = true;
        throw error;
      }
      if (bank.deletedAt) {
        const error = new Error(`Bank "${bank.name}" (ID: ${bankId}) has been deleted`);
        (error as any).statusCode = 400;
        (error as any).isClientError = true;
        throw error;
      }
      console.log(`Bank verified: ${bank.name} (${bank.id})`);
    }

    // Log for debugging - detailed logging with normalized values
    console.log('=== CREATE TRANSACTION SERVICE ===');
    console.log('Input data:', JSON.stringify(data, null, 2));
    console.log('Normalized amounts:', { incoming, outgoing, bankDelta, storedSource });
    console.log('bankId:', bankId);
    console.log('creditCardId:', creditCardId);
    console.log('Balance after:', balanceAfter);
    console.log('Created by:', createdBy);
    // Prepare Prisma data - ensure all FKs are either valid UUID strings or null
    // Data has already been validated by Zod, so we can trust the types
    const prismaData = {
      isoDate: data.isoDate,
      documentNo: data.documentNo ?? null,
      type: data.type,
      source: storedSource, // Use normalized stored source
      counterparty: data.counterparty ?? null,
      description: data.description ?? null,
      incoming: incoming, // Use normalized incoming
      outgoing: outgoing, // Use normalized outgoing
      bankDelta: bankDelta, // Use normalized bankDelta
      displayIncoming: data.displayIncoming ?? null,
      displayOutgoing: data.displayOutgoing ?? null,
      balanceAfter: balanceAfter,
      cashAccountId: data.cashAccountId ?? null,
      bankId: bankId, // Already validated as UUID string or null by Zod
      creditCardId: creditCardId, // Already validated as UUID string or null by Zod
      chequeId: data.chequeId ?? null,
      customerId: data.customerId ?? null,
      supplierId: data.supplierId ?? null,
      attachmentId: data.attachmentId ?? null,
      loanInstallmentId: data.loanInstallmentId ?? null,
      createdBy,
    };

    console.log('Prisma create data (normalized):', JSON.stringify(prismaData, null, 2));

    try {
      const transaction = await prisma.transaction.create({
        data: prismaData,
      });

      console.log('Transaction created successfully:', transaction.id);
      return this.mapToDto(transaction);
    } catch (error: any) {
      // Handle Prisma foreign key constraint errors
      if (error?.code === 'P2003') {
        const field = error.meta?.field_name || 'foreign key';
        const target = error.meta?.target || 'unknown';
        console.error('=== FOREIGN KEY CONSTRAINT VIOLATION ===');
        console.error('Field:', field);
        console.error('Target:', target);
        console.error('Full error:', JSON.stringify(error.meta, null, 2));
        console.error('Prisma data that failed:', JSON.stringify(prismaData, null, 2));
        throw new Error(`Invalid ${field} (${target}): The referenced record does not exist. bankId=${prismaData.bankId}`);
      }
      // Log other Prisma errors
      console.error('=== PRISMA ERROR ===');
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Full error:', error);
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Update a transaction
   */
  async updateTransaction(
    id: string,
    data: UpdateTransactionDto,
    updatedBy: string
  ): Promise<TransactionDto> {
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Transaction not found');
    }

    if (existing.deletedAt) {
      throw new Error('Cannot update deleted transaction');
    }

    // Recalculate balance if amounts changed
    // Use normalized values if source/type changed, otherwise use existing
    const incoming = data.incoming !== undefined ? data.incoming : Number(existing.incoming);
    const outgoing = data.outgoing !== undefined ? data.outgoing : Number(existing.outgoing);
    const isoDate = data.isoDate || existing.isoDate;
    // Use stored source from existing transaction (or normalized if type changed)
    const storedSource = data.source || existing.source;
    const cashAccountId = data.cashAccountId !== undefined ? data.cashAccountId : existing.cashAccountId;
    const balanceAfter = await calculateBalanceAfter(isoDate, incoming, outgoing, storedSource, id, cashAccountId);

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        incoming: data.incoming !== undefined ? data.incoming : existing.incoming,
        outgoing: data.outgoing !== undefined ? data.outgoing : existing.outgoing,
        bankDelta: data.bankDelta !== undefined ? data.bankDelta : existing.bankDelta,
        balanceAfter,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    return this.mapToDto(updated);
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<TransactionDto | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.deletedAt) {
      return null;
    }

    return this.mapToDto(transaction);
  }

  /**
   * List transactions with filters
   */
  async listTransactions(query: TransactionListQuery): Promise<TransactionListResponse> {
    const where: any = {
      deletedAt: null,
      // BUG 2 FIX: Exclude synthetic "Açılış bakiyesi" transactions from daily transaction list
      // These are created for bank opening balances but should not appear in "Gün içi işlemler"
      // Use OR condition to include null descriptions (normal transactions) or non-"Açılış bakiyesi" descriptions
      OR: [
        { description: null },
        { description: { not: 'Açılış bakiyesi' } },
      ],
    };

    if (query.from || query.to) {
      where.isoDate = {};
      if (query.from) {
        where.isoDate.gte = query.from;
      }
      if (query.to) {
        where.isoDate.lte = query.to;
      }
    }

    if (query.documentNo) {
      where.documentNo = { contains: query.documentNo, mode: 'insensitive' };
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.source) {
      where.source = query.source;
    }

    if (query.counterparty) {
      where.counterparty = { contains: query.counterparty, mode: 'insensitive' };
    }

    if (query.description) {
      where.description = { contains: query.description, mode: 'insensitive' };
    }

    if (query.bankId) {
      where.bankId = query.bankId;
    }

    if (query.creditCardId) {
      where.creditCardId = query.creditCardId;
    }

    if (query.createdBy) {
      where.createdBy = query.createdBy;
    }

    if (query.search) {
      where.OR = [
        { documentNo: { contains: query.search, mode: 'insensitive' } },
        { counterparty: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const skip = (page - 1) * pageSize;

    // Fix Bug 8: Default sort order is ascending by date (oldest to newest)
    const sortKey = query.sortKey || 'isoDate';
    const sortDir = query.sortDir || 'asc';
    
    // Build orderBy array based on sortKey
    const orderBy: any[] = [];
    if (sortKey === 'isoDate') {
      // For date sorting, use isoDate first, then createdAt as secondary sort
      orderBy.push({ isoDate: sortDir });
      orderBy.push({ createdAt: sortDir });
    } else {
      // For other fields, use the sortKey directly
      orderBy.push({ [sortKey]: sortDir });
      // Add isoDate as secondary sort for consistency
      orderBy.push({ isoDate: 'asc' });
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calculate totals from ALL matching transactions (not just current page)
    const allTransactions = await prisma.transaction.findMany({
      where,
      select: {
        incoming: true,
        outgoing: true,
      },
    });

    const totalIncoming = allTransactions.reduce((sum: number, tx) => sum + Number(tx.incoming), 0);
    const totalOutgoing = allTransactions.reduce((sum: number, tx) => sum + Number(tx.outgoing), 0);

    return {
      items: transactions.map((tx) => this.mapToDto(tx)),
      totalCount,
      totalIncoming,
      totalOutgoing,
    };
  }

  /**
   * Soft delete a transaction
   */
  async deleteTransaction(id: string, deletedBy: string): Promise<void> {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.deletedAt) {
      throw new Error('Transaction already deleted');
    }

    await prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Map Prisma transaction to DTO
   */
  private mapToDto(transaction: any): TransactionDto {
    return {
      id: transaction.id,
      isoDate: transaction.isoDate,
      documentNo: transaction.documentNo,
      type: transaction.type,
      source: transaction.source,
      counterparty: transaction.counterparty,
      description: transaction.description,
      incoming: Number(transaction.incoming),
      outgoing: Number(transaction.outgoing),
      bankDelta: Number(transaction.bankDelta),
      displayIncoming: transaction.displayIncoming ? Number(transaction.displayIncoming) : null,
      displayOutgoing: transaction.displayOutgoing ? Number(transaction.displayOutgoing) : null,
      balanceAfter: Number(transaction.balanceAfter),
      cashAccountId: transaction.cashAccountId,
      bankId: transaction.bankId,
      creditCardId: transaction.creditCardId,
      chequeId: transaction.chequeId,
      customerId: transaction.customerId,
      supplierId: transaction.supplierId,
      attachmentId: transaction.attachmentId,
      loanInstallmentId: transaction.loanInstallmentId,
      createdAt: transaction.createdAt.toISOString(),
      createdBy: transaction.createdBy,
      updatedAt: transaction.updatedAt?.toISOString() || null,
      updatedBy: transaction.updatedBy || null,
      deletedAt: transaction.deletedAt?.toISOString() || null,
      deletedBy: transaction.deletedBy || null,
    };
  }
}

