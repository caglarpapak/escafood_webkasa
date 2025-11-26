import { useEffect, useMemo, useState } from 'react';
import { BankMaster } from '../models/bank';
import { formatTl, parseTl } from '../utils/money';
import { isoToDisplay, todayIso } from '../utils/date';

export type BankaNakitCikisTuru =
  | 'VIRMAN'
  | 'VERGI_ODEME'
  | 'SGK_ODEME'
  | 'MAAS_ODEME'
  | 'FATURA_ODEME'
  | 'ORTAK_EFT_GIDEN'
  | 'KREDI_TAKSIDI'
  | 'CEK_ODEME';

export type FaturaMuhatap = 'ELEKTRIK' | 'SU' | 'DOGALGAZ' | 'INTERNET' | 'DIGER';

export interface BankaNakitCikisFormValues {
  islemTarihiIso: string;
  bankaId: string;
  hedefBankaId?: string;
  islemTuru: BankaNakitCikisTuru;
  muhatap?: string;
  faturaMuhatabi?: FaturaMuhatap;
  aciklama?: string;
  tutar: number;
  kaydedenKullanici: string;
  krediId?: string | null;
  cekId?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: BankaNakitCikisFormValues) => void;
  currentUserEmail: string;
  banks: BankMaster[];
}

const turLabels: Record<BankaNakitCikisTuru, string> = {
  VIRMAN: 'Virmandan Diğer Banka Hesabına EFT/Havale',
  VERGI_ODEME: 'Vergi Ödemesi',
  SGK_ODEME: 'SGK Ödemesi',
  MAAS_ODEME: 'Maaş Ödemesi',
  FATURA_ODEME: 'Fatura Ödemesi',
  ORTAK_EFT_GIDEN: 'Şirket Ortağı Şahsi Hesaba EFT/Havale',
  KREDI_TAKSIDI: 'Kredi Taksidi',
  CEK_ODEME: 'Çek Ödemesi',
};

const faturaOptions: { value: FaturaMuhatap; label: string }[] = [
  { value: 'ELEKTRIK', label: 'Elektrik' },
  { value: 'SU', label: 'Su' },
  { value: 'DOGALGAZ', label: 'Doğalgaz' },
  { value: 'INTERNET', label: 'İnternet' },
  { value: 'DIGER', label: 'Diğer' },
];

export default function BankaNakitCikis({ isOpen, onClose, onSaved, currentUserEmail, banks }: Props) {
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [bankaId, setBankaId] = useState('');
  const [hedefBankaId, setHedefBankaId] = useState('');
  const [islemTuru, setIslemTuru] = useState<BankaNakitCikisTuru>('VIRMAN');
  const [muhatap, setMuhatap] = useState('');
  const [faturaMuhatabi, setFaturaMuhatabi] = useState<FaturaMuhatap>('ELEKTRIK');
  const [aciklama, setAciklama] = useState('');
  const [tutarText, setTutarText] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setBankaId('');
      setHedefBankaId('');
      setIslemTuru('VIRMAN');
      setMuhatap('');
      setFaturaMuhatabi('ELEKTRIK');
      setAciklama('');
      setTutarText('');
      setDirty(false);
    }
  }, [isOpen]);

  const muhatapRequired = useMemo(() => islemTuru === 'MAAS_ODEME', [islemTuru]);
  const faturaRequired = useMemo(() => islemTuru === 'FATURA_ODEME', [islemTuru]);
  const hedefRequired = useMemo(() => islemTuru === 'VIRMAN', [islemTuru]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    const tutar = parseTl(tutarText || '0') || 0;
    if (!islemTarihiIso || !bankaId || !islemTuru || tutar <= 0) return;
    if (muhatapRequired && muhatap.trim().length < 3) return;
    if (faturaRequired && !faturaMuhatabi) return;
    if (hedefRequired && !hedefBankaId) return;
    const today = todayIso();
    if (islemTarihiIso > today) {
      alert('Gelecek tarihli işlem kaydedilemez.');
      return;
    }
    const bankaName = banks.find((b) => b.id === bankaId)?.hesapAdi || '-';
    const hedefName = hedefBankaId ? banks.find((b) => b.id === hedefBankaId)?.hesapAdi || '-' : null;
    const lines = [
      'Banka nakit çıkış kaydedilsin mi?',
      '',
      `Tarih: ${isoToDisplay(islemTarihiIso)}`,
      `Banka: ${bankaName}`,
      hedefName ? `Hedef Banka: ${hedefName}` : null,
      `İşlem Türü: ${turLabels[islemTuru]}`,
      `Muhatap: ${muhatap || '-'}`,
      `Tutar: ${formatTl(tutar)}`,
      `Açıklama: ${aciklama || '-'}`,
    ].filter(Boolean) as string[];
    if (islemTarihiIso < today) {
      lines.push("UYARI: Geçmiş tarihli bir işlem kaydediyorsunuz. Bu işlem sadece Kasa Defteri'nde görünecektir.");
    }
    if (!window.confirm(lines.join('\n'))) return;
    onSaved({
      islemTarihiIso,
      bankaId,
      hedefBankaId: hedefRequired ? hedefBankaId : undefined,
      islemTuru,
      muhatap: muhatapRequired || muhatap ? muhatap : undefined,
      faturaMuhatabi: faturaRequired ? faturaMuhatabi : undefined,
      aciklama: aciklama || undefined,
      tutar,
      kaydedenKullanici: currentUserEmail,
      krediId: null,
      cekId: null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Banka Nakit Çıkış</div>
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
            <label>Kaynak Banka</label>
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
                setIslemTuru(e.target.value as BankaNakitCikisTuru);
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
          {hedefRequired && (
            <div className="space-y-2">
              <label>Hedef Banka</label>
              <select
                value={hedefBankaId}
                onChange={(e) => {
                  setHedefBankaId(e.target.value);
                  setDirty(true);
                }}
              >
                <option value="">Seçiniz</option>
                {banks
                  .filter((b) => b.id !== bankaId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.hesapAdi}
                    </option>
                  ))}
              </select>
            </div>
          )}
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
          {faturaRequired && (
            <div className="space-y-2">
              <label>Fatura Muhatabı</label>
              <select
                value={faturaMuhatabi}
                onChange={(e) => {
                  setFaturaMuhatabi(e.target.value as FaturaMuhatap);
                  setDirty(true);
                }}
              >
                {faturaOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
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
