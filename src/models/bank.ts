export interface BankMaster {
  id: string;
  bankaAdi: string;
  kodu: string;
  hesapAdi: string;
  iban?: string;
  acilisBakiyesi: number;
  aktifMi: boolean;
}
