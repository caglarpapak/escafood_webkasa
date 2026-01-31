import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createCreditCardSchema = z.object({
  name: z.string().min(1, 'Kart adı gereklidir'),
  bankId: z.string().uuid().nullable().optional(),
  limit: z.number().nonnegative('Limit negatif olamaz').nullable().optional(),
  closingDay: z.number().int().min(1).max(31).nullable().optional(),
  dueDay: z.number().int().min(1).max(31).nullable().optional(),
  sonEkstreBorcu: z.number().nonnegative('Son ekstre borcu negatif olamaz').optional().default(0),
  manualGuncelBorc: z.number().nonnegative('Güncel borç negatif olamaz').nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateCreditCardSchema = z.object({
  name: z.string().min(1).optional(),
  bankId: z.string().uuid().nullable().optional(),
  limit: z.number().nonnegative().nullable().optional(),
  closingDay: z.number().int().min(1).max(31).nullable().optional(),
  dueDay: z.number().int().min(1).max(31).nullable().optional(),
  sonEkstreBorcu: z.number().nonnegative().optional(),
  manualGuncelBorc: z.number().nonnegative().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createExpenseSchema = z.object({
  creditCardId: z.string().uuid('Geçerli bir kart ID gereklidir'),
  isoDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  amount: z.number().positive('Tutar pozitif olmalıdır'),
  description: z.string().max(500).nullable().optional(),
  counterparty: z.string().max(200).nullable().optional(),
  attachmentId: z.string().uuid('Geçerli bir attachment ID gereklidir').nullable().optional(),
});

export const createPaymentSchema = z.object({
  creditCardId: z.string().uuid('Geçerli bir kart ID gereklidir'),
  isoDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  amount: z.number().positive('Tutar pozitif olmalıdır'),
  description: z.string().max(500).nullable().optional(),
  paymentSource: z.enum(['BANKA', 'KASA'], {
    message: 'Ödeme kaynağı BANKA veya KASA olmalıdır',
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

export const bulkSaveCreditCardSchema = z.array(
  z.object({
    id: z.string(), // Can be tmp-* for new cards or UUID for existing
    name: z.string().trim().min(1, 'Kart adı gereklidir'),
    bankId: z.string().uuid().nullable().optional(),
    limit: z.number().nonnegative('Limit negatif olamaz').nullable().optional(),
    closingDay: z.number().int().min(1).max(31).nullable().optional(),
    dueDay: z.number().int().min(1).max(31).nullable().optional(),
    sonEkstreBorcu: z.number().nonnegative('Son ekstre borcu negatif olamaz').optional().default(0),
    manualGuncelBorc: z.number().nonnegative('Güncel borç negatif olamaz').nullable().optional(),
    isActive: z.boolean().optional().default(true),
  })
);

export type BulkSaveCreditCardInput = z.infer<typeof bulkSaveCreditCardSchema>;

