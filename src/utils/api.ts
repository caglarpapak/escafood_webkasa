const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

export function apiPost<T>(endpoint: string, data: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiPut<T>(endpoint: string, data: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

// --- Domain helpers
export interface BankApiResponse {
  id: string;
  name: string;
  accountNo: string | null;
  iban: string | null;
  isActive: boolean;
  currentBalance?: number;
}

export type DailyTransactionType =
  | 'NAKIT_TAHSILAT'
  | 'NAKIT_ODEME'
  | 'KASA_BANKA_TRANSFER'
  | 'BANKA_KASA_TRANSFER'
  | 'BANKA_HAVALE_GIRIS'
  | 'BANKA_HAVALE_CIKIS'
  | 'POS_TAHSILAT_BRUT'
  | 'POS_KOMISYONU'
  | 'KREDI_KARTI_HARCAMA'
  | 'KREDI_KARTI_EKSTRE_ODEME'
  | 'CEK_GIRISI'
  | 'CEK_TAHSIL_BANKA'
  | 'CEK_ODENMESI'
  | 'CEK_KARSILIKSIZ'
  | 'DEVIR_BAKIYE'
  | 'DUZELTME';

export type DailyTransactionSource =
  | 'KASA'
  | 'BANKA'
  | 'POS'
  | 'KREDI_KARTI'
  | 'CEK'
  | 'SENET'
  | 'DIGER';

export interface CreateTransactionRequest {
  isoDate: string;
  documentNo?: string | null;
  type: DailyTransactionType;
  source: DailyTransactionSource;
  counterparty?: string | null;
  description?: string | null;
  incoming?: number;
  outgoing?: number;
  bankDelta?: number;
  displayIncoming?: number | null;
  displayOutgoing?: number | null;
  cashAccountId?: string | null;
  bankId?: string | null;
  creditCardId?: string | null;
  chequeId?: string | null;
  customerId?: string | null;
  supplierId?: string | null;
  attachmentId?: string | null;
}

export interface TransactionResponse {
  id: string;
  isoDate: string;
  documentNo: string | null;
  type: DailyTransactionType;
  source: DailyTransactionSource;
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
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}

export function getBanks() {
  return apiGet<BankApiResponse[]>('/api/banks');
}

export function createTransaction(payload: CreateTransactionRequest) {
  return apiPost<TransactionResponse>('/api/transactions', payload);
}

export interface CreditCardApiResponse {
  id: string;
  name: string;
  bankId: string | null;
  limit: number | null;
  sonEkstreBorcu: number;
  manualGuncelBorc: number | null;
  closingDay: number | null;
  dueDay: number | null;
  isActive: boolean;
}

export function getCreditCards() {
  return apiGet<CreditCardApiResponse[]>('/api/credit-cards');
}

export function bulkSaveCreditCards(cards: CreditCardApiResponse[]) {
  return apiPost<CreditCardApiResponse[]>('/api/credit-cards/bulk-save', { cards });
}
