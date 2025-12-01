export type ChequeStatus =
  | 'KASADA'
  | 'BANKADA_TAHSILDE'
  | 'ODEMEDE'
  | 'TAHSIL_EDILDI'
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
    case 'KARSILIKSIZ':
      return status;

    default:
      return 'KASADA';
  }
}

export interface Cheque {
  id: string;
  cekNo: string;
  bankaId?: string;
  bankaAdi?: string;
  tutar: number;
  vadeTarihi: string;
  duzenleyen: string;
  lehtar: string;
  musteriId?: string;
  tedarikciId?: string;
  status: ChequeStatus;
  kasaMi: boolean;
  aciklama?: string;
  imageUrl?: string;
  imageDataUrl?: string;
  imageFileName?: string;
}
