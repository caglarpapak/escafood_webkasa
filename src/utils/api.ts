const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Get current user ID from localStorage
 * Returns the user ID (e.g., 'onur', 'hayrullah') or null if not logged in
 */
function getCurrentUserId(): string | null {
  const saved = localStorage.getItem('esca-webkasa-user');
  if (!saved) return null;
  
  // Map email to user ID
  if (saved === 'onur@esca-food.com') return 'onur';
  if (saved === 'hayrullah@esca-food.com') return 'hayrullah';
  
  return null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const userId = getCurrentUserId();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add user ID header if available
  if (userId) {
    headers['x-user-id'] = userId;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
    }
    console.error('apiRequest - error response:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      url,
    });
    // Log detailed error information
    if (errorData) {
      console.error('Error details:', {
        message: errorData.message,
        error: errorData.error,
        code: errorData.code,
        details: errorData.details,
        stack: errorData.stack,
      });
    }
    
    // Extract validation error details if available
    let errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
    if (errorData.details && Array.isArray(errorData.details)) {
      const validationErrors = errorData.details.map((issue: any) => {
        const path = issue.path?.join('.') || 'unknown';
        return `${path}: ${issue.message || 'Validation error'}`;
      }).join(', ');
      if (validationErrors) {
        errorMessage = `Validation error: ${validationErrors}`;
      }
    }
    
    const error = new Error(errorMessage);
    (error as any).response = { status: response.status, data: errorData };
    throw error;
  }

  const jsonData = await response.json();
  console.log('apiRequest - success response:', {
    url,
    data: jsonData,
    dataType: typeof jsonData,
    isArray: Array.isArray(jsonData),
    length: Array.isArray(jsonData) ? jsonData.length : 'N/A',
  });
  return jsonData;
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
