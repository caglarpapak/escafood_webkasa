import { UpcomingPayment } from './upcomingPayment';

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

