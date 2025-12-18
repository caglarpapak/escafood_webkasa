import { PrismaClient, DailyTransactionType, DailyTransactionSource } from '@prisma/client';
import prisma from '../../config/prisma';
import {
  CreateCreditCardDto,
  UpdateCreditCardDto,
  CreateExpenseDto,
  CreatePaymentDto,
  CreditCardDto,
  CreditCardOperationDto,
  ExpenseResponse,
  PaymentResponse,
  BulkSaveCreditCardDto,
} from './creditCards.types';

/**
 * Calculate cash balance after a transaction
 */
async function calculateBalanceAfter(
  isoDate: string,
  incoming: number,
  outgoing: number,
  excludeTransactionId?: string
): Promise<number> {
  const where: any = {
    deletedAt: null,
    isoDate: { lte: isoDate },
  };

  if (excludeTransactionId) {
    where.id = { not: excludeTransactionId };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [
      { isoDate: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  let balance = 0;
  for (const tx of transactions) {
    balance += Number(tx.incoming) - Number(tx.outgoing);
  }

  balance += incoming - outgoing;

  return balance;
}

export class CreditCardsService {
  private mapCreditCard(card: any): CreditCardDto {
    const currentDebt = card.operations
      ? card.operations.reduce((sum: number, op: any) => sum + Number(op.amount), 0)
      : 0;
    const lastOperationDate =
      card.operations && card.operations.length > 0 ? card.operations[0].isoDate : null;

    return {
      id: card.id,
      name: card.name,
      bankId: card.bankId,
      limit: card.limit !== null && card.limit !== undefined ? Number(card.limit) : null,
      sonEkstreBorcu: card.sonEkstreBorcu !== null && card.sonEkstreBorcu !== undefined ? Number(card.sonEkstreBorcu) : 0,
      manualGuncelBorc:
        card.manualGuncelBorc !== null && card.manualGuncelBorc !== undefined
          ? Number(card.manualGuncelBorc)
          : null,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      isActive: card.isActive,
      createdAt: card.createdAt.toISOString(),
      createdBy: card.createdBy,
      updatedAt: card.updatedAt?.toISOString() || null,
      updatedBy: card.updatedBy || null,
      deletedAt: card.deletedAt?.toISOString() || null,
      deletedBy: card.deletedBy || null,
      currentDebt,
      lastOperationDate,
      bank: card.bank || null,
    };
  }

  private async logCardState(id: string): Promise<void> {
    if (process.env.DEBUG_CREDIT_CARD_SAVE !== '1') return;
    const fresh = await prisma.creditCard.findUnique({
      where: { id },
      select: { id: true, sonEkstreBorcu: true, manualGuncelBorc: true },
    });
    // eslint-disable-next-line no-console
    console.log('[credit-card-save]', fresh?.id, Number(fresh?.sonEkstreBorcu || 0), fresh?.manualGuncelBorc ? Number(fresh.manualGuncelBorc) : null);
  }

  /**
   * Get all credit cards with computed currentDebt
   */
  async listCreditCards(): Promise<CreditCardDto[]> {
    const cards = await prisma.creditCard.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
        operations: {
          where: {
            deletedAt: null,
          },
          select: {
            isoDate: true,
            amount: true,
          },
          orderBy: {
            isoDate: 'desc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return cards.map((card) => this.mapCreditCard(card));
  }

  /**
   * Get credit card by ID
   */
  async getCreditCardById(id: string): Promise<CreditCardDto | null> {
    const card = await prisma.creditCard.findUnique({
      where: { id },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
        operations: {
          where: {
            deletedAt: null,
          },
          select: {
            isoDate: true,
            amount: true,
          },
          orderBy: {
            isoDate: 'desc',
          },
        },
      },
    });

    if (!card || card.deletedAt) {
      return null;
    }

    return this.mapCreditCard(card);
  }

  /**
   * Create a new credit card
   */
  async createCreditCard(data: CreateCreditCardDto, createdBy: string): Promise<CreditCardDto> {
    const card = await prisma.creditCard.create({
      data: {
        name: data.name,
        bankId: data.bankId || null,
        limit: data.limit !== undefined ? data.limit : null,
        sonEkstreBorcu: data.sonEkstreBorcu ?? 0,
        manualGuncelBorc: data.manualGuncelBorc ?? null,
        closingDay: data.closingDay || null,
        dueDay: data.dueDay || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdBy,
      },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.logCardState(card.id);

    return this.mapCreditCard({ ...card, operations: [] });
  }

  /**
   * Update a credit card
   */
  async updateCreditCard(
    id: string,
    data: UpdateCreditCardDto,
    updatedBy: string
  ): Promise<CreditCardDto> {
    const card = await prisma.creditCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new Error('Credit card not found');
    }

    if (card.deletedAt) {
      throw new Error('Cannot update deleted credit card');
    }

    const updated = await prisma.creditCard.update({
      where: { id },
      data: {
        ...data,
        limit: data.limit !== undefined ? data.limit : card.limit,
        sonEkstreBorcu: data.sonEkstreBorcu ?? card.sonEkstreBorcu ?? 0,
        manualGuncelBorc:
          data.manualGuncelBorc !== undefined ? data.manualGuncelBorc : card.manualGuncelBorc,
        updatedBy,
        updatedAt: new Date(),
      },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
        operations: {
          where: {
            deletedAt: null,
          },
          select: {
            isoDate: true,
            amount: true,
          },
          orderBy: {
            isoDate: 'desc',
          },
        },
      },
    });

    await this.logCardState(updated.id);

    return this.mapCreditCard(updated);
  }

  async bulkSave(cards: BulkSaveCreditCardDto[], userId: string): Promise<CreditCardDto[]> {
    const results: CreditCardDto[] = [];

    for (const card of cards) {
      const data = {
        name: card.name || '',
        bankId: card.bankId || null,
        limit: card.limit ?? null,
        sonEkstreBorcu: card.sonEkstreBorcu ?? 0,
        manualGuncelBorc: card.manualGuncelBorc ?? null,
        closingDay: card.closingDay ?? null,
        dueDay: card.dueDay ?? null,
        isActive: card.isActive ?? true,
        updatedBy: userId,
        updatedAt: new Date(),
      };

      let saved;
      if (card.id) {
        saved = await prisma.creditCard.upsert({
          where: { id: card.id },
          update: data,
          create: {
            ...data,
            createdBy: userId,
          },
          include: {
            bank: {
              select: {
                id: true,
                name: true,
              },
            },
            operations: {
              where: { deletedAt: null },
              select: { isoDate: true, amount: true },
              orderBy: { isoDate: 'desc' },
            },
          },
        });
      } else {
        saved = await prisma.creditCard.create({
          data: {
            ...data,
            createdBy: userId,
          },
          include: {
            bank: {
              select: {
                id: true,
                name: true,
              },
            },
            operations: {
              where: { deletedAt: null },
              select: { isoDate: true, amount: true },
              orderBy: { isoDate: 'desc' },
            },
          },
        });
      }

      await this.logCardState(saved.id);
      results.push(this.mapCreditCard(saved));
    }

    return results;
  }

  /**
   * Create an expense (HARCAMA)
   */
  async createExpense(data: CreateExpenseDto, createdBy: string): Promise<ExpenseResponse> {
    // Verify credit card exists
    const card = await prisma.creditCard.findUnique({
      where: { id: data.creditCardId },
    });

    if (!card || card.deletedAt) {
      throw new Error('Credit card not found');
    }

    // Create transaction first (to get its ID)
    const balanceAfter = await calculateBalanceAfter(data.isoDate, 0, 0);

    const transaction = await prisma.transaction.create({
      data: {
        isoDate: data.isoDate,
        documentNo: null,
        type: 'KREDI_KARTI_HARCAMA',
        source: 'KREDI_KARTI',
        creditCardId: data.creditCardId,
        counterparty: data.counterparty || null,
        description: data.description || null,
        incoming: 0,
        outgoing: 0,
        bankDelta: 0,
        displayIncoming: null,
        displayOutgoing: data.amount,
        balanceAfter,
        createdBy,
      },
    });

    // Create credit card operation
    const operation = await prisma.creditCardOperation.create({
      data: {
        creditCardId: data.creditCardId,
        isoDate: data.isoDate,
        type: 'HARCAMA',
        amount: data.amount, // Positive for HARCAMA
        description: data.description || null,
        relatedTransactionId: transaction.id,
        createdBy,
      },
    });

    return {
      operation: {
        id: operation.id,
        creditCardId: operation.creditCardId,
        isoDate: operation.isoDate,
        type: operation.type,
        amount: Number(operation.amount),
        description: operation.description,
        relatedTransactionId: operation.relatedTransactionId,
        createdAt: operation.createdAt.toISOString(),
        createdBy: operation.createdBy,
        updatedAt: operation.updatedAt?.toISOString() || null,
        updatedBy: operation.updatedBy || null,
        deletedAt: operation.deletedAt?.toISOString() || null,
        deletedBy: operation.deletedBy || null,
      },
      transaction: {
        id: transaction.id,
        isoDate: transaction.isoDate,
        type: transaction.type,
        source: transaction.source,
        creditCardId: transaction.creditCardId,
        counterparty: transaction.counterparty,
        description: transaction.description,
        displayOutgoing: transaction.displayOutgoing ? Number(transaction.displayOutgoing) : null,
      },
    };
  }

  /**
   * Create a payment (ODEME)
   */
  async createPayment(data: CreatePaymentDto, createdBy: string): Promise<PaymentResponse> {
    // Verify credit card exists
    const card = await prisma.creditCard.findUnique({
      where: { id: data.creditCardId },
    });

    if (!card || card.deletedAt) {
      throw new Error('Credit card not found');
    }

    // Validate bankId if paymentSource is BANKA
    if (data.paymentSource === 'BANKA' && !data.bankId) {
      throw new Error('bankId is required when paymentSource is BANKA');
    }

    // Determine transaction fields based on paymentSource
    let incoming = 0;
    let outgoing = 0;
    let bankDelta = 0;
    let bankId: string | null = null;

    if (data.paymentSource === 'BANKA') {
      bankId = data.bankId || null;
      bankDelta = -data.amount; // Negative for bank outflow
      outgoing = 0;
    } else {
      // KASA
      bankId = null;
      bankDelta = 0;
      outgoing = data.amount;
    }

    const balanceAfter = await calculateBalanceAfter(data.isoDate, incoming, outgoing);

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        isoDate: data.isoDate,
        documentNo: null,
        type: 'KREDI_KARTI_EKSTRE_ODEME',
        source: 'KREDI_KARTI',
        creditCardId: data.creditCardId,
        bankId,
        counterparty: null,
        description: data.description || null,
        incoming,
        outgoing,
        bankDelta,
        displayIncoming: null,
        displayOutgoing: null,
        balanceAfter,
        createdBy,
      },
    });

    // Create credit card operation
    const operation = await prisma.creditCardOperation.create({
      data: {
        creditCardId: data.creditCardId,
        isoDate: data.isoDate,
        type: 'ODEME',
        amount: -data.amount, // Negative for ODEME (reduces debt)
        description: data.description || null,
        relatedTransactionId: transaction.id,
        createdBy,
      },
    });

    return {
      operation: {
        id: operation.id,
        creditCardId: operation.creditCardId,
        isoDate: operation.isoDate,
        type: operation.type,
        amount: Number(operation.amount),
        description: operation.description,
        relatedTransactionId: operation.relatedTransactionId,
        createdAt: operation.createdAt.toISOString(),
        createdBy: operation.createdBy,
        updatedAt: operation.updatedAt?.toISOString() || null,
        updatedBy: operation.updatedBy || null,
        deletedAt: operation.deletedAt?.toISOString() || null,
        deletedBy: operation.deletedBy || null,
      },
      transaction: {
        id: transaction.id,
        isoDate: transaction.isoDate,
        type: transaction.type,
        source: transaction.source,
        creditCardId: transaction.creditCardId,
        counterparty: transaction.counterparty,
        description: transaction.description,
        bankId: transaction.bankId,
        bankDelta: Number(transaction.bankDelta),
        outgoing: Number(transaction.outgoing),
      },
    };
  }
}
