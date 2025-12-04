import { ChequeStatus, ChequeDirection } from '@prisma/client';

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
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  // Relations (optional, populated when needed)
  bank?: {
    id: string;
    name: string;
    accountNo: string | null;
    iban: string | null;
  } | null;
  customer?: {
    id: string;
    name: string;
  } | null;
  supplier?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateChequeDto {
  cekNo: string;
  amount: number;
  entryDate: string;
  maturityDate: string;
  direction: ChequeDirection;
  customerId?: string | null;
  supplierId?: string | null;
  bankId?: string | null;
  description?: string | null;
  attachmentId?: string | null;
}

export interface UpdateChequeDto {
  cekNo?: string;
  amount?: number;
  entryDate?: string;
  maturityDate?: string;
  customerId?: string | null;
  supplierId?: string | null;
  bankId?: string | null;
  description?: string | null;
  attachmentId?: string | null;
}

export interface UpdateChequeStatusDto {
  newStatus: ChequeStatus;
  isoDate: string;
  bankId?: string | null;
  supplierId?: string | null; // BUG 7 FIX: Supplier ID when cheque is given to supplier
  description?: string | null;
}

export interface ChequeListQuery {
  status?: ChequeStatus;
  direction?: ChequeDirection;
  entryFrom?: string;
  entryTo?: string;
  maturityFrom?: string;
  maturityTo?: string;
  customerId?: string;
  supplierId?: string;
  bankId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ChequeListResponse {
  items: ChequeDto[];
  totalCount: number;
  totalAmount: number;
  upcomingMaturities: {
    within7Days: number;
    within30Days: number;
    overdue: number;
  };
}

