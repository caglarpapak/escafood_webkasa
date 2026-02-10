export type DailyTransactionType =
  | 'NAKIT_TAHSILAT'
  | 'NAKIT_ODEME'
  | 'KASA_BANKA_TRANSFER'
  | 'KASA_BANKA_TRANSFER_OUT'
  | 'KASA_BANKA_TRANSFER_IN'
  | 'BANKA_KASA_TRANSFER'
  | 'BANKA_KASA_TRANSFER_OUT'
  | 'BANKA_KASA_TRANSFER_IN'
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

export const DAILY_TRANSACTION_TYPE_LABELS: Record<DailyTransactionType, string> = {
  NAKIT_TAHSILAT: 'Nakit Tahsilat',
  NAKIT_ODEME: 'Nakit Ödeme',
  KASA_BANKA_TRANSFER: 'Kasa → Banka Transfer',
  KASA_BANKA_TRANSFER_OUT: 'Kasa → Banka Transfer (Çıkış)',
  KASA_BANKA_TRANSFER_IN: 'Kasa → Banka Transfer (Giriş)',
  BANKA_KASA_TRANSFER: 'Banka → Kasa Transfer',
  BANKA_KASA_TRANSFER_OUT: 'Banka → Kasa Transfer (Çıkış)',
  BANKA_KASA_TRANSFER_IN: 'Banka → Kasa Transfer (Giriş)',
  BANKA_HAVALE_GIRIS: 'Banka Havale Girişi',
  BANKA_HAVALE_CIKIS: 'Banka Havale Çıkışı',
  POS_TAHSILAT_BRUT: 'POS Tahsilat (Brüt)',
  POS_KOMISYONU: 'POS Komisyonu',
  KREDI_KARTI_HARCAMA: 'Kredi Kartı Harcaması',
  KREDI_KARTI_EKSTRE_ODEME: 'Kredi Kartı Ekstre Ödemesi',
  CEK_GIRISI: 'Çek Girişi',
  CEK_TAHSIL_BANKA: 'Çek Tahsil (Banka)',
  CEK_ODENMESI: 'Çek Ödemesi',
  CEK_KARSILIKSIZ: 'Karşılıksız Çek',
  DEVIR_BAKIYE: 'Devir Bakiye',
  DUZELTME: 'Düzeltme',
};

export const DAILY_TRANSACTION_SOURCE_LABELS: Record<DailyTransactionSource, string> = {
  KASA: 'Kasa',
  BANKA: 'Banka',
  POS: 'POS',
  KREDI_KARTI: 'Kredi Kartı',
  CEK: 'Çek',
  SENET: 'Senet',
  DIGER: 'Diğer',
};

export function getTransactionTypeLabel(type: DailyTransactionType): string {
  return DAILY_TRANSACTION_TYPE_LABELS[type] ?? type;
}

export function getTransactionSourceLabel(source: DailyTransactionSource): string {
  return DAILY_TRANSACTION_SOURCE_LABELS[source] ?? source;
}

export interface DailyTransaction {
  id: string;
  isoDate: string;
  displayDate: string;
  documentNo: string;
  type: DailyTransactionType;
  source: DailyTransactionSource;
  counterparty: string;
  description: string;
  category?: string; // TÜR / AÇIKLAMA / KATEGORİ AYRIMI - 4.2: Kategori (vergi, maaş, sgk, fatura vs.)
  incoming: number;
  outgoing: number;
  balanceAfter: number;
  bankId?: string;
  creditCardId?: string | null;
  bankDelta?: number;
  displayIncoming?: number;
  displayOutgoing?: number;

  createdAtIso?: string;
  createdBy?: string; // KULLANICI / AUTH / AUDIT - 7.1: createdByUserId (ASLA gösterilmez)
  createdByEmail?: string; // KULLANICI / AUTH / AUDIT - 7.1: createdByEmail (UI'da email gösterilir)
  attachmentId?: string | null; // Frontend should fetch via GET /api/attachments/:id when needed
}
