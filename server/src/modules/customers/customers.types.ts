import { z } from 'zod';
import { createCustomerSchema, updateCustomerSchema, deleteCustomerSchema, customerIdParamSchema, bulkSaveCustomerSchema } from './customers.validation';

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;
export type DeleteCustomerDTO = z.infer<typeof deleteCustomerSchema>;
export type CustomerIdParamDTO = z.infer<typeof customerIdParamSchema>;
export type BulkSaveCustomerDTO = z.infer<typeof bulkSaveCustomerSchema>;

export interface CustomerRecord {
  id: string;
  name: string; // Frontend'deki "kod - ad" formatında (örn: "MUST-0001 - Müşteri Adı")
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

