import { useEffect, useMemo, useState } from 'react';
import { BankMaster } from '../models/bank';
import { parseTl } from '../utils/money';
import { todayIso } from '../utils/date';

export type BankaNakitGirisTuru =
  | 'MUSTERI_EFT'
  | 'TEDARIKCI_EFT'
  | 'CEK_TAHSILATI'
  | 'ORTAK_EFT_GELEN'
  | 'DIGER_BANKA_GIRIS';

export interface BankaNakitGirisFormValues {
  islemTarihiIso: string;
  bankaId: string;
  islemTuru: BankaNakitGirisTuru;
  muhatap?: string;
  aciklama?: string;
  tutar: number;
  kaydedenKullanici: string;
  cekId?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: BankaNakitGirisFormValues) => void;
  currentUserEmail: string;
  banks: BankMaster[];
}

const turLabels: Record<BankaNakitGirisTuru, string> = {
  MUSTERI_EFT: 'Müşteriden Gelen EFT/Havale (Resmi Tahsilat)',
  TEDARIKCI_EFT: 'Tedarikçiden Gelen EFT/Havale',
  CEK_TAHSILATI: 'Çek Tahsilatı (Kasadan Bankaya)',
  ORTAK_EFT_GELEN: 'Şirket Ortağı Şahsi Hesabından Gelen EFT/Havale',
  DIGER_BANKA_GIRIS: 'Diğer Banka Girişi',
};

export default function BankaNakitGiris({ isOpen, onClose, onSaved, currentUserEmail, banks }: Props) {
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [bankaId, setBankaId] = useState('');
  const [islemTuru, setIslemTuru] = useState<BankaNakitGirisTuru>('MUSTERI_EFT');
  const [muhatap, setMuhatap] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [tutarText, setTutarText] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setBankaId('');
      setIslemTuru('MUSTERI_EFT');
      setMuhatap('');
      setAciklama('');
      setTutarText('');
      setDirty(false);
    }
  }, [isOpen]);

  const muhatapRequired = useMemo(
    () => ['MUSTERI_EFT', 'TEDARIKCI_EFT', 'ORTAK_EFT_GELEN'].includes(islemTuru),
    [islemTuru]
  );

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    const tutar = parseTl(tutarText || '0') || 0;
    if (!islemTarihiIso || !bankaId || !islemTuru || tutar <= 0) return;
    if (muhatapRequired && !muhatap) return;
    if (!window.confirm('Bu işlemi kaydetmek istediğinize emin misiniz?')) return;
    onSaved({
      islemTarihiIso,
      bankaId,
      islemTuru,
      muhatap: muhatapRequired || muhatap ? muhatap : undefined,
      aciklama: aciklama || undefined,
      tutar,
      kaydedenKullanici: currentUserEmail,
      cekId: null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Banka Nakit Giriş</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label>İşlem Tarihi</label>
            <input
              type="date"
              value={islemTarihiIso}
              onChange={(e) => {
                setIslemTarihiIso(e.target.value);
                setDirty(true);
              }}
            />
          </div>
          <div className="space-y-2">
            <label>Banka</label>
            <select
              value={bankaId}
              onChange={(e) => {
                setBankaId(e.target.value);
                setDirty(true);
              }}
            >
              <option value="">Seçiniz</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.hesapAdi}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label>İşlem Türü</label>
            <select
              value={islemTuru}
              onChange={(e) => {
                setIslemTuru(e.target.value as BankaNakitGirisTuru);
                setDirty(true);
              }}
            >
              {Object.entries(turLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label>Muhatap</label>
            <input
              value={muhatap}
              onChange={(e) => {
                setMuhatap(e.target.value);
                setDirty(true);
              }}
              placeholder="Muhatap"
            />
          </div>
          <div className="space-y-2">
            <label>Açıklama</label>
            <input
              value={aciklama}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setAciklama(e.target.value);
                  setDirty(true);
                }
              }}
              placeholder="Açıklama"
            />
          </div>
          <div className="space-y-2">
            <label>Tutar</label>
            <input
              value={tutarText}
              onChange={(e) => {
                setTutarText(e.target.value);
                setDirty(true);
              }}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <label>Kayıt Eden</label>
            <input value={currentUserEmail} readOnly />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button className="px-4 py-2 bg-slate-200 rounded-lg" onClick={handleClose}>
            İptal
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg" onClick={handleSave}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
