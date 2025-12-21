import { z } from 'zod';
import { ChequeStatus, ChequeDirection } from '@prisma/client';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createChequeSchema = z.object({
  cekNo: z.string().min(1, 'Çek numarası gereklidir'),
  amount: z.number().positive('Tutar pozitif olmalıdır'),
  entryDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  maturityDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  direction: z.nativeEnum(ChequeDirection),
  drawerName: z.string().min(2, 'Düzenleyen adı en az 2 karakter olmalıdır'),
  payeeName: z.string().min(2, 'Lehtar adı en az 2 karakter olmalıdır').optional(), // Backend'de default setlenecek
  issuerBankName: z.string().min(2, 'Çek bankası adı en az 2 karakter olmalıdır'), // Çeki düzenleyen banka adı (zorunlu)
  depositBankId: z.string().uuid().nullable().optional(), // Çeki tahsile verdiğimiz banka (opsiyonel, sadece tahsile ver işleminde set edilir)
  customerId: z.string().uuid().nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  attachmentId: z.string().uuid().nullable().optional(),
  imageDataUrl: z.string().min(1, 'Çek görseli zorunludur').optional(), // MVP: Base64 data URL
}).refine(
  (data) => {
    // Görsel zorunlu: imageDataUrl veya attachmentId'den biri olmalı
    return !!(data.imageDataUrl || data.attachmentId);
  },
  {
    message: 'Çek görseli zorunludur (imageDataUrl veya attachmentId)',
    path: ['imageDataUrl'],
  }
);

export const updateChequeSchema = z.object({
  cekNo: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  entryDate: z.string().regex(isoDateRegex).optional(),
  maturityDate: z.string().regex(isoDateRegex).optional(),
  issuerBankName: z.string().min(2).optional(), // Çek bankası adı
  depositBankId: z.string().uuid().nullable().optional(), // Çeki tahsile verdiğimiz banka
  customerId: z.string().uuid().nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  attachmentId: z.string().uuid().nullable().optional(),
});

export const updateChequeStatusSchema = z.object({
  newStatus: z.nativeEnum(ChequeStatus),
  isoDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  depositBankId: z.string().uuid('Geçerli bir banka ID gereklidir').nullable().optional(), // Çeki tahsile verdiğimiz banka (BANKADA_TAHSILDE için zorunlu)
  supplierId: z.string().uuid().nullable().optional(), // BUG 7 FIX: Allow supplierId when cheque is given to supplier
  description: z.string().max(500).nullable().optional(),
});

export const chequeListQuerySchema = z.object({
  status: z.union([z.nativeEnum(ChequeStatus), z.literal('ALL')]).optional(),
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

export const payableChequesQuerySchema = z.object({
  bankId: z.string().uuid().optional(),
});

export const payChequeSchema = z.object({
  bankId: z.string().uuid('Geçerli bir banka ID gereklidir'),
  paymentDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  note: z.string().max(500).nullable().optional(),
});

