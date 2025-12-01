import { z } from 'zod';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  deleteTransactionSchema,
} from './transactions.validation';

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionDTO = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryDTO = z.infer<typeof transactionQuerySchema>;
export type DeleteTransactionDTO = z.infer<typeof deleteTransactionSchema>;

export interface TransactionRecord {
  id: string;
  isoDate: string;
  documentNo: string | null;
  type: string;
  source: string;
  counterparty: string | null;
  description: string | null;
  incoming: number;
  outgoing: number;
  bankDelta: number;
  displayIncoming: number | null;
  displayOutgoing: number | null;
  balanceAfter: number;
  cashAccountId: string | null;
  bankId: string | null;
  creditCardId: string | null;
  chequeId: string | null;
  customerId: string | null;
  supplierId: string | null;
  attachmentId: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export interface PaginatedTransactions {
  items: TransactionRecord[];
  totalCount: number;
}
