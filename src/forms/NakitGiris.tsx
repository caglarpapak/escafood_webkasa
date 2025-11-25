import { useEffect, useMemo, useState } from 'react';
import { BankMaster } from '../models/bank';
import { Customer } from '../models/customer';
import { parseTl } from '../utils/money';
import { todayIso } from '../utils/date';

export type NakitGirisKaynak =
  | 'MUSTERI_TAHSILAT'
  | 'SATIS_GELIRI'
  | 'KASA_TRANSFER_BANKADAN'
  | 'DIGER';

export type OdemeSekli = 'NAKIT' | 'HAVALE_SAHSI' | 'DIGER';

export interface NakitGirisFormValues {
  islemTarihiIso: string;
  kaynak: NakitGirisKaynak;
  bankaId?: string;
  muhatap?: string;
  aciklama?: string;
  tutar: number;
  odemeSekli: OdemeSekli;
  kaydedenKullanici: string;
}

interface NakitGirisProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: NakitGirisFormValues) => void;
  currentUserEmail: string;
  customers: Customer[];
  banks: BankMaster[];
}

const kaynakOptions = [
  { label: 'Müşteriden Resmi Nakit Tahsilat', value: 'MUSTERI_TAHSILAT' },
  { label: 'Satış Geliri (G.Resmi)', value: 'SATIS_GELIRI' },
  { label: 'Kasa Transferi (Bankadan → Kasaya)', value: 'KASA_TRANSFER_BANKADAN' },
  { label: 'Diğer Nakit Girişi', value: 'DIGER' },
];

export default function NakitGiris({ isOpen, onClose, onSaved, currentUserEmail, customers, banks }: NakitGirisProps) {
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [kaynak, setKaynak] = useState<NakitGirisKaynak>('MUSTERI_TAHSILAT');
  const [bankaId, setBankaId] = useState('');
  const [muhatap, setMuhatap] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [tutarText, setTutarText] = useState('');
  const [odemeSekli, setOdemeSekli] = useState<OdemeSekli>('NAKIT');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setKaynak('MUSTERI_TAHSILAT');
      setBankaId('');
      setMuhatap('');
      setAciklama('');
      setTutarText('');
      setOdemeSekli('NAKIT');
      setDirty(false);
    }
  }, [isOpen]);

  const muhatapRequired = useMemo(() => kaynak === 'MUSTERI_TAHSILAT' || kaynak === 'SATIS_GELIRI', [kaynak]);
  const bankaRequired = useMemo(() => kaynak === 'KASA_TRANSFER_BANKADAN', [kaynak]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    const tutar = parseTl(tutarText || '0') || 0;
    if (!islemTarihiIso || !kaynak || tutar <= 0) return;
    if (muhatapRequired && !muhatap) return;
    if (bankaRequired && !bankaId) return;
    if (!window.confirm('Bu işlemi kaydetmek istediğinize emin misiniz?')) return;
    onSaved({
      islemTarihiIso,
      kaynak,
      bankaId: bankaRequired ? bankaId : undefined,
      muhatap: muhatapRequired || muhatap ? muhatap : undefined,
      aciklama: aciklama || undefined,
      tutar,
      odemeSekli,
      kaydedenKullanici: currentUserEmail,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Nakit Giriş</div>
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
            <label>Kaynak</label>
            <select
              value={kaynak}
              onChange={(e) => {
                setKaynak(e.target.value as NakitGirisKaynak);
                setDirty(true);
              }}
            >
              {kaynakOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {bankaRequired && (
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
            <label>Ödeme Şekli</label>
            <select
              value={odemeSekli}
              onChange={(e) => {
                setOdemeSekli(e.target.value as OdemeSekli);
                setDirty(true);
              }}
            >
              <option value="NAKIT">Nakit</option>
              <option value="HAVALE_SAHSI">Havale / EFT (Şahsi hesaba)</option>
              <option value="DIGER">Diğer</option>
            </select>
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
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg" onClick={handleSave}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
