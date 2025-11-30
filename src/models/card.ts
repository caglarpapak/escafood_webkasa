export interface CreditCard {
  id: string;
  bankaId: string;
  kartAdi: string;
  kartLimit: number;
  limit: number;
  kullanilabilirLimit: number;
  asgariOran: number;
  hesapKesimGunu: number;
  sonOdemeGunu: number;
  maskeliKartNo: string;
  aktifMi: boolean;
  sonEkstreBorcu: number;
  guncelBorc: number;
}
