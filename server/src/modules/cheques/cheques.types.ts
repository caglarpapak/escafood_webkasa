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
  issuerBankName: string; // Çeki düzenleyen banka adı (çekin üstündeki banka)
  depositBankId: string | null; // Çeki tahsile verdiğimiz banka (bizim bankamız)
  drawerName: string;
  payeeName: string;
  description: string | null;
  attachmentId: string | null;
  imageDataUrl: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  // Relations (optional, populated when needed)
  depositBank?: {
    id: string;
    name: string;
    accountNo: string | null;
    iban: string | null;
  } | null; // Çeki tahsile verdiğimiz banka (bizim bankamız)
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
  drawerName: string;
  payeeName?: string; // Optional, backend will set default if not provided
  issuerBankName: string; // Çeki düzenleyen banka adı (zorunlu)
  depositBankId?: string | null; // Çeki tahsile verdiğimiz banka (opsiyonel, sadece tahsile ver işleminde set edilir)
  customerId?: string | null;
  supplierId?: string | null;
  description?: string | null;
  attachmentId?: string | null;
  imageDataUrl?: string | null; // MVP: Base64 data URL
}

export interface UpdateChequeDto {
  cekNo?: string;
  amount?: number;
  entryDate?: string;
  maturityDate?: string;
  issuerBankName?: string; // Çek bankası adı
  depositBankId?: string | null; // Çeki tahsile verdiğimiz banka
  customerId?: string | null;
  supplierId?: string | null;
  description?: string | null;
  attachmentId?: string | null;
}

export interface UpdateChequeStatusDto {
  newStatus: ChequeStatus;
  isoDate: string;
  depositBankId?: string | null; // Çeki tahsile verdiğimiz banka (BANKADA_TAHSILDE için zorunlu)
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

export interface PayableChequeDto {
  id: string;
  cekNo: string;
  maturityDate: string;
  amount: number;
  counterparty: string;
  bankId: string | null;
}

export interface PayChequeDto {
  bankId: string;
  paymentDate: string;
  note?: string | null;
}

export interface PayChequeResponse {
  ok: boolean;
  paidChequeId: string;
  transactionId: string;
  updatedCheque: {
    id: string;
    status: string;
    paidAt: string | null;
    paidBankId: string | null;
    paymentTransactionId: string | null;
  };
}

