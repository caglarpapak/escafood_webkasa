import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const chequeIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const chequeQuerySchema = z.object({
  status: z.enum(['KASADA', 'BANKADA_TAHSILDE', 'ODEMEDE', 'TAHSIL_EDILDI', 'KARSILIKSIZ']).optional(),
  direction: z.enum(['ALACAK', 'BORC']).optional(),
  entryFrom: z.string().regex(isoDateRegex).optional(),
  entryTo: z.string().regex(isoDateRegex).optional(),
  maturityFrom: z.string().regex(isoDateRegex).optional(),
  maturityTo: z.string().regex(isoDateRegex).optional(),
  customerId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  bankId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(200).optional().default(50),
});

export const createChequeSchema = z.object({
  cekNo: z.string().trim().min(1),
  amount: z.number().finite(),
  entryDate: z.string().regex(isoDateRegex, 'entryDate must be YYYY-MM-DD'),
  maturityDate: z.string().regex(isoDateRegex, 'maturityDate must be YYYY-MM-DD'),
  direction: z.enum(['ALACAK', 'BORC']),
  customerId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  bankId: z.string().uuid().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  attachmentId: z.string().uuid().optional().nullable(),
  createdBy: z.string().trim(),
});

export const updateChequeSchema = z.object({
  cekNo: z.string().trim().min(1).optional(),
  amount: z.number().finite().optional(),
  entryDate: z.string().regex(isoDateRegex, 'entryDate must be YYYY-MM-DD').optional(),
  maturityDate: z.string().regex(isoDateRegex, 'maturityDate must be YYYY-MM-DD').optional(),
  customerId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  bankId: z.string().uuid().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  attachmentId: z.string().uuid().optional().nullable(),
  updatedBy: z.string().trim(),
});

export const updateChequeStatusSchema = z.object({
  newStatus: z.enum(['KASADA', 'BANKADA_TAHSILDE', 'ODEMEDE', 'TAHSIL_EDILDI', 'KARSILIKSIZ']),
  isoDate: z.string().regex(isoDateRegex, 'isoDate must be YYYY-MM-DD'),
  bankId: z.string().uuid().optional().nullable(),
  updatedBy: z.string().trim(),
});
