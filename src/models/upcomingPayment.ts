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
}
