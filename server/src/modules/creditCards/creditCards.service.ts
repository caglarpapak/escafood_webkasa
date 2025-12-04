import { PrismaClient, DailyTransactionType, DailyTransactionSource } from '@prisma/client';
import { prisma } from '../../config/prisma';
import {
  CreateCreditCardDto,
  UpdateCreditCardDto,
  CreateExpenseDto,
  CreatePaymentDto,
  CreditCardDto,
  CreditCardOperationDto,
  ExpenseResponse,
  PaymentResponse,
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

    return cards.map((card) => {
      const currentDebt = card.operations.reduce((sum: number, op) => sum + Number(op.amount), 0);
      const lastOperationDate =
        card.operations.length > 0 ? card.operations[0].isoDate : null;

      // BUG 1 FIX: Preserve null limit correctly - don't convert 0 to null (though 0 is invalid for credit cards)
      // Test case: limit=250000 should return 250000
      const limit = card.limit !== null && card.limit !== undefined ? Number(card.limit) : null;
      const availableLimit = limit !== null ? limit - currentDebt : null;

      return {
        id: card.id,
        name: card.name,
        bankId: card.bankId,
        limit,
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
        availableLimit,
        lastOperationDate,
        bank: card.bank || null,
      };
    });
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

    const currentDebt = card.operations.reduce((sum: number, op) => sum + Number(op.amount), 0);
    const lastOperationDate =
      card.operations.length > 0 ? card.operations[0].isoDate : null;

    // deletedAt'ı açık açık Date | null olarak ele al
    const deletedAtValue: Date | null = card.deletedAt
      ? new Date(card.deletedAt as any)
      : null;

    const limit = card.limit ? Number(card.limit) : null;
    const availableLimit = limit !== null ? limit - currentDebt : null;

    return {
      id: card.id,
      name: card.name,
      bankId: card.bankId,
      limit,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      isActive: card.isActive,
      createdAt: card.createdAt.toISOString(),
      createdBy: card.createdBy,
      updatedAt: card.updatedAt ? card.updatedAt.toISOString() : null,
      updatedBy: card.updatedBy || null,
      deletedAt: deletedAtValue ? deletedAtValue.toISOString() : null,
      deletedBy: card.deletedBy || null,
      currentDebt,
      availableLimit,
      lastOperationDate,
      bank: card.bank || null,
    };
  }

  /**
   * Helper to fetch a credit card by ID or throw error
   */
  private async getCardOrThrow(creditCardId: string) {
    const card = await prisma.creditCard.findUnique({
      where: { id: creditCardId },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!card) {
      throw new Error('Credit card not found');
    }
    return card;
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

    // BUG 1 FIX: Preserve null limit correctly for new cards
    // Test case: limit=250000 should return 250000
    const limit = card.limit !== null && card.limit !== undefined ? Number(card.limit) : null;
    const currentDebt = 0; // New card has no operations yet
    const availableLimit = limit !== null ? limit - currentDebt : null;

    return {
      id: card.id,
      name: card.name,
      bankId: card.bankId,
      limit,
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
      availableLimit,
      lastOperationDate: null,
      bank: card.bank || null,
    };
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

    // BUG 1 FIX: Handle limit update correctly - if limit is explicitly null, set it to null
    // Test case: limit=250000 should be saved as 250000
    // Test case: limit=null should clear the limit (set to null in DB)
    const updated = await prisma.creditCard.update({
      where: { id },
      data: {
        ...data,
        limit: data.limit !== undefined ? data.limit : card.limit, // Preserve existing if not provided, otherwise use new value (including null)
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

    const currentDebt = updated.operations.reduce((sum: number, op) => sum + Number(op.amount), 0);
    const lastOperationDate =
      updated.operations.length > 0 ? updated.operations[0].isoDate : null;

    // BUG 1 FIX: Preserve null limit correctly - don't convert 0 to null
    // Test case: limit=250000 should return 250000
    // Test case: limit=null should return null
    const limit = updated.limit !== null && updated.limit !== undefined ? Number(updated.limit) : null;
    const availableLimit = limit !== null ? limit - currentDebt : null;

    return {
      id: updated.id,
      name: updated.name,
      bankId: updated.bankId,
      limit,
      closingDay: updated.closingDay,
      dueDay: updated.dueDay,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      createdBy: updated.createdBy,
      updatedAt: updated.updatedAt?.toISOString() || null,
      updatedBy: updated.updatedBy || null,
      deletedAt: updated.deletedAt?.toISOString() || null,
      deletedBy: updated.deletedBy || null,
      currentDebt,
      availableLimit,
      lastOperationDate,
      bank: updated.bank || null,
    };
  }

  /**
   * Create an expense (HARCAMA)
   */
  async createExpense(data: CreateExpenseDto, createdBy: string): Promise<ExpenseResponse> {
    // Verify credit card exists
    const card = await this.getCardOrThrow(data.creditCardId);

    if (card.deletedAt) {
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
    const card = await this.getCardOrThrow(data.creditCardId);

    if (card.deletedAt) {
      throw new Error('Credit card not found');
    }

    // Validate bankId if paymentSource is BANKA
    if (data.paymentSource === 'BANKA' && !data.bankId) {
      throw new Error('bankId is required when paymentSource is BANKA');
    }

    // Fix: Apply strict mapping for credit card payments
    let incoming = 0;
    let outgoing = 0;
    let bankDelta = 0;
    let bankId: string | null = null;

    if (data.paymentSource === 'BANKA') {
      // CREDIT CARD PAYMENT from bank: source=BANKA, incoming=0, outgoing=amount, bankDelta=-amount
      bankId = data.bankId || null;
      incoming = 0;
      outgoing = data.amount; // Backend transaction service will normalize based on type
      bankDelta = -data.amount; // Negative for bank outflow
    } else {
      // KASA - payment from cash
      bankId = null;
      incoming = 0;
      outgoing = data.amount;
      bankDelta = 0;
    }

    const balanceAfter = await calculateBalanceAfter(data.isoDate, incoming, outgoing);

    // Fix: Credit card payment from bank should have source=BANKA
    const transactionSource = data.paymentSource === 'BANKA' ? 'BANKA' : 'KASA';
    
    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        isoDate: data.isoDate,
        documentNo: null,
        type: 'KREDI_KARTI_EKSTRE_ODEME',
        source: transactionSource, // BANKA if payment from bank, KASA if from cash
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

