export type ChequeStatus =
  | 'KASADA'
  | 'BANKADA_TAHSILDE'
  | 'ODEMEDE'
  | 'TAHSIL_EDILDI'
  | 'ODENDI'
  | 'KARSILIKSIZ';

export function normalizeLegacyChequeStatus(status: string): ChequeStatus {
  switch (status) {
    case 'TAHSIL_OLDU':
    case 'ODEME_YAPILDI':
      return 'TAHSIL_EDILDI';

    case 'CIKMIS':
      return 'ODEMEDE';

    case 'IPTAL':
      return 'KASADA';

    case 'KASADA':
    case 'BANKADA_TAHSILDE':
    case 'ODEMEDE':
    case 'TAHSIL_EDILDI':
    case 'ODENDI':
    case 'KARSILIKSIZ':
      return status;

    default:
      return 'KASADA';
  }
}

export type ChequeDirection = 'ALACAK' | 'BORC';

export interface Cheque {
  id: string;
  cekNo: string;
  bankaId?: string; // Legacy: depositBankId (çeki tahsile verdiğimiz banka)
  bankaAdi?: string; // Legacy: depositBankName (çeki tahsile verdiğimiz banka adı)
  issuerBankName?: string; // Çeki düzenleyen banka adı (çekin üstündeki banka)
  tutar: number;
  vadeTarihi: string;
  duzenleyen: string;
  lehtar: string;
  musteriId?: string;
  tedarikciId?: string;
  direction?: ChequeDirection; // ALACAK = customer cheque, BORC = our issued cheque
  status: ChequeStatus;
  kasaMi: boolean;
  aciklama?: string;
  imageUrl?: string;
  imageDataUrl?: string;
  imageFileName?: string;
}
