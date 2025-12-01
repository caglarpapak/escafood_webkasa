import { z } from 'zod';
import {
  chequeIdParamSchema,
  chequeQuerySchema,
  createChequeSchema,
  updateChequeSchema,
  updateChequeStatusSchema,
} from './cheques.validation';

export type ChequeStatus = 'KASADA' | 'BANKADA_TAHSILDE' | 'ODEMEDE' | 'TAHSIL_EDILDI' | 'KARSILIKSIZ';
export type ChequeDirection = 'ALACAK' | 'BORC';

export type CreateChequeDTO = z.infer<typeof createChequeSchema>;
export type UpdateChequeDTO = z.infer<typeof updateChequeSchema>;
export type UpdateChequeStatusDTO = z.infer<typeof updateChequeStatusSchema>;
export type ChequeQueryDTO = z.infer<typeof chequeQuerySchema>;
export type ChequeIdParam = z.infer<typeof chequeIdParamSchema>;

export interface ChequeDto {
  id: string;
  cekNo: string;
  amount: number;
  entryDate: string;
  maturityDate: string;
  status: ChequeStatus;
  direction: ChequeDirection;
  customerId: string | null;
  supplierId: string | null;
  bankId: string | null;
  description: string | null;
  attachmentId: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export interface PaginatedCheques {
  items: ChequeDto[];
  totalCount: number;
  totalAmount: number;
}
