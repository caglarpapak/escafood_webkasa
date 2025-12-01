import { prisma } from '../../config/prisma';
import {
  CreateTransactionDTO,
  DeleteTransactionDTO,
  PaginatedTransactions,
  TransactionQueryDTO,
  UpdateTransactionDTO,
  TransactionRecord,
} from './transactions.types';
import { normalizeAmounts, validateTransactionBusinessRules } from './transactions.validation';

export class TransactionsService {
  async createTransaction(payload: CreateTransactionDTO): Promise<TransactionRecord> {
    const normalized = normalizeAmounts(payload);
    validateTransactionBusinessRules(normalized);

    const created = await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.create({
        data: this.mapToPrismaCreate(normalized),
      });

      await this.recomputeCashBalances(tx);
      return transaction;
    });

    return created;
  }

  async getTransactions(query: TransactionQueryDTO): Promise<PaginatedTransactions> {
    const { from, to, type, source, bankId, creditCardId, chequeId, search, page, pageSize } = query;

    const where: Record<string, any> = {
      deletedAt: null,
    };

    if (from || to) {
      where.isoDate = {};
      if (from) {
        where.isoDate.gte = from;
      }
      if (to) {
        where.isoDate.lte = to;
      }
    }

    if (type) {
      where.type = type;
    }

    if (source) {
      where.source = source;
    }

    if (bankId) {
      where.bankId = bankId;
    }

    if (creditCardId) {
      where.creditCardId = creditCardId;
    }

    if (chequeId) {
      where.chequeId = chequeId;
    }

    if (search) {
      where.OR = [
        { counterparty: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { documentNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = ((page ?? 1) - 1) * (pageSize ?? 50);
    const take = pageSize ?? 50;

    const [items, totalCount] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: [
          { isoDate: 'asc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
      }),
      prisma.transaction.count({ where }),
    ]);

    return { items, totalCount };
  }

  async updateTransaction(id: string, payload: UpdateTransactionDTO): Promise<TransactionRecord> {
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error('Transaction not found.');
    }

    const normalized = normalizeAmounts(payload);
    validateTransactionBusinessRules(normalized, { isUpdate: true });

    const updated = await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.update({
        where: { id },
        data: this.mapToPrismaUpdate(normalized),
      });

      await this.recomputeCashBalances(tx);
      return transaction;
    });

    return updated;
  }

  async deleteTransaction(id: string, payload: DeleteTransactionDTO): Promise<TransactionRecord> {
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error('Transaction not found.');
    }

    const deleted = await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: payload.deletedBy,
        },
      });

      await this.recomputeCashBalances(tx);
      return transaction;
    });

    return deleted;
  }

  private mapToPrismaCreate(payload: CreateTransactionDTO): Record<string, unknown> {
    return {
      isoDate: payload.isoDate,
      documentNo: payload.documentNo ?? null,
      type: payload.type,
      source: payload.source,
      counterparty: payload.counterparty ?? null,
      description: payload.description ?? null,
      incoming: payload.incoming,
      outgoing: payload.outgoing,
      bankDelta: payload.bankDelta,
      displayIncoming:
        payload.displayIncoming && Math.abs(payload.displayIncoming) > 0
          ? payload.displayIncoming
          : null,
      displayOutgoing:
        payload.displayOutgoing && Math.abs(payload.displayOutgoing) > 0
          ? payload.displayOutgoing
          : null,
      balanceAfter: 0,
      cashAccountId: payload.cashAccountId ?? null,
      bankId: payload.bankId ?? null,
      creditCardId: payload.creditCardId ?? null,
      chequeId: payload.chequeId ?? null,
      customerId: payload.customerId ?? null,
      supplierId: payload.supplierId ?? null,
      attachmentId: payload.attachmentId ?? null,
      createdBy: payload.createdBy,
    };
  }

  private mapToPrismaUpdate(payload: UpdateTransactionDTO): Record<string, unknown> {
    return {
      isoDate: payload.isoDate,
      documentNo: payload.documentNo ?? null,
      type: payload.type,
      source: payload.source,
      counterparty: payload.counterparty ?? null,
      description: payload.description ?? null,
      incoming: payload.incoming,
      outgoing: payload.outgoing,
      bankDelta: payload.bankDelta,
      displayIncoming:
        payload.displayIncoming && Math.abs(payload.displayIncoming) > 0
          ? payload.displayIncoming
          : null,
      displayOutgoing:
        payload.displayOutgoing && Math.abs(payload.displayOutgoing) > 0
          ? payload.displayOutgoing
          : null,
      cashAccountId: payload.cashAccountId ?? null,
      bankId: payload.bankId ?? null,
      creditCardId: payload.creditCardId ?? null,
      chequeId: payload.chequeId ?? null,
      customerId: payload.customerId ?? null,
      supplierId: payload.supplierId ?? null,
      attachmentId: payload.attachmentId ?? null,
      updatedAt: new Date(),
      updatedBy: payload.updatedBy,
    };
  }

  private async recomputeCashBalances(tx: any): Promise<void> {
    const transactions = await tx.transaction.findMany({
      where: { deletedAt: null },
      orderBy: [
        { isoDate: 'asc' },
        { createdAt: 'asc' },
        { id: 'asc' },
      ],
    });

    let runningBalance = 0;

    for (const t of transactions) {
      const incoming = Number(t.incoming ?? 0);
      const outgoing = Number(t.outgoing ?? 0);
      runningBalance = runningBalance + incoming - outgoing;
      await tx.transaction.update({
        where: { id: t.id },
        data: { balanceAfter: runningBalance },
      });
    }
  }
}
