import { z } from 'zod';
import { DailyTransactionType, DailyTransactionSource } from '@prisma/client';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createTransactionSchema = z
  .object({
    isoDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
    documentNo: z.string().nullable().optional(),
    type: z.nativeEnum(DailyTransactionType),
    source: z.nativeEnum(DailyTransactionSource),
    counterparty: z.string().max(200).nullable().optional(),
    description: z.string().max(500).nullable().optional(),
    incoming: z.number().nonnegative().default(0),
    outgoing: z.number().nonnegative().default(0),
    bankDelta: z.number().default(0),
    displayIncoming: z.number().nonnegative().nullable().optional(),
    displayOutgoing: z.number().nonnegative().nullable().optional(),
    cashAccountId: z.string().uuid().nullable().optional(),
    bankId: z.string().uuid().nullable().optional(),
    creditCardId: z.string().uuid().nullable().optional(),
    chequeId: z.string().uuid().nullable().optional(),
    customerId: z.string().uuid().nullable().optional(),
    supplierId: z.string().uuid().nullable().optional(),
    attachmentId: z.string().uuid().nullable().optional(),
  })
  .refine(
    (data) => {
      // POS_KOMISYONU: displayOutgoing > 0, outgoing = 0, bankDelta = 0
      if (data.type === 'POS_KOMISYONU') {
        return (
          (data.displayOutgoing ?? 0) > 0 &&
          data.outgoing === 0 &&
          data.bankDelta === 0 &&
          (data.displayIncoming ?? 0) === 0
        );
      }
      return true;
    },
    {
      message:
        'POS_KOMISYONU must have displayOutgoing > 0, outgoing = 0, bankDelta = 0, and displayIncoming = 0',
    }
  )
  .refine(
    (data) => {
      // POS_TAHSILAT_BRUT: displayIncoming > 0, incoming = 0, outgoing = 0, bankDelta > 0
      if (data.type === 'POS_TAHSILAT_BRUT') {
        return (
          (data.displayIncoming ?? 0) > 0 &&
          data.incoming === 0 &&
          data.outgoing === 0 &&
          data.bankDelta > 0 &&
          (data.displayOutgoing ?? 0) === 0
        );
      }
      return true;
    },
    {
      message:
        'POS_TAHSILAT_BRUT must have displayIncoming > 0, incoming = 0, outgoing = 0, bankDelta > 0, and displayOutgoing = 0',
    }
  )
  .refine(
    (data) => {
      // KREDI_KARTI_HARCAMA: displayOutgoing > 0, incoming = 0, outgoing = 0, bankDelta = 0
      if (data.type === 'KREDI_KARTI_HARCAMA') {
        return (
          (data.displayOutgoing ?? 0) > 0 &&
          data.incoming === 0 &&
          data.outgoing === 0 &&
          data.bankDelta === 0 &&
          (data.displayIncoming ?? 0) === 0
        );
      }
      return true;
    },
    {
      message:
        'KREDI_KARTI_HARCAMA must have displayOutgoing > 0, incoming = 0, outgoing = 0, bankDelta = 0, and displayIncoming = 0',
    }
  );

export const updateTransactionSchema = z.object({
  isoDate: z.string().regex(isoDateRegex).optional(),
  documentNo: z.string().nullable().optional(),
  type: z.nativeEnum(DailyTransactionType).optional(),
  source: z.nativeEnum(DailyTransactionSource).optional(),
  counterparty: z.string().max(200).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  incoming: z.number().nonnegative().optional(),
  outgoing: z.number().nonnegative().optional(),
  bankDelta: z.number().optional(),
  displayIncoming: z.number().nonnegative().nullable().optional(),
  displayOutgoing: z.number().nonnegative().nullable().optional(),
  cashAccountId: z.string().uuid().nullable().optional(),
  bankId: z.string().uuid().nullable().optional(),
  creditCardId: z.string().uuid().nullable().optional(),
  chequeId: z.string().uuid().nullable().optional(),
  customerId: z.string().uuid().nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(),
  attachmentId: z.string().uuid().nullable().optional(),
});

export const transactionListQuerySchema = z.object({
  from: z.string().regex(isoDateRegex).optional(),
  to: z.string().regex(isoDateRegex).optional(),
  documentNo: z.string().optional(),
  type: z.nativeEnum(DailyTransactionType).optional(),
  source: z.nativeEnum(DailyTransactionSource).optional(),
  counterparty: z.string().optional(),
  description: z.string().optional(),
  bankId: z.string().uuid().optional(),
  creditCardId: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
  search: z.string().optional(),
  sortKey: z.enum(['isoDate', 'documentNo', 'type', 'counterparty', 'incoming', 'outgoing', 'balanceAfter']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

