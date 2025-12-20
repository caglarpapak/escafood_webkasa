export type UpcomingPaymentCategory = 'KREDI_KARTI' | 'KREDI' | 'CEK';

export interface UpcomingPayment {
  id: string;
  category: UpcomingPaymentCategory;
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
