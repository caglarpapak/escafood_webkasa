export type ChequeStatus =
  | 'KASADA'
  | 'BANKADA_TAHSILDE'
  | 'ODEMEDE'
  | 'TAHSIL_OLDU'
  | 'ODEME_YAPILDI'
  | 'KARŞILIKSIZ'
  | 'IPTAL';

export interface Cheque {
  id: string;
  cekNo: string;
  bankaAdi: string;
  duzenleyici: string;
  lehdar: string;
  tutar: number;
  vadeTarihi: string;
  status: ChequeStatus;
  kasaMi: boolean;
}
