import { z } from 'zod';

const uuidSchema = z.string().uuid();
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const baseLoanSchema = z
  .object({
    name: z.string().trim().min(1, 'Kredi adı zorunludur'),
    bankId: uuidSchema,
    totalAmount: z.number().positive('Toplam kredi tutarı pozitif olmalıdır'),
    installmentCount: z.number().int().positive('Vade sayısı pozitif bir tam sayı olmalıdır'),
    firstInstallmentDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
    annualInterestRate: z.number().nonnegative('Yıllık faiz oranı negatif olamaz'),
    bsmvRate: z.number().nonnegative('BSMV oranı negatif olamaz'),
    isActive: z.boolean().optional(),
  })
  .strict();

export const createLoanSchema = baseLoanSchema;

export const updateLoanSchema = baseLoanSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const deleteLoanSchema = z.object({}).strict();

export const loanIdParamSchema = z.object({
  id: uuidSchema,
});

export const loanInstallmentIdParamSchema = z.object({
  loanId: uuidSchema,
  installmentId: uuidSchema,
});

export const payInstallmentSchema = z.object({
  isoDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)'),
  description: z.string().max(500).nullable().optional(),
});

export const payNextInstallmentSchema = z.object({
  bankId: uuidSchema,
  isoDate: z.string().regex(isoDateRegex, 'Geçerli bir tarih formatı gerekir (YYYY-MM-DD)').optional(),
  amount: z.number().positive().optional(),
  note: z.string().max(500).nullable().optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;
export type DeleteLoanInput = z.infer<typeof deleteLoanSchema>;
export type PayInstallmentInput = z.infer<typeof payInstallmentSchema>;

