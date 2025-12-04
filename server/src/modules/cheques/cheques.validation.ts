import { z } from 'zod';
import { ChequeStatus, ChequeDirection } from '@prisma/client';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createChequeSchema = z.object({
  cekNo: z.string().min(1, 'Çek numarası gereklidir'),
  amount: z.number().positive('Tutar pozitif olmalıdır'),
  entryDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  maturityDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  direction: z.nativeEnum(ChequeDirection),
  customerId: z.string().uuid().nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(),
  bankId: z.string().uuid().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  attachmentId: z.string().uuid().nullable().optional(),
});

export const updateChequeSchema = z.object({
  cekNo: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  entryDate: z.string().regex(isoDateRegex).optional(),
  maturityDate: z.string().regex(isoDateRegex).optional(),
  customerId: z.string().uuid().nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(),
  bankId: z.string().uuid().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  attachmentId: z.string().uuid().nullable().optional(),
});

export const updateChequeStatusSchema = z.object({
  newStatus: z.nativeEnum(ChequeStatus),
  isoDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  bankId: z.string().uuid().nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(), // BUG 7 FIX: Allow supplierId when cheque is given to supplier
  description: z.string().max(500).nullable().optional(),
});

export const chequeListQuerySchema = z.object({
  status: z.nativeEnum(ChequeStatus).optional(),
  direction: z.nativeEnum(ChequeDirection).optional(),
  entryFrom: z.string().regex(isoDateRegex).optional(),
  entryTo: z.string().regex(isoDateRegex).optional(),
  maturityFrom: z.string().regex(isoDateRegex).optional(),
  maturityTo: z.string().regex(isoDateRegex).optional(),
  customerId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  bankId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

// Alias for backward compatibility
export const chequeQuerySchema = chequeListQuerySchema;

export const chequeIdParamSchema = z.object({
  id: z.string().uuid(),
});

