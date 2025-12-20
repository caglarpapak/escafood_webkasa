import { PrismaClient, ChequeStatus, ChequeDirection, DailyTransactionType, DailyTransactionSource } from '@prisma/client';
import { prisma } from '../../config/prisma';
import {
  CreateChequeDto,
  UpdateChequeDto,
  UpdateChequeStatusDto,
  ChequeListQuery,
  ChequeListResponse,
  ChequeDto,
  PayableChequeDto,
  PayChequeDto,
  PayChequeResponse,
} from './cheques.types';

/**
 * Get default status for a cheque based on direction
 */
function getDefaultStatus(direction: ChequeDirection): ChequeStatus {
  if (direction === 'ALACAK') {
    return 'KASADA';
  } else {
    return 'ODEMEDE';
  }
}

/**
 * Check if a status transition is allowed
 */
function isStatusTransitionAllowed(
  currentStatus: ChequeStatus,
  newStatus: ChequeStatus,
  direction: ChequeDirection
): boolean {
  // Any status can transition to KARSILIKSIZ
  if (newStatus === 'KARSILIKSIZ') {
    return true;
  }

  if (direction === 'ALACAK') {
    // For ALACAK cheques (customer cheques):
    // KASADA → BANKADA_TAHSILDE (sent to bank for collection)
    // KASADA → TAHSIL_EDILDI (collected directly into cash)
    // KASADA → ODEMEDE (used to pay a supplier - customer cheque given to supplier)
    // BANKADA_TAHSILDE → TAHSIL_EDILDI (collected from bank)
    const allowedTransitions: ChequeStatus[] = [];
    if (currentStatus === 'KASADA') {
      allowedTransitions.push('BANKADA_TAHSILDE', 'TAHSIL_EDILDI', 'ODEMEDE');
    } else if (currentStatus === 'BANKADA_TAHSILDE') {
      allowedTransitions.push('TAHSIL_EDILDI');
    }
    return allowedTransitions.includes(newStatus);
  } else {
    // For BORC cheques:
    // KASADA → ODENDI (paid directly from bank)
    // BANKADA_TAHSILDE → ODENDI (paid from bank)
    // ODEMEDE → ODENDI (paid)
    // TAHSIL_EDILDI → ODENDI (legacy: already collected, now paid)
    if (newStatus === 'ODENDI') {
      if (currentStatus === 'KASADA' || currentStatus === 'BANKADA_TAHSILDE' || currentStatus === 'ODEMEDE' || currentStatus === 'TAHSIL_EDILDI') {
        return true;
      }
    }
    return false;
  }
}

/**
 * Calculate cash balance after a transaction
 * FINANCIAL INVARIANT: Only KASA transactions affect cash balance
 * 
 * Gets all KASA transactions up to this date (excluding the one being created),
 * calculates balance, then adds the new transaction's incoming/outgoing if it's KASA
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
  if (storedSource === 'KASA') {
    balance += incoming - outgoing;
  }

  return balance;
}

/**
 * Create a transaction for cheque collection/payment
 */
async function createChequeTransaction(
  chequeId: string,
  type: DailyTransactionType,
  source: DailyTransactionSource,
  isoDate: string,
  amount: number,
  counterparty: string | null,
  description: string | null,
  bankId: string | null,
  incoming: number,
  outgoing: number,
  bankDelta: number,
  displayIncoming: number | null,
  displayOutgoing: number | null,
  createdBy: string
): Promise<string> {
  // FINANCIAL INVARIANT: Only KASA transactions affect cash balance
  const balanceAfter = await calculateBalanceAfter(isoDate, incoming, outgoing, source);

  const transaction = await prisma.transaction.create({
    data: {
      isoDate,
      documentNo: null, // Can be set later if needed
      type,
      source,
      counterparty,
      description,
      incoming: incoming,
      outgoing: outgoing,
      bankDelta: bankDelta,
      displayIncoming: displayIncoming,
      displayOutgoing: displayOutgoing,
      balanceAfter: balanceAfter,
      chequeId,
      bankId,
      createdBy,
    },
  });

  return transaction.id;
}

export class ChequesService {
  /**
   * Create a new cheque
   * 
   * STANDARD CONTRACT:
   * - ALACAK (customer cheque): status = KASADA
   * - BORC (supplier cheque): status = ODEMEDE
   * - deletedAt = null (always)
   * - All required fields must be set (cekNo, amount, entryDate, maturityDate, direction)
   */
  async createCheque(data: CreateChequeDto, createdBy: string): Promise<ChequeDto> {
    const defaultStatus = getDefaultStatus(data.direction); // STANDARD CONTRACT: ALACAK → KASADA, BORC → ODEMEDE

    // Validate and set customerId, supplierId, bankId based on direction
    let customerId: string | null = null;
    let supplierId: string | null = null;
    let bankId: string | null = null;

    if (data.direction === 'ALACAK') {
      // Customer cheque: set customerId if provided and valid
      if (data.customerId) {
        const customer = await prisma.customer.findUnique({
          where: { id: data.customerId, deletedAt: null },
        });
        if (customer) {
          customerId = data.customerId;
        }
        // If customer doesn't exist, leave as null (no FK error)
      }
      supplierId = null; // Always null for customer cheques
    } else {
      // BORC (supplier cheque): set supplierId if provided and valid
      if (data.supplierId) {
        const supplier = await prisma.supplier.findUnique({
          where: { id: data.supplierId, deletedAt: null },
        });
        if (supplier) {
          supplierId = data.supplierId;
        }
        // If supplier doesn't exist, leave as null (no FK error)
      }
      customerId = null; // Always null for supplier cheques
    }

    // Validate bankId if provided
    if (data.bankId) {
      const bank = await prisma.bank.findUnique({
        where: { id: data.bankId, deletedAt: null },
      });
      if (bank) {
        bankId = data.bankId;
      }
      // If bank doesn't exist, leave as null (no FK error)
    }

    const cheque = await prisma.cheque.create({
      data: {
        cekNo: data.cekNo,
        amount: data.amount,
        entryDate: data.entryDate,
        maturityDate: data.maturityDate,
        status: defaultStatus,
        direction: data.direction,
        customerId,
        supplierId,
        bankId,
        description: data.description || null,
        attachmentId: data.attachmentId || null,
        createdBy,
      },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
            accountNo: true,
            iban: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToDto(cheque);
  }

  /**
   * Update a cheque (base fields only, no status change)
   */
  async updateCheque(id: string, data: UpdateChequeDto, updatedBy: string): Promise<ChequeDto> {
    const cheque = await prisma.cheque.findUnique({
      where: { id },
    });

    if (!cheque) {
      throw new Error('Cheque not found');
    }

    if (cheque.deletedAt) {
      throw new Error('Cannot update deleted cheque');
    }

    // Validate and set customerId, supplierId, bankId if provided
    const updateData: any = {
      ...data,
      updatedBy,
      updatedAt: new Date(),
    };

    // Validate customerId if provided
    if (data.customerId !== undefined) {
      if (data.customerId) {
        const customer = await prisma.customer.findUnique({
          where: { id: data.customerId, deletedAt: null },
        });
        updateData.customerId = customer ? data.customerId : null;
      } else {
        updateData.customerId = null;
      }
    }

    // Validate supplierId if provided
    if (data.supplierId !== undefined) {
      if (data.supplierId) {
        const supplier = await prisma.supplier.findUnique({
          where: { id: data.supplierId, deletedAt: null },
        });
        updateData.supplierId = supplier ? data.supplierId : null;
      } else {
        updateData.supplierId = null;
      }
    }

    // Validate bankId if provided
    if (data.bankId !== undefined) {
      if (data.bankId) {
        const bank = await prisma.bank.findUnique({
          where: { id: data.bankId, deletedAt: null },
        });
        updateData.bankId = bank ? data.bankId : null;
      } else {
        updateData.bankId = null;
      }
    }

    const updated = await prisma.cheque.update({
      where: { id },
      data: updateData,
      include: {
        bank: {
          select: {
            id: true,
            name: true,
            accountNo: true,
            iban: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToDto(updated);
  }

  /**
   * Update cheque status with transaction side-effects
   */
  async updateChequeStatus(
    id: string,
    data: UpdateChequeStatusDto,
    updatedBy: string
  ): Promise<{ cheque: ChequeDto; transactionId: string | null }> {
    const cheque = await prisma.cheque.findUnique({
      where: { id },
      include: {
        customer: true,
        supplier: true,
        bank: true,
      },
    });

    if (!cheque) {
      throw new Error('Cheque not found');
    }

    if (cheque.deletedAt) {
      throw new Error('Cannot update deleted cheque');
    }

    // Validate status transition
    if (!isStatusTransitionAllowed(cheque.status, data.newStatus, cheque.direction)) {
      throw new Error(
        `Invalid status transition from ${cheque.status} to ${data.newStatus} for direction ${cheque.direction}`
      );
    }

    let transactionId: string | null = null;

    // Handle transaction side-effects based on status change
    if (data.newStatus === 'TAHSIL_EDILDI') {
      if (cheque.direction === 'ALACAK') {
        // Customer cheque collected
        const amount = Number(cheque.amount);
        const counterparty = cheque.customer?.name || null;
        const description = data.description || `Çek No: ${cheque.cekNo}`;

        if (data.bankId) {
          // Collected into BANK
          transactionId = await createChequeTransaction(
            cheque.id,
            'CEK_TAHSIL_BANKA',
            'BANKA',
            data.isoDate,
            amount,
            counterparty,
            description,
            data.bankId,
            0, // incoming
            0, // outgoing
            amount, // bankDelta positive
            null, // displayIncoming
            null, // displayOutgoing
            updatedBy
          );
        } else {
          // Collected into CASH
          transactionId = await createChequeTransaction(
            cheque.id,
            'CEK_TAHSIL_BANKA',
            'KASA',
            data.isoDate,
            amount,
            counterparty,
            description,
            null, // bankId
            amount, // incoming
            0, // outgoing
            0, // bankDelta
            null, // displayIncoming
            null, // displayOutgoing
            updatedBy
          );
        }
      } else {
        // BORC cheque paid
        const amount = Number(cheque.amount);
        const counterparty = cheque.supplier?.name || null;
        const description = data.description || `Çek No: ${cheque.cekNo}`;

        if (data.bankId) {
          // Paid from BANK
          transactionId = await createChequeTransaction(
            cheque.id,
            'CEK_ODENMESI',
            'BANKA',
            data.isoDate,
            amount,
            counterparty,
            description,
            data.bankId,
            0, // incoming
            0, // outgoing
            -amount, // bankDelta negative
            null, // displayIncoming
            null, // displayOutgoing
            updatedBy
          );
        } else {
          // Paid from CASH
          transactionId = await createChequeTransaction(
            cheque.id,
            'CEK_ODENMESI',
            'KASA',
            data.isoDate,
            amount,
            counterparty,
            description,
            null, // bankId
            0, // incoming
            amount, // outgoing
            0, // bankDelta
            null, // displayIncoming
            null, // displayOutgoing
            updatedBy
          );
        }
      }
    } else if (data.newStatus === 'KARSILIKSIZ') {
      // Optional info-only row for bounced cheque
      const amount = Number(cheque.amount);
      const counterparty = (cheque.direction === 'ALACAK' ? cheque.customer?.name : cheque.supplier?.name) || null;
      const description = data.description || `Çek No: ${cheque.cekNo} - Karşılıksız`;

      transactionId = await createChequeTransaction(
        cheque.id,
        'CEK_KARSILIKSIZ',
        'CEK',
        data.isoDate,
        amount,
        counterparty,
        description,
        null, // bankId
        0, // incoming
        0, // outgoing
        0, // bankDelta
        null, // displayIncoming
        amount, // displayOutgoing (optional info)
        updatedBy
      );
    }

    // BUG 7 FIX: When cheque goes to ODEMEDE (given to supplier), set supplierId
    // Note: Transaction is already created by frontend (bank cash out), so we don't create another one
    // Use explicit control flow instead of nested ternaries for clarity
    let supplierIdToSet: string | null | undefined = undefined; // undefined = don't update, null = set to null, string = set to value
    
    if (data.newStatus === 'ODEMEDE' && cheque.direction === 'ALACAK') {
      // Customer cheque given to supplier - validate and set supplierId
      if (data.supplierId) {
        const supplier = await prisma.supplier.findUnique({
          where: { id: data.supplierId, deletedAt: null },
        });
        if (supplier) {
          supplierIdToSet = data.supplierId; // Set to new supplier ID
          // BUG 7 FIX: Don't create transaction here - frontend already created it via bank cash out
          // Transaction is linked via chequeId in the transaction record
          // Just update the cheque status and supplierId (done below)
        } else {
          // Supplier not found - keep existing supplierId (don't update)
          supplierIdToSet = undefined;
        }
      } else {
        // No supplierId provided - keep existing supplierId (don't update)
        supplierIdToSet = undefined;
      }
    } else {
      // Not ODEMEDE status or not ALACAK direction - don't update supplierId
      supplierIdToSet = undefined;
    }
    
    // Build update data - only include supplierId if we want to change it
    const updateData: any = {
      status: data.newStatus,
      bankId: null, // FK kullanmıyoruz
      updatedBy,
      updatedAt: new Date(),
    };
    
    // Only include supplierId in update if we explicitly want to change it
    if (supplierIdToSet !== undefined) {
      updateData.supplierId = supplierIdToSet;
    }
    
    // Update cheque status and supplierId if applicable
    const updated = await prisma.cheque.update({
      where: { id },
      data: updateData,
      include: {
        bank: {
          select: {
            id: true,
            name: true,
            accountNo: true,
            iban: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      cheque: this.mapToDto(updated),
      transactionId,
    };
  }

  /**
   * Get cheque by ID
   */
  async getChequeById(id: string): Promise<ChequeDto | null> {
    const cheque = await prisma.cheque.findUnique({
      where: { id },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
            accountNo: true,
            iban: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!cheque || cheque.deletedAt) {
      return null;
    }

    return this.mapToDto(cheque);
  }

  /**
   * List cheques with filters
   */
  async listCheques(query: ChequeListQuery): Promise<ChequeListResponse> {
    const where: any = {
      deletedAt: null,
    };

    // FIX: Support status filter - if status is provided, use it; if "ALL", show all (no filter)
    if (query.status !== undefined) {
      where.status = query.status;
    }

    if (query.direction) {
      where.direction = query.direction;
    }

    if (query.entryFrom || query.entryTo) {
      where.entryDate = {};
      if (query.entryFrom) {
        where.entryDate.gte = query.entryFrom;
      }
      if (query.entryTo) {
        where.entryDate.lte = query.entryTo;
      }
    }

    if (query.maturityFrom || query.maturityTo) {
      where.maturityDate = {};
      if (query.maturityFrom) {
        where.maturityDate.gte = query.maturityFrom;
      }
      if (query.maturityTo) {
        where.maturityDate.lte = query.maturityTo;
      }
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.bankId) {
      where.bankId = query.bankId;
    }

    if (query.search) {
      where.OR = [
        { cekNo: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const skip = (page - 1) * pageSize;

    const [cheques, totalCount] = await Promise.all([
      prisma.cheque.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { maturityDate: 'asc' },
          { entryDate: 'asc' },
        ],
        include: {
          bank: {
            select: {
              id: true,
              name: true,
              accountNo: true,
              iban: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.cheque.count({ where }),
    ]);

    const totalAmount = cheques.reduce((sum: number, c) => sum + Number(c.amount), 0);

    // Calculate upcoming maturities
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];

    const allCheques = await prisma.cheque.findMany({
      where: {
        ...where,
        status: {
          in: ['KASADA', 'BANKADA_TAHSILDE', 'ODEMEDE'],
        },
      },
    });

    const within7Days = allCheques.filter(
      (c) => c.maturityDate >= today && c.maturityDate <= sevenDaysLaterStr
    ).length;
    const within30Days = allCheques.filter(
      (c) => c.maturityDate >= today && c.maturityDate <= thirtyDaysLaterStr
    ).length;
    const overdue = allCheques.filter((c) => c.maturityDate < today).length;

    return {
      items: cheques.map((c) => this.mapToDto(c)),
      totalCount,
      totalAmount,
      upcomingMaturities: {
        within7Days,
        within30Days,
        overdue,
      },
    };
  }

  /**
   * Map Prisma cheque to DTO
   */
  private mapToDto(cheque: any): ChequeDto {
    return {
      id: cheque.id,
      cekNo: cheque.cekNo,
      amount: Number(cheque.amount),
      entryDate: cheque.entryDate,
      maturityDate: cheque.maturityDate,
      status: cheque.status,
      direction: cheque.direction,
      customerId: cheque.customerId,
      supplierId: cheque.supplierId,
      bankId: cheque.bankId,
      description: cheque.description,
      attachmentId: cheque.attachmentId,
      createdAt: cheque.createdAt.toISOString(),
      createdBy: cheque.createdBy,
      updatedAt: cheque.updatedAt?.toISOString() || null,
      updatedBy: cheque.updatedBy || null,
      deletedAt: cheque.deletedAt?.toISOString() || null,
      deletedBy: cheque.deletedBy || null,
      bank: cheque.bank || null,
      customer: cheque.customer || null,
      supplier: cheque.supplier || null,
    };
  }

  /**
   * Get payable cheques (BORC direction, not paid yet)
   * Used for bank cash out cheque payment dropdown
   * 
   * STANDARD FILTER CONTRACT:
   * - deletedAt = null (active only)
   * - direction = BORC (we pay them)
   * - status != ODENDI (not paid yet)
   * - maturityDate >= todayStart (upcoming or today)
   */
  async getPayableCheques(bankId?: string | null): Promise<PayableChequeDto[]> {
    // Calculate todayStart (Date object, normalized to start of day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartIso = todayStart.toISOString().split('T')[0];
    
    const where: any = {
      deletedAt: null, // Active cheques only
      direction: 'BORC', // Only BORC cheques (we pay them)
      status: { not: 'ODENDI' }, // Not paid yet
      maturityDate: { gte: todayStartIso }, // Upcoming or today (STANDARD CONTRACT)
    };

    // SINGLE SOURCE OF TRUTH FIX: Filter by bankId if provided
    // This ensures only cheques for the selected bank are shown in dropdown
    if (bankId) {
      where.bankId = bankId;
    }

    const cheques = await prisma.cheque.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { maturityDate: 'asc' },
        { createdAt: 'asc' },
      ],
      take: 200,
    });

    return cheques.map((cheque) => ({
      id: cheque.id,
      cekNo: cheque.cekNo,
      maturityDate: cheque.maturityDate,
      amount: cheque.amount.toNumber(),
      counterparty: cheque.supplier?.name || cheque.customer?.name || `Çek ${cheque.cekNo}`,
      bankId: cheque.bankId,
    }));
  }

  /**
   * Pay a cheque from bank (atomic transaction)
   * Creates transaction and updates cheque status in a single DB transaction
   */
  async payCheque(chequeId: string, data: PayChequeDto, createdBy: string): Promise<PayChequeResponse> {
    return await prisma.$transaction(async (tx) => {
      // 1. Find and validate cheque
      const cheque = await tx.cheque.findUnique({
        where: { id: chequeId },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!cheque) {
        throw new Error('Çek bulunamadı');
      }

      if (cheque.deletedAt) {
        throw new Error('Silinmiş çek ödenemez');
      }

      if (cheque.direction !== 'BORC') {
        throw new Error('Sadece BORC çekler ödenebilir');
      }

      if (cheque.status === 'ODENDI') {
        throw new Error('Bu çek zaten ödenmiş');
      }

      // 2. Generate document number (BNK-CKS format: BNK-CKS-DD/MM-XXXX)
      const [year, month, day] = data.paymentDate.split('-');
      const gg = (day ?? '01').padStart(2, '0');
      const aa = (month ?? '01').padStart(2, '0');
      const prefix = `BNK-CKS-${gg}/${aa}-`;
      
      // Find existing transactions with same prefix on the same date
      const existingTransactions = await tx.transaction.findMany({
        where: {
          deletedAt: null,
          isoDate: data.paymentDate,
          documentNo: { startsWith: prefix },
        },
        select: { documentNo: true },
      });
      
      // Find max sequence number
      const maxSeq = existingTransactions.reduce((max, tx) => {
        if (!tx.documentNo || !tx.documentNo.startsWith(prefix)) return max;
        const suffix = tx.documentNo.slice(prefix.length);
        const n = parseInt(suffix, 10);
        return Number.isNaN(n) ? max : Math.max(max, n);
      }, 0);
      
      // Generate next document number
      const nextSeq = String(maxSeq + 1).padStart(4, '0');
      const documentNo = `${prefix}${nextSeq}`;

      // 3. Create transaction
      const amount = cheque.amount.toNumber();
      const counterparty = cheque.supplier?.name || cheque.customer?.name || `Çek ${cheque.cekNo}`;
      // Include supplier name in description if available
      const supplierName = cheque.supplier?.name ? ` - ${cheque.supplier.name}` : '';
      const description = data.note || `Çek No: ${cheque.cekNo}${supplierName}`;

      // FINANCIAL INVARIANT: Bank cash out - only affects bank balance, not cash
      const balanceAfter = await calculateBalanceAfter(data.paymentDate, 0, 0, 'BANKA');

      const transaction = await tx.transaction.create({
        data: {
          isoDate: data.paymentDate,
          documentNo, // Generated document number
          type: 'CEK_ODENMESI',
          source: 'BANKA',
          counterparty,
          description,
          incoming: 0,
          outgoing: 0, // Bank cash out doesn't affect cash balance
          bankDelta: -amount, // Negative: bank balance decreases
          displayIncoming: null,
          displayOutgoing: amount, // Show amount in UI
          balanceAfter,
          bankId: data.bankId,
          chequeId: chequeId,
          createdBy,
        },
      });

      // 3. Update cheque status to ODENDI with payment details
      // STANDARD CONTRACT: Cheque payment sets status=ODENDI, paidAt, paidBankId, paymentTransactionId
      // deletedAt is NEVER set (soft delete is not used for paid cheques)
      const paymentDate = new Date(data.paymentDate + 'T00:00:00Z');
      const updatedCheque = await tx.cheque.update({
        where: { id: chequeId },
        data: {
          status: 'ODENDI', // STANDARD CONTRACT: Paid cheques have status=ODENDI
          paidAt: paymentDate,
          paidBankId: data.bankId,
          paymentTransactionId: transaction.id,
          updatedAt: new Date(),
          updatedBy: createdBy,
          // CRITICAL: deletedAt is NOT set - paid cheques remain visible in reports
        },
        select: {
          id: true,
          status: true,
          paidAt: true,
          paidBankId: true,
          paymentTransactionId: true,
        },
      });

      return {
        ok: true,
        paidChequeId: chequeId,
        transactionId: transaction.id,
        updatedCheque: {
          id: updatedCheque.id,
          status: updatedCheque.status,
          paidAt: updatedCheque.paidAt?.toISOString() || null,
          paidBankId: updatedCheque.paidBankId,
          paymentTransactionId: updatedCheque.paymentTransactionId,
        },
      };
    });
  }
}

