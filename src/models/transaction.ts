export interface DailyTransaction {
  id: string;
  isoDate: string;
  displayDate: string;
  documentNo: string;
  type: string;
  source: string;
  counterparty: string;
  description: string;
  incoming: number;
  outgoing: number;
  balanceAfter: number;
  bankId?: string;
  bankDelta?: number;
  displayIncoming?: number;
  displayOutgoing?: number;

  createdAtIso?: string;
  createdBy?: string;
  attachmentType?: 'POS_SLIP' | 'CHEQUE';
  attachmentImageDataUrl?: string;
  attachmentImageName?: string;
}
