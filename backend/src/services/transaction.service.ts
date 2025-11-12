import {
  Prisma,
  TransactionDirection,
  TransactionMethod,
  TransactionType,
  TransactionCategory,
  CheckMoveAction,
  CheckStatus,
} from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middlewares/error-handler.js";
import { generateTransactionNo } from "../utils/ids.js";

type Tx = Prisma.TransactionClient;

interface BaseTransactionInput {
  amount: number;
  txnDate?: string | Date;
  description?: string;
  note?: string;
  contactId?: string | null;
  bankAccountId?: string | null;
  cardId?: string | null;
  checkId?: string | null;
  category?: TransactionCategory | null;
  meta?: Prisma.InputJsonValue;
  tagIds?: string[];
  createdById: string;
}

interface PosInput extends BaseTransactionInput {
  bankAccountId: string;
  posBrut: number;
  posKomisyon: number;
  effectiveRate?: number;
}

const toDecimal = (value: number) => new Prisma.Decimal(value.toFixed(2));
const toDecimalRate = (value: number) => new Prisma.Decimal(value.toFixed(4));

const normalizeDate = (value?: string | Date) => {
  const reference = value instanceof Date ? value : value ? new Date(value) : new Date();
  if (Number.isNaN(reference.getTime())) {
    throw new HttpError(400, "Geçersiz tarih formatı");
  }
  return new Date(Date.UTC(reference.getFullYear(), reference.getMonth(), reference.getDate()));
};

const applyTags = async (tx: Tx, transactionId: string, tagIds?: string[]) => {
  if (!tagIds?.length) return;
  await tx.txnTag.createMany({
    data: tagIds.map((tagId) => ({ transactionId, tagId })),
    skipDuplicates: true,
  });
};

const createTransaction = async (
  tx: Tx,
  data: {
    method: TransactionMethod;
    type: TransactionType;
    direction: TransactionDirection;
    pos?: {
      brut?: number;
      komisyon?: number;
      net?: number;
      effectiveRate?: number;
    };
  } & BaseTransactionInput,
) => {
  const txnDate = normalizeDate(data.txnDate);

  const transaction = await tx.transaction.create({
    data: {
      txnNo: generateTransactionNo(),
      method: data.method,
      type: data.type,
      direction: data.direction,
      amount: toDecimal(data.amount),
      currency: "TRY",
      txnDate,
      description: data.description ?? null,
      note: data.note ?? null,
      bankAccountId: data.bankAccountId ?? null,
      cardId: data.cardId ?? null,
      contactId: data.contactId ?? null,
      checkId: data.checkId ?? null,
      createdById: data.createdById,
      category: data.category ?? null,
      meta: data.meta !== undefined ? data.meta : Prisma.DbNull,
      posBrut: data.pos?.brut !== undefined ? toDecimal(data.pos.brut) : null,
      posKomisyon:
        data.pos?.komisyon !== undefined ? toDecimal(data.pos.komisyon) : null,
      posNet: data.pos?.net !== undefined ? toDecimal(data.pos.net) : null,
      posEffectiveRate:
        data.pos?.effectiveRate !== undefined ? toDecimalRate(data.pos.effectiveRate) : null,
    },
  });

  await applyTags(tx, transaction.id, data.tagIds);
  return transaction;
};

async function ensureBankAccount(tx: Tx, id: string) {
  const bankAccount = await tx.bankAccount.findUnique({ where: { id } });
  if (!bankAccount) {
    throw new HttpError(404, "Banka hesabı bulunamadı");
  }
  return bankAccount;
}

async function ensureContact(tx: Tx, id: string, message: string) {
  const contact = await tx.contact.findUnique({ where: { id } });
  if (!contact) {
    throw new HttpError(404, message);
  }
  return contact;
}

async function ensureCard(tx: Tx, id: string) {
  const card = await tx.card.findUnique({ where: { id } });
  if (!card) {
    throw new HttpError(404, "Kart bulunamadı");
  }
  return card;
}

async function ensureCheck(tx: Tx, id: string) {
  const check = await tx.check.findUnique({ where: { id } });
  if (!check) {
    throw new HttpError(404, "Çek bulunamadı");
  }
  return check;
}

export class TransactionService {
  static async cashIn(payload: BaseTransactionInput & { contactId?: string }) {
    await prisma.$transaction(async (tx) => {
      if (payload.contactId) {
        await ensureContact(tx, payload.contactId, "Müşteri bulunamadı");
      }

      await createTransaction(tx, {
        ...payload,
        method: TransactionMethod.CASH,
        type: TransactionType.CASH_IN,
        direction: TransactionDirection.INFLOW,
      });
    });
  }

  static async cashOut(
    payload: BaseTransactionInput & {
      category: TransactionCategory;
    },
  ) {
    await prisma.$transaction(async (tx) => {
      if (payload.contactId) {
        await ensureContact(tx, payload.contactId, "Tedarikçi bulunamadı");
      }

      await createTransaction(tx, {
        ...payload,
        method: TransactionMethod.CASH,
        type: TransactionType.CASH_OUT,
        direction: TransactionDirection.OUTFLOW,
      });
    });
  }

  static async bankIn(payload: BaseTransactionInput & { bankAccountId: string }) {
    await prisma.$transaction(async (tx) => {
      await ensureBankAccount(tx, payload.bankAccountId);
      if (payload.contactId) {
        await ensureContact(tx, payload.contactId, "Müşteri bulunamadı");
      }

      await createTransaction(tx, {
        ...payload,
        method: TransactionMethod.BANK,
        type: TransactionType.BANK_IN,
        direction: TransactionDirection.INFLOW,
      });
    });
  }

  static async bankOut(
    payload: BaseTransactionInput & {
      bankAccountId: string;
      category: TransactionCategory;
    },
  ) {
    await prisma.$transaction(async (tx) => {
      await ensureBankAccount(tx, payload.bankAccountId);
      if (payload.contactId) {
        await ensureContact(tx, payload.contactId, "Tedarikçi bulunamadı");
      }

      await createTransaction(tx, {
        ...payload,
        method: TransactionMethod.BANK,
        type: TransactionType.BANK_OUT,
        direction: TransactionDirection.OUTFLOW,
      });
    });
  }

  static async posCollection(payload: PosInput) {
    const posNet = payload.posBrut - payload.posKomisyon;
    const effectiveRate =
      payload.posBrut === 0 ? 0 : Number((payload.posKomisyon / payload.posBrut).toFixed(4));

    await prisma.$transaction(async (tx) => {
      const bankAccount = await ensureBankAccount(tx, payload.bankAccountId);

      await createTransaction(tx, {
        ...payload,
        amount: posNet,
        method: TransactionMethod.BANK,
        type: TransactionType.POS_COLLECTION,
        direction: TransactionDirection.INFLOW,
        pos: {
          brut: payload.posBrut,
          komisyon: payload.posKomisyon,
          net: posNet,
          effectiveRate,
        },
        description:
          payload.description ??
          `${bankAccount.name} POS tahsilatı (brüt ${payload.posBrut.toFixed(2)} TL)`,
      });

      await createTransaction(tx, {
        ...payload,
        amount: payload.posKomisyon,
        method: TransactionMethod.BANK,
        type: TransactionType.POS_COMMISSION,
        direction: TransactionDirection.OUTFLOW,
        pos: {
          brut: payload.posBrut,
          komisyon: payload.posKomisyon,
          net: posNet,
          effectiveRate,
        },
        description:
          payload.description ??
          `${bankAccount.name} POS komisyonu (${(effectiveRate * 100).toFixed(2)}%)`,
      });
    });
  }

  static async cardExpense(
    payload: BaseTransactionInput & {
      cardId: string;
      category: TransactionCategory;
    },
  ) {
    await prisma.$transaction(async (tx) => {
      const card = await ensureCard(tx, payload.cardId);

      await createTransaction(tx, {
        ...payload,
        method: TransactionMethod.CARD,
        type: TransactionType.CARD_EXPENSE,
        direction: TransactionDirection.OUTFLOW,
      });

      await tx.card.update({
        where: { id: card.id },
        data: {
          currentRisk: card.currentRisk.plus(toDecimal(payload.amount)),
        },
      });
    });
  }

  static async cardPayment(
    payload: BaseTransactionInput & {
      cardId: string;
      bankAccountId?: string;
    },
  ) {
    await prisma.$transaction(async (tx) => {
      const card = await ensureCard(tx, payload.cardId);
      if (payload.bankAccountId) {
        await ensureBankAccount(tx, payload.bankAccountId);
      }

      await createTransaction(tx, {
        ...payload,
        method: payload.bankAccountId ? TransactionMethod.BANK : TransactionMethod.CARD,
        type: TransactionType.CARD_PAYMENT,
        direction: TransactionDirection.OUTFLOW,
      });

      const updatedRisk = card.currentRisk.minus(toDecimal(payload.amount));
      await tx.card.update({
        where: { id: card.id },
        data: {
          currentRisk: updatedRisk.lessThan(0) ? new Prisma.Decimal(0) : updatedRisk,
        },
      });
    });
  }

  static async registerCheckPayment(
    payload: BaseTransactionInput & { checkId: string; bankAccountId: string },
  ) {
    await prisma.$transaction(async (tx) => {
      const check = await ensureCheck(tx, payload.checkId);
      if (check.status === CheckStatus.PAID) {
        throw new HttpError(400, "Çek zaten ödenmiş");
      }
      await ensureBankAccount(tx, payload.bankAccountId);

      const transaction = await createTransaction(tx, {
        ...payload,
        method: TransactionMethod.BANK,
        type: TransactionType.CHECK_PAYMENT,
        direction: TransactionDirection.OUTFLOW,
      });

      await tx.check.update({
        where: { id: check.id },
        data: { status: CheckStatus.PAID },
      });

      await tx.checkMove.create({
        data: {
          checkId: check.id,
          action: CheckMoveAction.PAYMENT,
          transactionId: transaction.id,
          description: payload.description ?? null,
          performedById: payload.createdById,
        },
      });
    });
  }

  static async deleteTransaction(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new HttpError(404, "İşlem bulunamadı");
    }

    await prisma.$transaction(async (tx) => {
      await tx.txnTag.deleteMany({ where: { transactionId: id } });

      if (transaction.cardId) {
        const card = await tx.card.findUnique({ where: { id: transaction.cardId } });
        if (card) {
          if (transaction.type === TransactionType.CARD_EXPENSE) {
            const updatedRisk = card.currentRisk.minus(transaction.amount);
            await tx.card.update({
              where: { id: card.id },
              data: {
                currentRisk: updatedRisk.lessThan(0) ? new Prisma.Decimal(0) : updatedRisk,
              },
            });
          }

          if (transaction.type === TransactionType.CARD_PAYMENT) {
            const updatedRisk = card.currentRisk.plus(transaction.amount);
            await tx.card.update({
              where: { id: card.id },
              data: { currentRisk: updatedRisk },
            });
          }
        }
      }

      await tx.transaction.delete({ where: { id } });
    });
  }

  static async getDailyLedger(params: { startDate?: string; endDate?: string }) {
    const start = params.startDate ? new Date(params.startDate) : new Date();
    const end = params.endDate ? new Date(params.endDate) : new Date();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new HttpError(400, "Geçersiz tarih aralığı");
    }

    const rangeStart = startOfDay(start);
    const rangeEnd = endOfDay(end);

    const transactions = await prisma.transaction.findMany({
      where: {
        txnDate: {
          gte: rangeStart,
          lte: rangeEnd,
        },
      },
      include: {
        contact: { select: { name: true } },
        bankAccount: { select: { name: true } },
        card: { select: { name: true } },
        tags: { include: { tag: true } },
      },
      orderBy: [
        { txnDate: "asc" },
        { createdAt: "asc" },
      ],
    });

    return {
      transactions,
      range: {
        start: rangeStart,
        end: rangeEnd,
      },
    };
  }
}
