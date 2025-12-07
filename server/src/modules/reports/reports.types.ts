import { DailyTransactionType, DailyTransactionSource } from '@prisma/client';

export interface KasaDefteriQuery {
  from?: string;
  to?: string;
  documentNo?: string;
  type?: DailyTransactionType;
  counterparty?: string;
  description?: string;
  source?: DailyTransactionSource;
  sortKey?: 'isoDate' | 'documentNo' | 'type' | 'counterparty' | 'incoming' | 'outgoing' | 'balanceAfter';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface KasaDefteriResponse {
  items: {
    id: string;
    isoDate: string;
    documentNo: string | null;
    type: DailyTransactionType;
    source: DailyTransactionSource;
    counterparty: string | null;
    description: string | null;
    incoming: number;
    outgoing: number;
    balanceAfter: number;
    displayIncoming: number | null; // BUG 2 FIX: For bank cash in display
    displayOutgoing: number | null; // BUG 2 FIX: For bank cash out display
    bankId: string | null;
    bankName: string | null;
    creditCardId: string | null;
    creditCardName: string | null; // Include credit card name
  }[];
  totalCount: number;
  totalIncoming: number;
  totalOutgoing: number;
  openingBalance: number;
  closingBalance: number;
}

export interface NakitAkisQuery {
  from?: string;
  to?: string;
  scope?: 'HEPSI' | 'NAKIT' | 'BANKA';
  user?: string;
  search?: string;
}

export interface NakitAkisResponse {
  totalIn: number;
  totalOut: number;
  net: number;
  // Bank movement totals (based on bankDelta)
  bankInTotal: number; // Sum of all transactions where bankDelta > 0
  bankOutTotal: number; // Sum of absolute values where bankDelta < 0 (shown as positive)
  bankNet: number; // bankInTotal - bankOutTotal
  // Cash movement totals (based on source = KASA and incoming/outgoing)
  cashInTotal: number; // Sum of source = KASA and incoming > 0
  cashOutTotal: number; // Sum of source = KASA and outgoing > 0
  cashNet: number; // cashInTotal - cashOutTotal
  girisler: {
    isoDate: string;
    type: DailyTransactionType;
    source: DailyTransactionSource;
    counterparty: string | null;
    description: string | null;
    amount: number;
    bankId: string | null;
    bankName: string | null;
    creditCardId: string | null;
    creditCardName: string | null;
  }[];
  cikislar: {
    isoDate: string;
    type: DailyTransactionType;
    source: DailyTransactionSource;
    counterparty: string | null;
    description: string | null;
    amount: number;
    bankId: string | null;
    bankName: string | null;
    creditCardId: string | null;
    creditCardName: string | null;
  }[];
}

