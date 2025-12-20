import { z } from 'zod';

const uuidSchema = z.string().uuid();

const baseSupplierSchema = z
  .object({
    name: z.string().trim().min(1, 'name is required'), // Frontend'deki "kod - ad" formatında
    phone: z.string().trim().optional().nullable(),
    email: z.string().email().optional().nullable(),
    taxNo: z.string().trim().optional().nullable(),
    address: z.string().trim().optional().nullable(),
  })
  .strict();

export const createSupplierSchema = baseSupplierSchema;

export const updateSupplierSchema = baseSupplierSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const deleteSupplierSchema = z.object({}).strict();

export const supplierIdParamSchema = z.object({
  id: uuidSchema,
});

// Frontend'den gelen format: { id, kod, ad, aktifMi }
// Backend'e dönüştürme: name = `${kod} - ${ad}`
export const bulkSaveSupplierSchema = z
  .array(
    z.object({
      id: z.string(), // Can be tmp-* for new suppliers or UUID for existing
      kod: z.string().trim().min(1, 'kod is required'), // Frontend code (e.g., "TED-0001")
      ad: z.string().trim().min(1, 'ad is required'), // Frontend name
      aktifMi: z.boolean().optional().default(true),
    })
  )
  .min(1, 'At least one supplier is required'); // CRITICAL: Prevent empty array

