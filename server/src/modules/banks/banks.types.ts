import { z } from 'zod';
import { createBankSchema, updateBankSchema, deleteBankSchema, bankIdParamSchema } from './banks.validation';

export type CreateBankDTO = z.infer<typeof createBankSchema>;
export type UpdateBankDTO = z.infer<typeof updateBankSchema>;
export type DeleteBankDTO = z.infer<typeof deleteBankSchema>;
export type BankIdParamDTO = z.infer<typeof bankIdParamSchema>;

export interface BankRecord {
  id: string;
  name: string;
  accountNo: string | null;
  iban: string | null;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export interface BankWithBalance extends BankRecord {
  currentBalance: number; // openingBalance (from Bank table) + SUM(bankDelta excluding opening transactions)
  openingBalance: number; // Opening balance from Bank.openingBalance field (NOT from transactions)
}
