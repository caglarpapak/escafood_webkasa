import { z } from 'zod';

const uuidSchema = z.string().uuid();

const basePosTerminalSchema = z
  .object({
    bankId: z.string().uuid('bankId must be a valid UUID'),
    name: z.string().trim().min(1, 'name is required'),
    commissionRate: z.number().min(0).max(1, 'commissionRate must be between 0 and 1'), // 0.0250 = 2.5%
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const createPosTerminalSchema = basePosTerminalSchema;

export const updatePosTerminalSchema = basePosTerminalSchema.partial();

export const deletePosTerminalSchema = z.object({}).strict();

export const posTerminalIdParamSchema = z.object({
  id: uuidSchema,
});

// Frontend'den gelen format: { id, bankaId, posAdi, komisyonOrani, aktifMi }
export const bulkSavePosTerminalSchema = z
  .array(
    z.object({
      id: z.string(), // Can be tmp-* for new terminals or UUID for existing
      bankaId: z.string().uuid('bankaId must be a valid UUID'),
      posAdi: z.string().trim().min(1, 'posAdi is required'),
      komisyonOrani: z.number().min(0).max(1, 'komisyonOrani must be between 0 and 1'),
      aktifMi: z.boolean().optional().default(true),
    })
  )
  .min(1, 'At least one POS terminal is required'); // CRITICAL: Prevent empty array

