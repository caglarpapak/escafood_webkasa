import { PrismaClient, DailyTransactionType, DailyTransactionSource } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { isTransactionInCurrentStatement } from '../../utils/creditCard';
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
 * FINANCIAL INVARIANT: Only KASA transactions affect cash balance
 * Credit card transactions (source=KREDI_KARTI) never affect cash balance
 */
async function calculateBalanceAfter(
  isoDate: string,
  incoming: number,
  outgoing: number,
  storedSource: string,
  excludeTransactionId?: string
): Promise<number> {
  // FINANCIAL INVARIANT: Only KASA transactions affect cash balance
  const where: any = {
    deletedAt: null,
    isoDate: { lte: isoDate },
    source: 'KASA', // Only include KASA transactions in cash balance calculation
  };

  if (excludeTransactionId) {
    where.id = { not: excludeTransactionId };
  }

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

  // Calculate balance up to this point (only KASA transactions)
  let balance = 0;
  for (const tx of transactions) {
    balance += Number(tx.incoming) - Number(tx.outgoing);
  }

  // Add the new transaction's effect only if it's a KASA transaction
  // Credit card transactions (source=KREDI_KARTI) have 0 effect on cash balance
  if (storedSource === 'KASA') {
    balance += incoming - outgoing;
  }

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
      // Calculate current debt: use manualGuncelBorc if set, otherwise calculate from operations
      const calculatedDebt = card.operations.reduce((sum: number, op) => sum + Number(op.amount), 0);
      const manualGuncelBorc = card.manualGuncelBorc !== null && card.manualGuncelBorc !== undefined 
        ? Number(card.manualGuncelBorc) 
        : null;
      const currentDebt = manualGuncelBorc !== null ? manualGuncelBorc : calculatedDebt;
      
      const lastOperationDate =
        card.operations.length > 0 ? card.operations[0].isoDate : null;

      // BUG 1 FIX: Preserve null limit correctly - don't convert 0 to null (though 0 is invalid for credit cards)
      // Test case: limit=250000 should return 250000
      const limit = card.limit !== null && card.limit !== undefined ? Number(card.limit) : null;
      const availableLimit = limit !== null ? limit - currentDebt : null;
      
      const sonEkstreBorcu = card.sonEkstreBorcu !== null && card.sonEkstreBorcu !== undefined 
        ? Number(card.sonEkstreBorcu) 
        : 0;


      return {
        id: card.id,
        name: card.name,
        bankId: card.bankId,
        limit,
        closingDay: card.closingDay,
        dueDay: card.dueDay,
        sonEkstreBorcu,
        manualGuncelBorc,
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

    // Calculate current debt: use manualGuncelBorc if set, otherwise calculate from operations
    const calculatedDebt = card.operations.reduce((sum: number, op) => sum + Number(op.amount), 0);
    const manualGuncelBorc = card.manualGuncelBorc !== null && card.manualGuncelBorc !== undefined 
      ? Number(card.manualGuncelBorc) 
      : null;
    const currentDebt = manualGuncelBorc !== null ? manualGuncelBorc : calculatedDebt;
    
    const lastOperationDate =
      card.operations.length > 0 ? card.operations[0].isoDate : null;

    // deletedAt'ı açık açık Date | null olarak ele al
    const deletedAtValue: Date | null = card.deletedAt
      ? new Date(card.deletedAt as any)
      : null;

    // FIX: Use consistent pattern - don't treat 0 as falsy
    // A limit of 0 is a valid value and should not be converted to null
    const limit = card.limit !== null && card.limit !== undefined ? Number(card.limit) : null;
    const availableLimit = limit !== null ? limit - currentDebt : null;
    
    const sonEkstreBorcu = card.sonEkstreBorcu !== null && card.sonEkstreBorcu !== undefined 
      ? Number(card.sonEkstreBorcu) 
      : 0;

    return {
      id: card.id,
      name: card.name,
      bankId: card.bankId,
      limit,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      sonEkstreBorcu,
      manualGuncelBorc,
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
        sonEkstreBorcu: data.sonEkstreBorcu !== undefined ? data.sonEkstreBorcu : 0,
        manualGuncelBorc: data.manualGuncelBorc !== undefined ? data.manualGuncelBorc : null,
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
    const manualGuncelBorc = card.manualGuncelBorc !== null && card.manualGuncelBorc !== undefined 
      ? Number(card.manualGuncelBorc) 
      : null;
    const currentDebt = manualGuncelBorc !== null ? manualGuncelBorc : 0; // New card has no operations yet
    const availableLimit = limit !== null ? limit - currentDebt : null;
    const sonEkstreBorcu = card.sonEkstreBorcu !== null && card.sonEkstreBorcu !== undefined 
      ? Number(card.sonEkstreBorcu) 
      : 0;

    return {
      id: card.id,
      name: card.name,
      bankId: card.bankId,
      limit,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      sonEkstreBorcu,
      manualGuncelBorc,
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
        sonEkstreBorcu: data.sonEkstreBorcu !== undefined ? data.sonEkstreBorcu : card.sonEkstreBorcu,
        manualGuncelBorc: data.manualGuncelBorc !== undefined ? data.manualGuncelBorc : card.manualGuncelBorc,
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

    // Calculate current debt: use manualGuncelBorc if set, otherwise calculate from operations
    const calculatedDebt = updated.operations.reduce((sum: number, op) => sum + Number(op.amount), 0);
    const manualGuncelBorc = updated.manualGuncelBorc !== null && updated.manualGuncelBorc !== undefined 
      ? Number(updated.manualGuncelBorc) 
      : null;
    const currentDebt = manualGuncelBorc !== null ? manualGuncelBorc : calculatedDebt;
    
    const lastOperationDate =
      updated.operations.length > 0 ? updated.operations[0].isoDate : null;

    // BUG 1 FIX: Preserve null limit correctly - don't convert 0 to null
    // Test case: limit=250000 should return 250000
    // Test case: limit=null should return null
    const limit = updated.limit !== null && updated.limit !== undefined ? Number(updated.limit) : null;
    const availableLimit = limit !== null ? limit - currentDebt : null;
    
    const sonEkstreBorcu = updated.sonEkstreBorcu !== null && updated.sonEkstreBorcu !== undefined 
      ? Number(updated.sonEkstreBorcu) 
      : 0;

    return {
      id: updated.id,
      name: updated.name,
      bankId: updated.bankId,
      limit,
      closingDay: updated.closingDay,
      dueDay: updated.dueDay,
      sonEkstreBorcu,
      manualGuncelBorc,
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
  async createExpense(data: CreateExpenseDto, createdBy: string, createdByEmail: string): Promise<ExpenseResponse> {
    // Verify credit card exists
    const card = await this.getCardOrThrow(data.creditCardId);

    if (card.deletedAt) {
      throw new Error('Credit card not found');
    }


    // FINANCIAL INVARIANT: Credit card expense never affects cash balance
    // Calculate balance after (will be 0 since incoming=0, outgoing=0, and source=KREDI_KARTI)
    const balanceAfter = await calculateBalanceAfter(data.isoDate, 0, 0, 'KREDI_KARTI');

    // Determine if transaction is in current statement (before next closing date)
    // FIX: Compare actual dates, not day-of-month (Jan 31 < Feb 2, not 31 > 2)
    const closingDay = card.closingDay ?? 31;
    const dueDay = card.dueDay ?? 7;
    const isBeforeCutoff = isTransactionInCurrentStatement(
      data.isoDate,
      closingDay,
      dueDay
    );

    // Calculate new debt values
    const currentSonEkstreBorcu = card.sonEkstreBorcu !== null && card.sonEkstreBorcu !== undefined 
      ? Number(card.sonEkstreBorcu) 
      : 0;
    const currentManualGuncelBorc = card.manualGuncelBorc !== null && card.manualGuncelBorc !== undefined
      ? Number(card.manualGuncelBorc)
      : null;

    // Update rules:
    // - If transaction date <= closingDay: sonEkstreBorcu += amount
    // - Always: manualGuncelBorc += amount (or set to amount if null)
    const newSonEkstreBorcu = isBeforeCutoff 
      ? currentSonEkstreBorcu + data.amount 
      : currentSonEkstreBorcu;
    const newManualGuncelBorc = currentManualGuncelBorc !== null
      ? currentManualGuncelBorc + data.amount
      : data.amount;


    // BELGE NO (ZORUNLU) - 3.1: Belge No asla boş olamaz
    // KREDI_KARTI_HARCAMA için otomatik belge no üret
    const { autoGenerateDocumentNo } = await import('../transactions/transactions.documentNo');
    const documentNo = await autoGenerateDocumentNo(
      'KREDI_KARTI_HARCAMA',
      'KREDI_KARTI',
      data.isoDate,
      null // Always auto-generate for credit card expenses
    );

    // Atomic transaction: create transaction, operation, and update credit card together
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          isoDate: data.isoDate,
          documentNo: documentNo, // BELGE NO (ZORUNLU): Auto-generated
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
          attachmentId: data.attachmentId ?? null, // Attachment must be uploaded via /api/attachments first
          createdBy, // KULLANICI / AUTH / AUDIT - 7.1: createdByUserId
          createdByEmail, // KULLANICI / AUTH / AUDIT - 7.1: createdByEmail
        },
      });

      // Create credit card operation
      const operation = await tx.creditCardOperation.create({
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

      // CRITICAL FIX: Update credit card debt values atomically
      const updatedCard = await tx.creditCard.update({
        where: { id: data.creditCardId },
        data: {
          sonEkstreBorcu: newSonEkstreBorcu,
          manualGuncelBorc: newManualGuncelBorc,
          updatedAt: new Date(),
          updatedBy: createdBy,
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


      return { transaction, operation, updatedCard };
    });

    const { transaction, operation, updatedCard } = result;

    // Calculate response values
    const limit = updatedCard.limit !== null && updatedCard.limit !== undefined ? Number(updatedCard.limit) : null;
    const manualGuncelBorc = updatedCard.manualGuncelBorc !== null && updatedCard.manualGuncelBorc !== undefined 
      ? Number(updatedCard.manualGuncelBorc) 
      : null;
    const calculatedDebt = updatedCard.operations.reduce((sum: number, op) => sum + Number(op.amount), 0);
    const currentDebt = manualGuncelBorc !== null ? manualGuncelBorc : calculatedDebt;
    const availableLimit = limit !== null ? limit - currentDebt : null;
    const sonEkstreBorcu = updatedCard.sonEkstreBorcu !== null && updatedCard.sonEkstreBorcu !== undefined 
      ? Number(updatedCard.sonEkstreBorcu) 
      : 0;

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
      // CRITICAL FIX: Include updated credit card in response
      creditCard: {
        id: updatedCard.id,
        name: updatedCard.name,
        bankId: updatedCard.bankId,
        limit,
        closingDay: updatedCard.closingDay,
        dueDay: updatedCard.dueDay,
        sonEkstreBorcu,
        manualGuncelBorc,
        isActive: updatedCard.isActive,
        currentDebt,
        availableLimit,
        lastOperationDate: updatedCard.operations.length > 0 ? updatedCard.operations[0].isoDate : null,
        bank: updatedCard.bank || null,
      },
    };
  }

  /**
   * Create a payment (ODEME)
   */
  async createPayment(data: CreatePaymentDto, createdBy: string, createdByEmail: string): Promise<PaymentResponse> {
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

    // Fix: Credit card payment from bank should have source=BANKA
    const transactionSource = data.paymentSource === 'BANKA' ? 'BANKA' : 'KASA';
    
    // FINANCIAL INVARIANT: Only KASA payments affect cash balance
    // Bank payments (source=BANKA) don't affect cash balance
    const balanceAfter = await calculateBalanceAfter(data.isoDate, incoming, outgoing, transactionSource);
    
    // CREDIT CARD EKSTRE ÖDEME BORÇ MODELİ (FINANCIAL INVARIANT):
    // guncelBorc = kredi kartının toplam borcu
    // sonEkstreBorcu = bu toplam borcun ekstreye yansımış kısmı
    // Ekstre ödeme yapıldığında:
    // - sonEkstreBorcu = Math.max(sonEkstreBorcu - paymentAmount, 0) (0 altına inmez)
    // - guncelBorc = guncelBorc - paymentAmount (tam tutar kadar azalır)
    const currentSonEkstreBorcu = card.sonEkstreBorcu !== null && card.sonEkstreBorcu !== undefined 
      ? Number(card.sonEkstreBorcu) 
      : 0;
    const currentManualGuncelBorc = card.manualGuncelBorc !== null && card.manualGuncelBorc !== undefined
      ? Number(card.manualGuncelBorc)
      : null;

    // Calculate new debt values after payment
    const newSonEkstreBorcu = Math.max(currentSonEkstreBorcu - data.amount, 0); // Never go below 0
    const newManualGuncelBorc = currentManualGuncelBorc !== null
      ? Math.max(currentManualGuncelBorc - data.amount, 0) // Reduce by full payment amount, but never go below 0
      : null; // If manualGuncelBorc was null, keep it null (will be calculated from operations)
    
    // BELGE NO (ZORUNLU) - 3.1: Belge No asla boş olamaz
    // KREDI_KARTI_EKSTRE_ODEME için otomatik belge no üret
    const { autoGenerateDocumentNo } = await import('../transactions/transactions.documentNo');
    const documentNo = await autoGenerateDocumentNo(
      'KREDI_KARTI_EKSTRE_ODEME',
      transactionSource,
      data.isoDate,
      null // Always auto-generate for credit card payments
    );

    // Atomic transaction: create transaction, operation, and update credit card together
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          isoDate: data.isoDate,
          documentNo: documentNo, // BELGE NO (ZORUNLU): Auto-generated
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
          createdBy, // KULLANICI / AUTH / AUDIT - 7.1: createdByUserId
          createdByEmail, // KULLANICI / AUTH / AUDIT - 7.1: createdByEmail
        },
      });

      // Create credit card operation
      const operation = await tx.creditCardOperation.create({
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

      // CRITICAL FIX: Update credit card debt values atomically
      const updatedCard = await tx.creditCard.update({
        where: { id: data.creditCardId },
        data: {
          sonEkstreBorcu: newSonEkstreBorcu,
          manualGuncelBorc: newManualGuncelBorc,
          updatedAt: new Date(),
          updatedBy: createdBy,
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

      return { transaction, operation, updatedCard };
    });

    const { transaction, operation, updatedCard } = result;

    // Calculate response values
    const limit = updatedCard.limit !== null && updatedCard.limit !== undefined ? Number(updatedCard.limit) : null;
    const manualGuncelBorc = updatedCard.manualGuncelBorc !== null && updatedCard.manualGuncelBorc !== undefined 
      ? Number(updatedCard.manualGuncelBorc) 
      : null;
    const calculatedDebt = updatedCard.operations.reduce((sum: number, op) => sum + Number(op.amount), 0);
    const currentDebt = manualGuncelBorc !== null ? manualGuncelBorc : calculatedDebt;
    const availableLimit = limit !== null ? limit - currentDebt : null;
    const sonEkstreBorcu = updatedCard.sonEkstreBorcu !== null && updatedCard.sonEkstreBorcu !== undefined 
      ? Number(updatedCard.sonEkstreBorcu) 
      : 0;

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
      // CRITICAL FIX: Include updated credit card in response (same as createExpense)
      creditCard: {
        id: updatedCard.id,
        name: updatedCard.name,
        bankId: updatedCard.bankId,
        limit,
        closingDay: updatedCard.closingDay,
        dueDay: updatedCard.dueDay,
        sonEkstreBorcu,
        manualGuncelBorc,
        isActive: updatedCard.isActive,
        currentDebt,
        availableLimit,
        lastOperationDate: updatedCard.operations.length > 0 ? updatedCard.operations[0].isoDate : null,
        bank: updatedCard.bank || null,
      },
    };
  }

  /**
   * Bulk save credit cards (create or update multiple cards)
   */
  async bulkSaveCreditCards(
    payload: Array<{
      id: string;
      name: string;
      bankId?: string | null;
      limit?: number | null;
      closingDay?: number | null;
      dueDay?: number | null;
      sonEkstreBorcu?: number;
      manualGuncelBorc?: number | null;
      isActive?: boolean;
    }>,
    userId: string
  ): Promise<CreditCardDto[]> {
    
    const results: CreditCardDto[] = [];

    for (const item of payload) {
      const isNew = item.id.startsWith('tmp-');

      if (isNew) {
        // Create new credit card
        // CRITICAL FIX: Explicitly handle sonEkstreBorcu and manualGuncelBorc
        // If provided (even if 0), use it; otherwise use defaults
        const createData = {
          name: item.name,
          bankId: item.bankId ?? null,
          limit: item.limit ?? null,
          closingDay: item.closingDay ?? null,
          dueDay: item.dueDay ?? null,
          sonEkstreBorcu: item.sonEkstreBorcu !== undefined ? item.sonEkstreBorcu : 0,
          manualGuncelBorc: item.manualGuncelBorc !== undefined ? item.manualGuncelBorc : null,
          isActive: item.isActive ?? true,
          createdBy: userId,
        };
        
        
        const created = await prisma.creditCard.create({
          data: createData,
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

        const limit = created.limit !== null && created.limit !== undefined ? Number(created.limit) : null;
        const manualGuncelBorc = created.manualGuncelBorc !== null && created.manualGuncelBorc !== undefined 
          ? Number(created.manualGuncelBorc) 
          : null;
        const currentDebt = manualGuncelBorc !== null ? manualGuncelBorc : 0; // New card has no operations yet
        const availableLimit = limit !== null ? limit - currentDebt : null;
        const sonEkstreBorcu = created.sonEkstreBorcu !== null && created.sonEkstreBorcu !== undefined 
          ? Number(created.sonEkstreBorcu) 
          : 0;

        results.push({
          id: created.id,
          name: created.name,
          bankId: created.bankId,
          limit,
          closingDay: created.closingDay,
          dueDay: created.dueDay,
          sonEkstreBorcu,
          manualGuncelBorc,
          isActive: created.isActive,
          createdAt: created.createdAt.toISOString(),
          createdBy: created.createdBy,
          updatedAt: created.updatedAt?.toISOString() || null,
          updatedBy: created.updatedBy || null,
          deletedAt: created.deletedAt?.toISOString() || null,
          deletedBy: created.deletedBy || null,
          currentDebt,
          availableLimit,
          lastOperationDate: null,
          bank: created.bank || null,
        });
      } else {
        // Update existing credit card
        const existing = await prisma.creditCard.findUnique({ where: { id: item.id } });
        if (!existing || existing.deletedAt) {
          continue; // Skip deleted or non-existent cards
        }


        // CRITICAL FIX: Always update sonEkstreBorcu and manualGuncelBorc if provided in payload
        // This ensures user-entered values (including 0) are preserved
        // The controller now includes these fields in the payload, so they should always be present
        const updateData: any = {
          name: item.name,
          bankId: item.bankId !== undefined ? item.bankId : existing.bankId,
          limit: item.limit !== undefined ? item.limit : existing.limit,
          closingDay: item.closingDay !== undefined ? item.closingDay : existing.closingDay,
          dueDay: item.dueDay !== undefined ? item.dueDay : existing.dueDay,
          isActive: item.isActive !== undefined ? item.isActive : existing.isActive,
          updatedAt: new Date(),
          updatedBy: userId,
        };
        
        // sonEkstreBorcu: if provided (even if 0), use it; otherwise keep existing
        if (item.sonEkstreBorcu !== undefined) {
          updateData.sonEkstreBorcu = typeof item.sonEkstreBorcu === 'number' 
            ? item.sonEkstreBorcu 
            : Number(item.sonEkstreBorcu);
        } else {
          updateData.sonEkstreBorcu = existing.sonEkstreBorcu;
        }
        
        // manualGuncelBorc: if provided as number (even if 0), use it; if null, set to null; otherwise keep existing
        if (item.manualGuncelBorc !== undefined) {
          if (item.manualGuncelBorc === null) {
            updateData.manualGuncelBorc = null;
          } else {
            updateData.manualGuncelBorc = typeof item.manualGuncelBorc === 'number'
              ? item.manualGuncelBorc
              : Number(item.manualGuncelBorc);
          }
        } else {
          updateData.manualGuncelBorc = existing.manualGuncelBorc;
        }
        

        const updated = await prisma.creditCard.update({
          where: { id: item.id },
          data: updateData,
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

        // Calculate current debt: use manualGuncelBorc if set, otherwise calculate from operations
        const calculatedDebt = updated.operations.reduce((sum: number, op) => sum + Number(op.amount), 0);
        const manualGuncelBorc = updated.manualGuncelBorc !== null && updated.manualGuncelBorc !== undefined 
          ? Number(updated.manualGuncelBorc) 
          : null;
        const currentDebt = manualGuncelBorc !== null ? manualGuncelBorc : calculatedDebt;
        
        const lastOperationDate =
          updated.operations.length > 0 ? updated.operations[0].isoDate : null;
        const limit = updated.limit !== null && updated.limit !== undefined ? Number(updated.limit) : null;
        const availableLimit = limit !== null ? limit - currentDebt : null;
        const sonEkstreBorcu = updated.sonEkstreBorcu !== null && updated.sonEkstreBorcu !== undefined 
          ? Number(updated.sonEkstreBorcu) 
          : 0;


        results.push({
          id: updated.id,
          name: updated.name,
          bankId: updated.bankId,
          limit,
          closingDay: updated.closingDay,
          dueDay: updated.dueDay,
          sonEkstreBorcu,
          manualGuncelBorc,
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
        });
      }
    }

    
    return results;
  }

  /**
   * Soft delete a credit card
   */
  async softDeleteCreditCard(id: string, deletedBy: string): Promise<void> {
    const card = await prisma.creditCard.findUnique({
      where: { id },
    });

    if (!card || card.deletedAt) {
      throw new Error('Credit card not found');
    }

    await prisma.creditCard.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}

