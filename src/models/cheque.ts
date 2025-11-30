export type ChequeStatus =
  | 'KASADA'
  | 'BANKADA_TAHSILDE'
  | 'ODEMEDE'
  | 'TAHSIL_OLDU'
  | 'ODEME_YAPILDI'
  | 'KARSILIKSIZ'
  | 'IPTAL'
  | 'CIKMIS';

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
