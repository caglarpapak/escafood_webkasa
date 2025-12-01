import { z } from 'zod';

export const DAILY_TRANSACTION_TYPES = [
  'NAKIT_TAHSILAT',
  'NAKIT_ODEME',
  'KASA_BANKA_TRANSFER',
  'BANKA_KASA_TRANSFER',
  'BANKA_HAVALE_GIRIS',
  'BANKA_HAVALE_CIKIS',
  'POS_TAHSILAT_BRUT',
  'POS_KOMISYONU',
  'KREDI_KARTI_HARCAMA',
  'KREDI_KARTI_EKSTRE_ODEME',
  'CEK_GIRISI',
  'CEK_TAHSIL_BANKA',
  'CEK_ODENMESI',
  'CEK_KARSILIKSIZ',
  'DEVIR_BAKIYE',
  'DUZELTME',
] as const;

export type DailyTransactionType = (typeof DAILY_TRANSACTION_TYPES)[number];

export const DAILY_TRANSACTION_SOURCES = [
  'KASA',
  'BANKA',
  'POS',
  'KREDI_KARTI',
  'CEK',
  'SENET',
  'DIGER',
] as const;

export type DailyTransactionSource = (typeof DAILY_TRANSACTION_SOURCES)[number];

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const transactionQuerySchema = z.object({
  from: z.string().regex(isoDateRegex).optional(),
  to: z.string().regex(isoDateRegex).optional(),
  type: z.enum(DAILY_TRANSACTION_TYPES).optional(),
  source: z.enum(DAILY_TRANSACTION_SOURCES).optional(),
  bankId: z.string().trim().optional(),
  creditCardId: z.string().trim().optional(),
  chequeId: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(200).optional().default(50),
});

const baseBodySchema = z.object({
  isoDate: z.string().regex(isoDateRegex, 'isoDate must be YYYY-MM-DD'),
  documentNo: z.string().trim().min(1).optional().nullable(),
  type: z.enum(DAILY_TRANSACTION_TYPES),
  source: z.enum(DAILY_TRANSACTION_SOURCES),
  counterparty: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  incoming: z.number().finite().optional().default(0),
  outgoing: z.number().finite().optional().default(0),
  bankDelta: z.number().finite().optional().default(0),
  displayIncoming: z.number().finite().optional().nullable(),
  displayOutgoing: z.number().finite().optional().nullable(),
  cashAccountId: z.string().trim().optional().nullable(),
  bankId: z.string().trim().optional().nullable(),
  creditCardId: z.string().trim().optional().nullable(),
  chequeId: z.string().trim().optional().nullable(),
  customerId: z.string().trim().optional().nullable(),
  supplierId: z.string().trim().optional().nullable(),
  attachmentId: z.string().trim().optional().nullable(),
});

export const createTransactionSchema = baseBodySchema.extend({
  createdBy: z.string().trim(),
});

export const updateTransactionSchema = baseBodySchema.extend({
  updatedBy: z.string().trim(),
});

export const deleteTransactionSchema = z.object({
  deletedBy: z.string().trim(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
export type DeleteTransactionInput = z.infer<typeof deleteTransactionSchema>;

interface ValidationContext {
  isUpdate?: boolean;
}

export function validateTransactionBusinessRules(
  payload: CreateTransactionInput | UpdateTransactionInput,
  _context: ValidationContext = {},
): void {
  const incoming = payload.incoming ?? 0;
  const outgoing = payload.outgoing ?? 0;
  const bankDelta = payload.bankDelta ?? 0;
  const displayIncoming = payload.displayIncoming ?? 0;
  const displayOutgoing = payload.displayOutgoing ?? 0;

  const hasDisplay = Math.abs(displayIncoming) > 0 || Math.abs(displayOutgoing) > 0;
  const hasReal = Math.abs(incoming) > 0 || Math.abs(outgoing) > 0 || Math.abs(bankDelta) > 0;

  if (hasDisplay && hasReal) {
    throw new Error('Display-only transactions cannot mix with real cash/bank amounts.');
  }

  if (!hasDisplay && !hasReal) {
    throw new Error('Transaction must contain a real or display amount.');
  }

  if (incoming < 0 || outgoing < 0) {
    throw new Error('incoming and outgoing amounts cannot be negative.');
  }

  const assert = (condition: boolean, message: string) => {
    if (!condition) {
      throw new Error(message);
    }
  };

  switch (payload.type) {
    case 'NAKIT_TAHSILAT': {
      assert(payload.source === 'KASA', 'NAKIT_TAHSILAT must use source KASA.');
      assert(incoming > 0, 'NAKIT_TAHSILAT requires incoming > 0.');
      assert(outgoing === 0 && bankDelta === 0, 'NAKIT_TAHSILAT cannot set outgoing or bankDelta.');
      assert(!hasDisplay, 'NAKIT_TAHSILAT cannot set display fields.');
      break;
    }
    case 'NAKIT_ODEME': {
      assert(payload.source === 'KASA', 'NAKIT_ODEME must use source KASA.');
      assert(outgoing > 0, 'NAKIT_ODEME requires outgoing > 0.');
      assert(incoming === 0 && bankDelta === 0, 'NAKIT_ODEME cannot set incoming or bankDelta.');
      assert(!hasDisplay, 'NAKIT_ODEME cannot set display fields.');
      break;
    }
    case 'KASA_BANKA_TRANSFER': {
      assert(payload.source === 'KASA', 'KASA_BANKA_TRANSFER must use source KASA.');
      assert(outgoing > 0, 'KASA_BANKA_TRANSFER requires outgoing > 0.');
      assert(incoming === 0, 'KASA_BANKA_TRANSFER cannot set incoming.');
      assert(bankDelta === outgoing, 'KASA_BANKA_TRANSFER bankDelta must equal outgoing (positive).');
      assert(!hasDisplay, 'KASA_BANKA_TRANSFER cannot set display fields.');
      assert(!!payload.bankId, 'KASA_BANKA_TRANSFER requires bankId.');
      break;
    }
    case 'BANKA_KASA_TRANSFER': {
      assert(payload.source === 'BANKA', 'BANKA_KASA_TRANSFER must use source BANKA.');
      assert(incoming > 0, 'BANKA_KASA_TRANSFER requires incoming > 0.');
      assert(outgoing === 0, 'BANKA_KASA_TRANSFER cannot set outgoing.');
      assert(bankDelta === -incoming, 'BANKA_KASA_TRANSFER bankDelta must be negative incoming.');
      assert(!hasDisplay, 'BANKA_KASA_TRANSFER cannot set display fields.');
      assert(!!payload.bankId, 'BANKA_KASA_TRANSFER requires bankId.');
      break;
    }
    case 'BANKA_HAVALE_GIRIS': {
      assert(payload.source === 'BANKA', 'BANKA_HAVALE_GIRIS must use source BANKA.');
      assert(bankDelta > 0, 'BANKA_HAVALE_GIRIS requires bankDelta > 0.');
      assert(incoming === 0 && outgoing === 0, 'BANKA_HAVALE_GIRIS cannot set incoming/outgoing.');
      assert(!hasDisplay, 'BANKA_HAVALE_GIRIS cannot set display fields.');
      assert(!!payload.bankId, 'BANKA_HAVALE_GIRIS requires bankId.');
      break;
    }
    case 'BANKA_HAVALE_CIKIS': {
      assert(payload.source === 'BANKA', 'BANKA_HAVALE_CIKIS must use source BANKA.');
      assert(bankDelta < 0, 'BANKA_HAVALE_CIKIS requires bankDelta < 0.');
      assert(incoming === 0 && outgoing === 0, 'BANKA_HAVALE_CIKIS cannot set incoming/outgoing.');
      assert(!hasDisplay, 'BANKA_HAVALE_CIKIS cannot set display fields.');
      assert(!!payload.bankId, 'BANKA_HAVALE_CIKIS requires bankId.');
      break;
    }
    case 'POS_TAHSILAT_BRUT': {
      assert(payload.source === 'POS', 'POS_TAHSILAT_BRUT must use source POS.');
      assert(displayIncoming > 0, 'POS_TAHSILAT_BRUT requires displayIncoming > 0 (gross amount).');
      assert(incoming === 0 && outgoing === 0, 'POS_TAHSILAT_BRUT cannot set incoming/outgoing.');
      assert(bankDelta >= 0, 'POS_TAHSILAT_BRUT bankDelta must be >= 0 (net).');
      break;
    }
    case 'POS_KOMISYONU': {
      assert(payload.source === 'POS', 'POS_KOMISYONU must use source POS.');
      assert(displayOutgoing > 0, 'POS_KOMISYONU requires displayOutgoing > 0.');
      assert(incoming === 0 && outgoing === 0 && bankDelta === 0, 'POS_KOMISYONU cannot set incoming/outgoing/bankDelta.');
      break;
    }
    case 'KREDI_KARTI_HARCAMA': {
      assert(payload.source === 'KREDI_KARTI', 'KREDI_KARTI_HARCAMA must use source KREDI_KARTI.');
      assert(displayOutgoing > 0, 'KREDI_KARTI_HARCAMA requires displayOutgoing > 0.');
      assert(incoming === 0 && outgoing === 0 && bankDelta === 0, 'KREDI_KARTI_HARCAMA cannot set incoming/outgoing/bankDelta.');
      assert(!!payload.creditCardId, 'KREDI_KARTI_HARCAMA requires creditCardId.');
      break;
    }
    case 'KREDI_KARTI_EKSTRE_ODEME': {
      assert(payload.source === 'KREDI_KARTI', 'KREDI_KARTI_EKSTRE_ODEME must use source KREDI_KARTI.');
      assert(!hasDisplay, 'KREDI_KARTI_EKSTRE_ODEME cannot set display fields.');
      if (outgoing > 0) {
        assert(bankDelta === 0, 'Cash statement payments cannot set bankDelta.');
      } else {
        assert(outgoing === 0, 'Outgoing must be 0 when paying via bank.');
      }
      if (bankDelta !== 0) {
        assert(bankDelta < 0, 'Bank statement payment bankDelta must be negative.');
        assert(!!payload.bankId, 'Bank statement payment requires bankId.');
      }
      break;
    }
    case 'CEK_TAHSIL_BANKA': {
      assert(payload.source === 'BANKA' || payload.source === 'KASA', 'CEK_TAHSIL_BANKA source must be BANKA or KASA.');
      assert(!hasDisplay, 'CEK_TAHSIL_BANKA cannot set display fields.');
      if (payload.source === 'BANKA') {
        assert(bankDelta > 0, 'Bank cheque collection requires positive bankDelta.');
        assert(incoming === 0 && outgoing === 0, 'Bank cheque collection cannot set incoming/outgoing.');
        assert(!!payload.bankId, 'Bank cheque collection requires bankId.');
      } else {
        assert(incoming > 0, 'Cash cheque collection requires incoming > 0.');
        assert(outgoing === 0 && bankDelta === 0, 'Cash cheque collection cannot set outgoing/bankDelta.');
      }
      break;
    }
    case 'CEK_ODENMESI': {
      assert(payload.source === 'BANKA' || payload.source === 'KASA', 'CEK_ODENMESI source must be BANKA or KASA.');
      assert(!hasDisplay, 'CEK_ODENMESI cannot set display fields.');
      if (payload.source === 'BANKA') {
        assert(bankDelta < 0, 'Bank cheque payment requires negative bankDelta.');
        assert(incoming === 0 && outgoing === 0, 'Bank cheque payment cannot set incoming/outgoing.');
        assert(!!payload.bankId, 'Bank cheque payment requires bankId.');
      } else {
        assert(outgoing > 0, 'Cash cheque payment requires outgoing > 0.');
        assert(incoming === 0 && bankDelta === 0, 'Cash cheque payment cannot set incoming/bankDelta.');
      }
      break;
    }
    case 'CEK_KARSILIKSIZ': {
      assert(payload.source === 'CEK', 'CEK_KARSILIKSIZ must use source CEK.');
      assert(displayOutgoing >= 0, 'CEK_KARSILIKSIZ displayOutgoing cannot be negative.');
      assert(incoming === 0 && outgoing === 0 && bankDelta === 0, 'CEK_KARSILIKSIZ cannot set cash/bank fields.');
      break;
    }
    case 'DEVIR_BAKIYE':
    case 'DUZELTME': {
      assert(payload.source === 'KASA' || payload.source === 'BANKA', `${payload.type} source must be KASA or BANKA.`);
      assert(!hasDisplay, `${payload.type} cannot set display fields.`);
      break;
    }
    default: {
      throw new Error(`Unsupported transaction type: ${payload.type}`);
    }
  }
}

export function normalizeAmounts<T extends CreateTransactionInput | UpdateTransactionInput>(
  payload: T,
): T {
  return {
    ...payload,
    incoming: payload.incoming ?? 0,
    outgoing: payload.outgoing ?? 0,
    bankDelta: payload.bankDelta ?? 0,
    displayIncoming: payload.displayIncoming ?? 0,
    displayOutgoing: payload.displayOutgoing ?? 0,
  };
}

