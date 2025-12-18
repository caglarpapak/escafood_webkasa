import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createCreditCardSchema = z.object({
  name: z.string().min(1, 'Kart adı gereklidir'),
  bankId: z.string().uuid().nullable().optional(),
  limit: z.number().nonnegative('Limit negatif olamaz').nullable().optional(),
  sonEkstreBorcu: z.number().nonnegative('Son ekstre borcu negatif olamaz').optional(),
  manualGuncelBorc: z.number().nullable().optional(),
  closingDay: z.number().int().min(1).max(31).nullable().optional(),
  dueDay: z.number().int().min(1).max(31).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateCreditCardSchema = z.object({
  name: z.string().min(1).optional(),
  bankId: z.string().uuid().nullable().optional(),
  limit: z.number().nonnegative().nullable().optional(),
  sonEkstreBorcu: z.number().nonnegative().optional(),
  manualGuncelBorc: z.number().nullable().optional(),
  closingDay: z.number().int().min(1).max(31).nullable().optional(),
  dueDay: z.number().int().min(1).max(31).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const bulkSaveSchema = z.object({
  cards: z.array(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1),
      bankId: z.string().uuid().nullable().optional(),
      limit: z.number().nonnegative().nullable().optional(),
      sonEkstreBorcu: z.number().nonnegative().optional(),
      manualGuncelBorc: z.number().nullable().optional(),
      closingDay: z.number().int().min(1).max(31).nullable().optional(),
      dueDay: z.number().int().min(1).max(31).nullable().optional(),
      isActive: z.boolean().optional(),
    })
  ),
});

export const createExpenseSchema = z.object({
  creditCardId: z.string().uuid('Geçerli bir kart ID gereklidir'),
  isoDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  amount: z.number().positive('Tutar pozitif olmalıdır'),
  description: z.string().max(500).nullable().optional(),
  counterparty: z.string().max(200).nullable().optional(),
});

export const createPaymentSchema = z.object({
  creditCardId: z.string().uuid('Geçerli bir kart ID gereklidir'),
  isoDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  amount: z.number().positive('Tutar pozitif olmalıdır'),
  description: z.string().max(500).nullable().optional(),
  paymentSource: z.enum(['BANKA', 'KASA'], {
    errorMap: () => ({ message: 'Ödeme kaynağı BANKA veya KASA olmalıdır' }),
  }),
  bankId: z.string().uuid().nullable().optional(),
}).refine(
  (data) => {
    // If paymentSource is BANKA, bankId must be provided
    if (data.paymentSource === 'BANKA' && !data.bankId) {
      return false;
    }
    return true;
  },
  {
    message: 'Banka ödemesi için bankId gereklidir',
    path: ['bankId'],
  }
);
