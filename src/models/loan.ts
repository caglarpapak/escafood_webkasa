export interface Loan {
  id: string;
  krediAdi: string;
  bankaId: string;
  toplamKrediTutari: number;
  vadeSayisi: number;
  ilkTaksitTarihi: string;
  faizOraniYillik: number;
  bsmvOrani: number;
  aktifMi: boolean;
}
