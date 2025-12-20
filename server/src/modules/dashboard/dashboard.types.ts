export interface UpcomingPayment {
  id: string;
  category: 'KREDI_KARTI' | 'KREDI' | 'CEK';
  bankName: string;
  name: string;
  dueDateIso: string;
  dueDateDisplay: string;
  amount: number;
  daysLeft: number;
  // NUCLEAR FIX: Include installmentId and loanId for loan payments
  installmentId?: string;
  loanId?: string;
}

export interface DashboardSummary {
  cashBalance: number;
  totalBankBalance: number;
  bankBalances: Array<{
    bankId: string;
    bankName: string;
    balance: number;
  }>;
  creditCardSummary?: Array<{
    creditCardId: string;
    creditCardName: string;
    currentDebt: number;
    limit: number;
    availableLimit: number;
  }>;
  upcomingPayments?: UpcomingPayment[];
}

