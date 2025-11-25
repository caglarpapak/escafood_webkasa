export interface CreditCard {
  id: string;
  kartAdi: string;
  bankaId: string;
  kartLimit: number;
  asgariOran: number;
  hesapKesimGunu: number;
  sonOdemeGunu: number;
  maskeliKartNo: string;
  aktifMi: boolean;
  sonEkstreBorcu: number;
  guncelBorc: number;
}
