import { prisma } from '../../config/prisma';
import { normalizeAmounts, validateTransactionBusinessRules } from '../transactions/transactions.validation';
import { TransactionRecord } from '../transactions/transactions.types';
import { ChequeDto, ChequeQueryDTO, CreateChequeDTO, PaginatedCheques, UpdateChequeDTO, UpdateChequeStatusDTO } from './cheques.types';

export class ChequesService {
  async getCheques(query: ChequeQueryDTO): Promise<PaginatedCheques> {
    const where: Record<string, any> = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.direction) {
      where.direction = query.direction;
    }

    if (query.entryFrom || query.entryTo) {
      where.entryDate = {};
      if (query.entryFrom) where.entryDate.gte = query.entryFrom;
      if (query.entryTo) where.entryDate.lte = query.entryTo;
    }

    if (query.maturityFrom || query.maturityTo) {
      where.maturityDate = {};
      if (query.maturityFrom) where.maturityDate.gte = query.maturityFrom;
      if (query.maturityTo) where.maturityDate.lte = query.maturityTo;
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

    const skip = ((query.page ?? 1) - 1) * (query.pageSize ?? 50);
    const take = query.pageSize ?? 50;

    const [items, totalCount, totalAmount] = await prisma.$transaction([
      prisma.cheque.findMany({
        where,
        skip,
        take,
        orderBy: [
          { maturityDate: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      prisma.cheque.count({ where }),
      prisma.cheque.aggregate({ where, _sum: { amount: true } }),
    ]);

    return {
      items: items.map((c: any) => this.toChequeDto(c)),
      totalCount,
      totalAmount: Number(totalAmount._sum.amount ?? 0),
    };
  }

  async createCheque(payload: CreateChequeDTO): Promise<ChequeDto> {
    const status = payload.direction === 'ALACAK' ? 'KASADA' : 'ODEMEDE';

    const created = await prisma.cheque.create({
      data: {
        cekNo: payload.cekNo,
        amount: payload.amount,
        entryDate: payload.entryDate,
        maturityDate: payload.maturityDate,
        direction: payload.direction,
        status,
        customerId: payload.customerId ?? null,
        supplierId: payload.supplierId ?? null,
        bankId: payload.bankId ?? null,
        description: payload.description ?? null,
        attachmentId: payload.attachmentId ?? null,
        createdBy: payload.createdBy,
      },
    });

    return this.toChequeDto(created);
  }

  async updateCheque(id: string, payload: UpdateChequeDTO): Promise<ChequeDto> {
    const existing = await prisma.cheque.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error('Cheque not found.');
    }

    const data: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: payload.updatedBy,
    };

    if (payload.cekNo !== undefined) data.cekNo = payload.cekNo;
    if (payload.amount !== undefined) data.amount = payload.amount;
    if (payload.entryDate !== undefined) data.entryDate = payload.entryDate;
    if (payload.maturityDate !== undefined) data.maturityDate = payload.maturityDate;
    if (payload.customerId !== undefined) data.customerId = payload.customerId ?? null;
    if (payload.supplierId !== undefined) data.supplierId = payload.supplierId ?? null;
    if (payload.bankId !== undefined) data.bankId = payload.bankId ?? null;
    if (payload.description !== undefined) data.description = payload.description ?? null;
    if (payload.attachmentId !== undefined) data.attachmentId = payload.attachmentId ?? null;

    const updated = await prisma.cheque.update({
      where: { id },
      data,
    });

    return this.toChequeDto(updated);
  }

  async updateChequeStatus(
    id: string,
    payload: UpdateChequeStatusDTO,
  ): Promise<{ cheque: ChequeDto; transaction?: TransactionRecord }> {
    const cheque = await prisma.cheque.findUnique({ where: { id } });
    if (!cheque || cheque.deletedAt) {
      throw new Error('Cheque not found.');
    }

    this.ensureTransitionAllowed(cheque, payload.newStatus);

    const amount = Number(cheque.amount);
    const effectiveBankId = payload.bankId ?? cheque.bankId ?? null;

    if (
      payload.newStatus === 'TAHSIL_EDILDI' &&
      cheque.direction === 'ALACAK' &&
      cheque.status === 'BANKADA_TAHSILDE' &&
      !effectiveBankId
    ) {
      throw new Error('bankId is required to collect a cheque that is at the bank.');
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const chequeUpdateData: Record<string, unknown> = {
        status: payload.newStatus,
        updatedAt: new Date(),
        updatedBy: payload.updatedBy,
      };

      if (payload.newStatus === 'BANKADA_TAHSILDE') {
        if (!payload.bankId) {
          throw new Error('bankId is required when moving cheque to BANKADA_TAHSILDE.');
        }
        chequeUpdateData.bankId = payload.bankId;
      }

      if (payload.bankId !== undefined && payload.bankId !== null) {
        chequeUpdateData.bankId = payload.bankId;
      }

      const updatedCheque = await tx.cheque.update({
        where: { id },
        data: chequeUpdateData,
      });

      let createdTx: TransactionRecord | undefined;

      if (payload.newStatus === 'TAHSIL_EDILDI') {
        if (cheque.direction === 'ALACAK') {
          if (effectiveBankId) {
            createdTx = await this.createLinkedTransaction(tx, {
              isoDate: payload.isoDate,
              documentNo: null,
              type: 'CEK_TAHSIL_BANKA',
              source: 'BANKA',
              counterparty: null,
              description: updatedCheque.description ?? null,
              incoming: 0,
              outgoing: 0,
              bankDelta: amount,
              displayIncoming: 0,
              displayOutgoing: 0,
              cashAccountId: null,
              bankId: effectiveBankId,
              creditCardId: null,
              chequeId: updatedCheque.id,
              customerId: updatedCheque.customerId ?? null,
              supplierId: updatedCheque.supplierId ?? null,
              attachmentId: updatedCheque.attachmentId ?? null,
              createdBy: payload.updatedBy,
            });
          } else {
            createdTx = await this.createLinkedTransaction(tx, {
              isoDate: payload.isoDate,
              documentNo: null,
              type: 'CEK_TAHSIL_BANKA',
              source: 'KASA',
              counterparty: null,
              description: updatedCheque.description ?? null,
              incoming: amount,
              outgoing: 0,
              bankDelta: 0,
              displayIncoming: 0,
              displayOutgoing: 0,
              cashAccountId: null,
              bankId: null,
              creditCardId: null,
              chequeId: updatedCheque.id,
              customerId: updatedCheque.customerId ?? null,
              supplierId: updatedCheque.supplierId ?? null,
              attachmentId: updatedCheque.attachmentId ?? null,
              createdBy: payload.updatedBy,
            });
          }
        } else {
          if (effectiveBankId) {
            createdTx = await this.createLinkedTransaction(tx, {
              isoDate: payload.isoDate,
              documentNo: null,
              type: 'CEK_ODENMESI',
              source: 'BANKA',
              counterparty: null,
              description: updatedCheque.description ?? null,
              incoming: 0,
              outgoing: 0,
              bankDelta: -amount,
              displayIncoming: 0,
              displayOutgoing: 0,
              cashAccountId: null,
              bankId: effectiveBankId,
              creditCardId: null,
              chequeId: updatedCheque.id,
              customerId: updatedCheque.customerId ?? null,
              supplierId: updatedCheque.supplierId ?? null,
              attachmentId: updatedCheque.attachmentId ?? null,
              createdBy: payload.updatedBy,
            });
          } else {
            createdTx = await this.createLinkedTransaction(tx, {
              isoDate: payload.isoDate,
              documentNo: null,
              type: 'CEK_ODENMESI',
              source: 'KASA',
              counterparty: null,
              description: updatedCheque.description ?? null,
              incoming: 0,
              outgoing: amount,
              bankDelta: 0,
              displayIncoming: 0,
              displayOutgoing: 0,
              cashAccountId: null,
              bankId: null,
              creditCardId: null,
              chequeId: updatedCheque.id,
              customerId: updatedCheque.customerId ?? null,
              supplierId: updatedCheque.supplierId ?? null,
              attachmentId: updatedCheque.attachmentId ?? null,
              createdBy: payload.updatedBy,
            });
          }
        }
      } else if (payload.newStatus === 'KARSILIKSIZ') {
        createdTx = await this.createLinkedTransaction(tx, {
          isoDate: payload.isoDate,
          documentNo: null,
          type: 'CEK_KARSILIKSIZ',
          source: 'CEK',
          counterparty: null,
          description: updatedCheque.description ?? null,
          incoming: 0,
          outgoing: 0,
          bankDelta: 0,
          displayIncoming: 0,
          displayOutgoing: amount,
          cashAccountId: null,
          bankId: null,
          creditCardId: null,
          chequeId: updatedCheque.id,
          customerId: updatedCheque.customerId ?? null,
          supplierId: updatedCheque.supplierId ?? null,
          attachmentId: updatedCheque.attachmentId ?? null,
          createdBy: payload.updatedBy,
        });
      }

      return {
        cheque: this.toChequeDto(updatedCheque),
        transaction: createdTx,
      };
    });

    return result;
  }

  private ensureTransitionAllowed(cheque: any, newStatus: string) {
    const current = cheque.status;
    if (newStatus === current) {
      throw new Error('Cheque is already in the requested status.');
    }

    if (cheque.direction === 'ALACAK') {
      const allowed: Record<string, string[]> = {
        KASADA: ['BANKADA_TAHSILDE', 'TAHSIL_EDILDI', 'KARSILIKSIZ'],
        BANKADA_TAHSILDE: ['TAHSIL_EDILDI', 'KARSILIKSIZ'],
        TAHSIL_EDILDI: ['KARSILIKSIZ'],
        ODEMEDE: [],
        KARSILIKSIZ: [],
      };
      if (!allowed[current] || !allowed[current].includes(newStatus)) {
        throw new Error(`Transition from ${current} to ${newStatus} is not allowed for ALACAK cheques.`);
      }
    } else {
      const allowed: Record<string, string[]> = {
        ODEMEDE: ['TAHSIL_EDILDI', 'KARSILIKSIZ'],
        TAHSIL_EDILDI: ['KARSILIKSIZ'],
        KASADA: [],
        BANKADA_TAHSILDE: [],
        KARSILIKSIZ: [],
      };
      if (!allowed[current] || !allowed[current].includes(newStatus)) {
        throw new Error(`Transition from ${current} to ${newStatus} is not allowed for BORC cheques.`);
      }
    }
  }

  private toChequeDto(model: any): ChequeDto {
    return {
      id: model.id,
      cekNo: model.cekNo,
      amount: Number(model.amount),
      entryDate: model.entryDate,
      maturityDate: model.maturityDate,
      status: model.status,
      direction: model.direction,
      customerId: model.customerId,
      supplierId: model.supplierId,
      bankId: model.bankId,
      description: model.description,
      attachmentId: model.attachmentId,
      createdAt: model.createdAt,
      createdBy: model.createdBy,
      updatedAt: model.updatedAt,
      updatedBy: model.updatedBy,
      deletedAt: model.deletedAt,
      deletedBy: model.deletedBy,
    };
  }

  private async createLinkedTransaction(tx: any, payload: any): Promise<TransactionRecord> {
    const normalized = normalizeAmounts(payload);
    validateTransactionBusinessRules(normalized);

    const transaction = await tx.transaction.create({
      data: {
        isoDate: normalized.isoDate,
        documentNo: normalized.documentNo ?? null,
        type: normalized.type,
        source: normalized.source,
        counterparty: normalized.counterparty ?? null,
        description: normalized.description ?? null,
        incoming: normalized.incoming,
        outgoing: normalized.outgoing,
        bankDelta: normalized.bankDelta,
        displayIncoming:
          normalized.displayIncoming && Math.abs(normalized.displayIncoming) > 0
            ? normalized.displayIncoming
            : null,
        displayOutgoing:
          normalized.displayOutgoing && Math.abs(normalized.displayOutgoing) > 0
            ? normalized.displayOutgoing
            : null,
        balanceAfter: 0,
        cashAccountId: normalized.cashAccountId ?? null,
        bankId: normalized.bankId ?? null,
        creditCardId: normalized.creditCardId ?? null,
        chequeId: normalized.chequeId ?? null,
        customerId: normalized.customerId ?? null,
        supplierId: normalized.supplierId ?? null,
        attachmentId: normalized.attachmentId ?? null,
        createdBy: normalized.createdBy,
      },
    });

    await this.recomputeCashBalances(tx);

    return {
      ...transaction,
      incoming: Number(transaction.incoming ?? 0),
      outgoing: Number(transaction.outgoing ?? 0),
      bankDelta: Number(transaction.bankDelta ?? 0),
      displayIncoming: transaction.displayIncoming ? Number(transaction.displayIncoming) : null,
      displayOutgoing: transaction.displayOutgoing ? Number(transaction.displayOutgoing) : null,
    } as TransactionRecord;
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
      // eslint-disable-next-line no-await-in-loop
      await tx.transaction.update({
        where: { id: t.id },
        data: { balanceAfter: runningBalance },
      });
    }
  }
}
