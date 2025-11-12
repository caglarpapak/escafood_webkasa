import {
  Prisma,
  TransactionCategory,
  TransactionDirection,
  TransactionMethod,
  TransactionType,
  CheckMoveAction,
  CheckStatus,
  PosProvider,
} from "@prisma/client";
import { endOfDay, format as formatDateFn, startOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middlewares/error-handler.js";
import { generateTransactionNo } from "../utils/ids.js";
import { NotificationService } from "./notification.service.js";

const TIMEZONE = "Europe/Istanbul";

type Tx = Prisma.TransactionClient;

interface Actor {
  id: string;
  email: string;
  fullName: string;
}

interface AttachmentInput {
  path: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface BaseTransactionInput {
  actor: Actor;
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
  tagNames?: string[];
  plate?: string | null;
  posProvider?: PosProvider | null;
}

interface PosInput extends BaseTransactionInput {
  bankAccountId: string;
  mode: "net_komisyon" | "brut_komisyon";
  net?: number;
  brut?: number;
  komisyon: number;
  provider?: "ykb" | "enpara" | "other";
}

interface CardExpenseInput extends BaseTransactionInput {
  cardId: string;
  category: TransactionCategory;
  attachments: AttachmentInput[];
}

const toDecimal = (value: number) => new Prisma.Decimal(value.toFixed(2));
const toDecimalRate = (value: number) => new Prisma.Decimal(value.toFixed(4));

const toRelativePath = (absolutePath: string) => {
  const prefix = `${process.cwd()}/`;
  return absolutePath.startsWith(prefix) ? absolutePath.slice(prefix.length) : absolutePath;
};

const normalizeDate = (value?: string | Date) => {
  if (!value) {
    const zonedNow = toZonedTime(new Date(), TIMEZONE);
    const dateString = formatDateFn(zonedNow, "yyyy-MM-dd");
    return fromZonedTime(`${dateString}T00:00:00`, TIMEZONE);
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new HttpError(400, "Geçersiz tarih formatı");
    }
    const zoned = toZonedTime(value, TIMEZONE);
    const dateString = formatDateFn(zoned, "yyyy-MM-dd");
    return fromZonedTime(`${dateString}T00:00:00`, TIMEZONE);
  }

  const trimmed = value.trim();
  const parsed = fromZonedTime(`${trimmed}T00:00:00`, TIMEZONE);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError(400, "Geçersiz tarih formatı");
  }
  return parsed;
};

const startOfTodayUtc = () => {
  const zoned = toZonedTime(new Date(), TIMEZONE);
  const dateString = formatDateFn(zoned, "yyyy-MM-dd");
  return fromZonedTime(`${dateString}T00:00:00`, TIMEZONE);
};

const isBackdated = (txnDate: Date) => txnDate < startOfTodayUtc();

const ensureTag = async (tx: Tx, name: string) => {
  const tag = await tx.tag.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  return tag.id;
};

const applyTags = async (tx: Tx, transactionId: string, tagNames?: string[]) => {
  if (!tagNames?.length) return;
  const tagIds = await Promise.all(tagNames.map((name) => ensureTag(tx, name)));
  await tx.txnTag.createMany({
    data: tagIds.map((tagId) => ({ transactionId, tagId })),
    skipDuplicates: true,
  });
};

const createAttachments = async (
  tx: Tx,
  transactionId: string,
  files: AttachmentInput[] | undefined,
  uploaderId: string,
) => {
  if (!files?.length) return;
  await tx.attachment.createMany({
    data: files.map((file) => ({
      path: toRelativePath(file.path),
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      uploaderId,
      transactionId,
    })),
  });
};

const mapPosProvider = (provider?: string): PosProvider | null => {
  switch (provider?.toLowerCase()) {
    case "ykb":
    case "yapı kredi":
      return PosProvider.YKB;
    case "enpara":
      return PosProvider.ENPARA;
    default:
      return provider ? PosProvider.OTHER : null;
  }
};

const createTransaction = async (
  tx: Tx,
  data: {
    method: TransactionMethod;
    type: TransactionType;
    direction: TransactionDirection;
    actor: Actor;
    pos?: {
      brut?: number;
      komisyon?: number;
      net?: number;
      effectiveRate?: number;
      provider?: PosProvider | null;
    };
  } & Omit<BaseTransactionInput, "actor" | "posProvider">,
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
      channelReference: data.meta && "reference" in (data.meta as object) ? String((data.meta as { reference?: unknown }).reference) : null,
      category: data.category ?? null,
      plate: data.plate ?? null,
      bankAccountId: data.bankAccountId ?? null,
      cardId: data.cardId ?? null,
      contactId: data.contactId ?? null,
      checkId: data.checkId ?? null,
      createdById: data.actor.id,
      meta: data.meta ?? Prisma.DbNull,
      posBrut: data.pos?.brut !== undefined ? toDecimal(data.pos.brut) : null,
      posKomisyon: data.pos?.komisyon !== undefined ? toDecimal(data.pos.komisyon) : null,
      posNet: data.pos?.net !== undefined ? toDecimal(data.pos.net) : null,
      posEffectiveRate:
        data.pos?.effectiveRate !== undefined ? toDecimalRate(data.pos.effectiveRate) : null,
      posProvider: data.pos?.provider ?? null,
    },
  });

  await applyTags(tx, transaction.id, data.tagNames);
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

const notifyBackdatedIfNeeded = async (transaction: { txnNo: string; txnDate: Date; amount: Prisma.Decimal; description: string | null; note: string | null }, actor: Actor) => {
  if (isBackdated(transaction.txnDate)) {
    await NotificationService.sendBackdatedTransaction({
      txnNo: transaction.txnNo,
      amount: Number(transaction.amount),
      description: transaction.description ?? transaction.note,
      txnDate: transaction.txnDate,
      performedAt: new Date(),
      actor,
    });
  }
};

export class TransactionService {
  static async cashIn(payload: BaseTransactionInput & { contactId?: string | null }) {
    const { actor } = payload;

    const result = await prisma.$transaction(async (tx) => {
      if (payload.contactId) {
        await ensureContact(tx, payload.contactId, "Müşteri bulunamadı");
      }

      const transaction = await createTransaction(tx, {
        ...payload,
        actor,
        method: TransactionMethod.CASH,
        type: TransactionType.CASH_IN,
        direction: TransactionDirection.INFLOW,
      });

      return transaction;
    });

    await notifyBackdatedIfNeeded(result, actor);
    return result;
  }

  static async cashOut(
    payload: BaseTransactionInput & {
      category: TransactionCategory;
    },
  ) {
    const { actor } = payload;

    const result = await prisma.$transaction(async (tx) => {
      if (payload.contactId) {
        await ensureContact(tx, payload.contactId, "Tedarikçi bulunamadı");
      }

      const transaction = await createTransaction(tx, {
        ...payload,
        actor,
        method: TransactionMethod.CASH,
        type: TransactionType.CASH_OUT,
        direction: TransactionDirection.OUTFLOW,
      });

      return transaction;
    });

    await notifyBackdatedIfNeeded(result, actor);
    return result;
  }

  static async bankIn(payload: BaseTransactionInput & { bankAccountId: string }) {
    const { actor } = payload;

    const result = await prisma.$transaction(async (tx) => {
      await ensureBankAccount(tx, payload.bankAccountId);
      if (payload.contactId) {
        await ensureContact(tx, payload.contactId, "Müşteri bulunamadı");
      }

      const transaction = await createTransaction(tx, {
        ...payload,
        actor,
        method: TransactionMethod.BANK,
        type: TransactionType.BANK_IN,
        direction: TransactionDirection.INFLOW,
      });

      return transaction;
    });

    await notifyBackdatedIfNeeded(result, actor);
    return result;
  }

  static async bankOut(
    payload: BaseTransactionInput & {
      bankAccountId: string;
      category: TransactionCategory;
    },
  ) {
    const { actor } = payload;

    const result = await prisma.$transaction(async (tx) => {
      await ensureBankAccount(tx, payload.bankAccountId);
      if (payload.contactId) {
        await ensureContact(tx, payload.contactId, "Tedarikçi bulunamadı");
      }

      const transaction = await createTransaction(tx, {
        ...payload,
        actor,
        method: TransactionMethod.BANK,
        type: TransactionType.BANK_OUT,
        direction: TransactionDirection.OUTFLOW,
      });

      return transaction;
    });

    await notifyBackdatedIfNeeded(result, actor);
    return result;
  }

  static async posCollection(payload: PosInput) {
    const {
      actor,
      mode,
      net: netValue,
      brut: brutValue,
      komisyon,
      provider,
      ...basePayload
    } = payload;

    const result = await prisma.$transaction(async (tx) => {
      const bankAccount = await ensureBankAccount(tx, basePayload.bankAccountId!);

      let brut: number;
      let net: number;

      if (mode === "net_komisyon") {
        if (netValue === undefined) {
          throw new HttpError(400, "Net tutar zorunludur");
        }
        net = netValue;
        brut = net + komisyon;
      } else {
        if (brutValue === undefined) {
          throw new HttpError(400, "Brüt tutar zorunludur");
        }
        brut = brutValue;
        net = brut - komisyon;
      }

      if (brut <= 0 || net < 0) {
        throw new HttpError(400, "POS tutarları geçersiz");
      }

      const effectiveRate = brut === 0 ? 0 : Number((komisyon / brut).toFixed(4));
      const posProvider = mapPosProvider(provider);

      const collection = await createTransaction(tx, {
        ...basePayload,
        actor,
        amount: net,
        method: TransactionMethod.BANK,
        type: TransactionType.POS_COLLECTION,
        direction: TransactionDirection.INFLOW,
        tagNames: [...new Set([...(basePayload.tagNames ?? []), "POS"])],
        pos: {
          brut,
          komisyon,
          net,
          effectiveRate,
          provider: posProvider,
        },
        description:
          basePayload.description ??
          `${bankAccount.name} POS tahsilatı (brüt ${brut.toFixed(2)} TL)`,
      });

      await createTransaction(tx, {
        ...basePayload,
        actor,
        amount: komisyon,
        method: TransactionMethod.BANK,
        type: TransactionType.POS_COMMISSION,
        direction: TransactionDirection.OUTFLOW,
        tagNames: [...new Set([...(basePayload.tagNames ?? []), "POS Komisyonu"])],
        pos: {
          brut,
          komisyon,
          net,
          effectiveRate,
          provider: posProvider,
        },
        description:
          basePayload.description ??
          `${bankAccount.name} POS komisyonu (${(effectiveRate * 100).toFixed(2)}%)`,
      });

      return collection;
    });

    await notifyBackdatedIfNeeded(result, actor);
    return result;
  }

  static async cardExpense(payload: CardExpenseInput) {
    const { actor, attachments, ...basePayload } = payload;

    if (!attachments?.length) {
      throw new HttpError(400, "Kart masrafı için slip fotoğrafı zorunludur");
    }

    const result = await prisma.$transaction(async (tx) => {
      const card = await ensureCard(tx, basePayload.cardId);

      const { tagNames, ...restPayload } = basePayload;

      const transaction = await createTransaction(tx, {
        ...restPayload,
        ...(tagNames ? { tagNames } : {}),
        actor,
        method: TransactionMethod.CARD,
        type: TransactionType.CARD_EXPENSE,
        direction: TransactionDirection.OUTFLOW,
      });

      await createAttachments(tx, transaction.id, attachments, actor.id);

      await tx.card.update({
        where: { id: card.id },
        data: {
          riskTry: card.riskTry.plus(toDecimal(basePayload.amount)),
        },
      });

      return transaction;
    });

    await notifyBackdatedIfNeeded(result, actor);
    return result;
  }

  static async cardPayment(
    payload: BaseTransactionInput & {
      cardId: string;
      bankAccountId?: string | null;
    },
  ) {
    const { actor, ...basePayload } = payload;

    const result = await prisma.$transaction(async (tx) => {
      const card = await ensureCard(tx, basePayload.cardId);
      if (basePayload.bankAccountId) {
        await ensureBankAccount(tx, basePayload.bankAccountId);
      }

      const transaction = await createTransaction(tx, {
        ...basePayload,
        actor,
        method: basePayload.bankAccountId ? TransactionMethod.BANK : TransactionMethod.CARD,
        type: TransactionType.CARD_PAYMENT,
        direction: TransactionDirection.OUTFLOW,
      });

      const updatedRisk = card.riskTry.minus(toDecimal(basePayload.amount));
      await tx.card.update({
        where: { id: card.id },
        data: {
          riskTry: updatedRisk.lessThan(0) ? new Prisma.Decimal(0) : updatedRisk,
        },
      });

      return transaction;
    });

    await notifyBackdatedIfNeeded(result, actor);
    return result;
  }

  static async registerCheckPayment(
    payload: BaseTransactionInput & { checkId: string; bankAccountId: string },
  ) {
    const { actor, ...basePayload } = payload;

    const result = await prisma.$transaction(async (tx) => {
      const check = await ensureCheck(tx, basePayload.checkId);
      if (check.status === CheckStatus.PAID) {
        throw new HttpError(400, "Çek zaten ödenmiş");
      }
      await ensureBankAccount(tx, basePayload.bankAccountId);

      const transaction = await createTransaction(tx, {
        ...basePayload,
        actor,
        category: basePayload.category ?? TransactionCategory.DIGER,
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
          description: basePayload.description ?? null,
          performedById: actor.id,
        },
      });

      return transaction;
    });

    await notifyBackdatedIfNeeded(result, actor);
    return result;
  }

  static async deleteTransaction(id: string, actor: Actor) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new HttpError(404, "İşlem bulunamadı");
    }

    await prisma.$transaction(async (tx) => {
      await tx.txnTag.deleteMany({ where: { transactionId: id } });
      await tx.attachment.deleteMany({ where: { transactionId: id } });

      if (transaction.cardId) {
        const card = await tx.card.findUnique({ where: { id: transaction.cardId } });
        if (card) {
          if (transaction.type === TransactionType.CARD_EXPENSE) {
            const updatedRisk = card.riskTry.minus(transaction.amount);
            await tx.card.update({
              where: { id: card.id },
              data: {
                riskTry: updatedRisk.lessThan(0) ? new Prisma.Decimal(0) : updatedRisk,
              },
            });
          }

          if (transaction.type === TransactionType.CARD_PAYMENT) {
            const updatedRisk = card.riskTry.plus(transaction.amount);
            await tx.card.update({
              where: { id: card.id },
              data: { riskTry: updatedRisk },
            });
          }
        }
      }

      await tx.transaction.delete({ where: { id } });
    });

    await NotificationService.sendHardDelete({
      txnNo: transaction.txnNo,
      amount: Number(transaction.amount),
      description: transaction.description ?? transaction.note,
      txnDate: transaction.txnDate,
      performedAt: new Date(),
      actor,
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
