import { z } from 'zod';
import { DailyTransactionType, DailyTransactionSource } from '@prisma/client';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Helper to transform empty strings to undefined for create schema
const optionalUuidStringCreate = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.string().uuid('Geçerli bir UUID formatı gerekir').nullable().optional()
);

const optionalStringCreate = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.string().max(500).nullable().optional()
);

// Helper to normalize bankId: accept string (UUID), empty string, null, undefined
// Transform to valid UUID string or null
// Bank.id is String @id @default(uuid()) in schema.prisma
const bankIdNormalizer = z.preprocess(
  (val) => {
    // Handle null, undefined, empty string
    if (val === undefined || val === null || val === '') {
      return null;
    }
    
    // Handle string values - validate UUID format
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) {
        return null;
      }
      // Validate UUID format - if valid, return as-is; if invalid, return null
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(trimmed)) {
        return trimmed;
      }
      // Invalid UUID format - return null (will be caught by superRefine for bank types)
      return null;
    }
    
    // Handle number values - convert to null (Bank.id is UUID string, not number)
    if (typeof val === 'number') {
      return null;
    }
    
    // For any other type, return null
    return null;
  },
  z.union([z.string().uuid(), z.null()])
);

// Helper to normalize creditCardId (same logic as bankId)
// CreditCard.id is String @id @default(uuid()) in schema.prisma
const creditCardIdNormalizer = z.preprocess(
  (val) => {
    // Handle null, undefined, empty string
    if (val === undefined || val === null || val === '') {
      return null;
    }
    
    // Handle string values - validate UUID format
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) {
        return null;
      }
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(trimmed)) {
        return trimmed;
      }
      return null;
    }
    
    // Handle number values - convert to null (CreditCard.id is UUID string, not number)
    if (typeof val === 'number') {
      return null;
    }
    
    return null;
  },
  z.union([z.string().uuid(), z.null()])
);

export const createTransactionSchema = z
  .object({
    isoDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
    documentNo: optionalStringCreate,
    type: z.nativeEnum(DailyTransactionType),
    source: z.nativeEnum(DailyTransactionSource),
    counterparty: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : val),
      z.string().max(200).nullable().optional()
    ),
    description: optionalStringCreate,
    incoming: z.number().nonnegative().default(0),
    outgoing: z.number().nonnegative().default(0),
    bankDelta: z.number().default(0),
    displayIncoming: z.number().nonnegative().nullable().optional(),
    displayOutgoing: z.number().nonnegative().nullable().optional(),
    cashAccountId: optionalUuidStringCreate,
    bankId: bankIdNormalizer.optional(),
    creditCardId: creditCardIdNormalizer.optional(),
    chequeId: optionalUuidStringCreate,
    customerId: optionalUuidStringCreate,
    supplierId: optionalUuidStringCreate,
    attachmentId: optionalUuidStringCreate,
    loanInstallmentId: optionalUuidStringCreate,
  })
  .refine(
    (data) => {
      // POS_KOMISYONU: displayOutgoing > 0, outgoing = 0, bankDelta < 0 (negative commission reduces bank balance)
      // BUG 3 FIX: bankDelta should be negative (commission reduces bank balance), not 0
      if (data.type === 'POS_KOMISYONU') {
        return (
          (data.displayOutgoing ?? 0) > 0 &&
          data.outgoing === 0 &&
          (data.bankDelta ?? 0) < 0 && // Commission reduces bank balance (negative)
          (data.displayIncoming ?? 0) === 0
        );
      }
      return true;
    },
    {
      message:
        'POS_KOMISYONU must have displayOutgoing > 0, outgoing = 0, bankDelta < 0 (negative), and displayIncoming = 0',
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
  )
  .superRefine((data, ctx) => {
    // Fix Bug 4: Bank-related transactions require bankId
    // This includes:
    // 1. Specific bank transaction types (BANKA_HAVALE_GIRIS, etc.)
    // 2. NAKIT_TAHSILAT/NAKIT_ODEME when source = BANKA (Bank Cash In/Out)
    const bankRequiredTypes: DailyTransactionType[] = [
      'BANKA_HAVALE_GIRIS',
      'BANKA_HAVALE_CIKIS',
      'BANKA_KASA_TRANSFER',
      'KASA_BANKA_TRANSFER',
      'POS_TAHSILAT_BRUT',
      'POS_KOMISYONU', // BUG B FIX: POS_KOMISYONU requires bankId (same bank as POS_TAHSILAT_BRUT)
      'KREDI_KARTI_EKSTRE_ODEME',
      'CEK_TAHSIL_BANKA',
    ];

    const isBankType = bankRequiredTypes.includes(data.type);
    // Fix Bug 4: Also require bankId for NAKIT_TAHSILAT/NAKIT_ODEME when source = BANKA
    const isBankCashInOut = (data.type === 'NAKIT_TAHSILAT' || data.type === 'NAKIT_ODEME') && data.source === 'BANKA';

    // For bank-related types or bank cash in/out, bankId is required
    if (isBankType || isBankCashInOut) {
      if (!data.bankId || data.bankId === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankId'],
          message: 'Bankalı işlemde bankId zorunlu.',
        });
      } else if (typeof data.bankId === 'string') {
        // Validate UUID format (redundant check after preprocess, but ensures safety)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(data.bankId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['bankId'],
            message: 'bankId geçerli bir UUID formatında olmalıdır.',
          });
        }
      }
    }
  })
  .transform((data) => {
    // Fix Bug 4: Bank-related transactions require bankId
    // This includes:
    // 1. Specific bank transaction types (BANKA_HAVALE_GIRIS, etc.)
    // 2. NAKIT_TAHSILAT/NAKIT_ODEME when source = BANKA (Bank Cash In/Out)
    const bankRequiredTypes: DailyTransactionType[] = [
      'BANKA_HAVALE_GIRIS',
      'BANKA_HAVALE_CIKIS',
      'BANKA_KASA_TRANSFER',
      'KASA_BANKA_TRANSFER',
      'POS_TAHSILAT_BRUT',
      'POS_KOMISYONU', // BUG B FIX: POS_KOMISYONU requires bankId (same bank as POS_TAHSILAT_BRUT)
      'KREDI_KARTI_EKSTRE_ODEME',
      'CEK_TAHSIL_BANKA',
    ];

    const isBankType = bankRequiredTypes.includes(data.type);
    // Fix Bug 4: Also preserve bankId for NAKIT_TAHSILAT/NAKIT_ODEME when source = BANKA
    const isBankCashInOut = (data.type === 'NAKIT_TAHSILAT' || data.type === 'NAKIT_ODEME') && data.source === 'BANKA';

    // For non-bank types (and not bank cash in/out), force bankId to null
    if (!isBankType && !isBankCashInOut) {
      return { ...data, bankId: null };
    }

    return data;
  });

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
  loanInstallmentId: z.string().uuid().nullable().optional(),
});

// Helper to transform empty strings to undefined and validate date format
const optionalDateString = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)').optional()
);

// Helper to transform empty strings to undefined
const optionalString = z.preprocess((val) => (val === '' || val === undefined ? undefined : val), z.string().optional());

// Helper for optional UUID strings
const optionalUuidString = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : val),
  z.string().uuid('Geçerli bir UUID formatı gerekir').optional()
);

export const transactionListQuerySchema = z.object({
  from: optionalDateString,
  to: optionalDateString,
  documentNo: optionalString,
  type: z.nativeEnum(DailyTransactionType).optional(),
  source: z.nativeEnum(DailyTransactionSource).optional(),
  counterparty: optionalString,
  description: optionalString,
  bankId: optionalUuidString,
  creditCardId: optionalUuidString,
  createdBy: optionalUuidString,
  search: optionalString,
  sortKey: z.enum(['isoDate', 'documentNo', 'type', 'counterparty', 'incoming', 'outgoing', 'balanceAfter']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

// Alias for backward compatibility
export const transactionQuerySchema = transactionListQuerySchema;

export const deleteTransactionSchema = z.object({
  deletedBy: z.string().uuid(),
});

