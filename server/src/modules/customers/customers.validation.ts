import { z } from 'zod';

const uuidSchema = z.string().uuid();

const baseCustomerSchema = z
  .object({
    name: z.string().trim().min(1, 'name is required'), // Frontend'deki "kod - ad" formatında
    phone: z.string().trim().optional().nullable(),
    email: z.string().email().optional().nullable(),
    taxNo: z.string().trim().optional().nullable(),
    address: z.string().trim().optional().nullable(),
  })
  .strict();

export const createCustomerSchema = baseCustomerSchema;

export const updateCustomerSchema = baseCustomerSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const deleteCustomerSchema = z.object({}).strict();

export const customerIdParamSchema = z.object({
  id: uuidSchema,
});

// Frontend'den gelen format: { id, kod, ad, aktifMi }
// Backend'e dönüştürme: name = `${kod} - ${ad}`
export const bulkSaveCustomerSchema = z
  .array(
    z.object({
      id: z.string(), // Can be tmp-* for new customers or UUID for existing
      kod: z.string().trim().min(1, 'kod is required'), // Frontend code (e.g., "MUST-0001")
      ad: z.string().trim().min(1, 'ad is required'), // Frontend name
      aktifMi: z.boolean().optional().default(true),
    })
  )
  .min(1, 'At least one customer is required'); // CRITICAL: Prevent empty array

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type DeleteCustomerInput = z.infer<typeof deleteCustomerSchema>;
export type BulkSaveCustomerInput = z.infer<typeof bulkSaveCustomerSchema>;

