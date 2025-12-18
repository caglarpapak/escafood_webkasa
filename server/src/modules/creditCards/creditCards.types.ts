import { CreditCardOperationType } from '@prisma/client';

export interface CreditCardDto {
  id: string;
  name: string;
  bankId: string | null;
  limit: number | null;
  sonEkstreBorcu: number;
  manualGuncelBorc: number | null;
  closingDay: number | null;
  dueDay: number | null;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  // Computed fields
  currentDebt: number;
  lastOperationDate: string | null;
  // Relations (optional, populated when needed)
  bank?: {
    id: string;
    name: string;
  } | null;
}

export interface CreditCardOperationDto {
  id: string;
  creditCardId: string;
  isoDate: string;
  type: CreditCardOperationType;
  amount: number;
  description: string | null;
  relatedTransactionId: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface CreateCreditCardDto {
  name: string;
  bankId?: string | null;
  limit?: number | null;
  sonEkstreBorcu?: number;
  manualGuncelBorc?: number | null;
  closingDay?: number | null;
  dueDay?: number | null;
  isActive?: boolean;
}

export interface UpdateCreditCardDto {
  name?: string;
  bankId?: string | null;
  limit?: number | null;
  sonEkstreBorcu?: number;
  manualGuncelBorc?: number | null;
  closingDay?: number | null;
  dueDay?: number | null;
  isActive?: boolean;
}

export interface BulkSaveCreditCardDto extends UpdateCreditCardDto {
  id?: string;
}

export interface CreateExpenseDto {
  creditCardId: string;
  isoDate: string;
  amount: number;
  description?: string | null;
  counterparty?: string | null;
}

export interface CreatePaymentDto {
  creditCardId: string;
  isoDate: string;
  amount: number;
  description?: string | null;
  paymentSource: 'BANKA' | 'KASA';
  bankId?: string | null;
}

export interface ExpenseResponse {
  operation: CreditCardOperationDto;
  transaction: {
    id: string;
    isoDate: string;
    type: string;
    source: string;
    creditCardId: string | null;
    counterparty: string | null;
    description: string | null;
    displayOutgoing: number | null;
  };
}

export interface PaymentResponse {
  operation: CreditCardOperationDto;
  transaction: {
    id: string;
    isoDate: string;
    type: string;
    source: string;
    creditCardId: string | null;
    counterparty: string | null;
    description: string | null;
    bankId: string | null;
    bankDelta: number;
    outgoing: number;
  };
}
