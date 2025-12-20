import { z } from 'zod';
import { createSupplierSchema, updateSupplierSchema, supplierIdParamSchema, bulkSaveSupplierSchema } from './suppliers.validation';

export type CreateSupplierDTO = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierDTO = z.infer<typeof updateSupplierSchema>;
export type SupplierIdParamDTO = z.infer<typeof supplierIdParamSchema>;
export type BulkSaveSupplierDTO = z.infer<typeof bulkSaveSupplierSchema>;

export interface SupplierRecord {
  id: string;
  name: string; // "kod - ad" format
  phone: string | null;
  email: string | null;
  taxNo: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
}

