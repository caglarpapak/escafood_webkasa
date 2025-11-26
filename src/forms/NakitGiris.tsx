import { useEffect, useMemo, useState } from 'react';
import DateInput from '../components/DateInput';
import FormRow from '../components/FormRow';
import MoneyInput from '../components/MoneyInput';
import SearchableSelect, { SearchableSelectOption } from '../components/SearchableSelect';
import { BankMaster } from '../models/bank';
import { Customer } from '../models/customer';
import { todayIso, isoToDisplay } from '../utils/date';
import { formatTl } from '../utils/money';

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
  muhatapId?: string;
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
  const [muhatapId, setMuhatapId] = useState<string | null>(null);
  const [muhatap, setMuhatap] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [tutar, setTutar] = useState<number | null>(null);
  const [odemeSekli, setOdemeSekli] = useState<OdemeSekli>('NAKIT');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setKaynak('MUSTERI_TAHSILAT');
      setBankaId('');
      setMuhatapId(null);
      setMuhatap('');
      setAciklama('');
      setTutar(null);
      setOdemeSekli('NAKIT');
      setDirty(false);
    }
  }, [isOpen]);

  const muhatapRequired = useMemo(
    () => kaynak === 'MUSTERI_TAHSILAT' || kaynak === 'SATIS_GELIRI',
    [kaynak]
  );
  const bankaRequired = useMemo(() => kaynak === 'KASA_TRANSFER_BANKADAN', [kaynak]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    if (!islemTarihiIso || !kaynak || !tutar || tutar <= 0) return;
    if (bankaRequired && !bankaId) return;
    if (muhatapRequired && !(muhatapId || muhatap)) return;

    const today = todayIso();
    if (islemTarihiIso > today) {
      alert('Gelecek tarihli işlem kaydedilemez.');
      return;
    }

    const kaynakLabel = kaynakOptions.find((k) => k.value === kaynak)?.label || '';
    const baseMessage = [
      'Nakit giriş kaydedilsin mi?',
      '',
      `Tarih: ${isoToDisplay(islemTarihiIso)}`,
      `Kaynak: ${kaynakLabel}`,
      `Muhatap: ${muhatap || customers.find((c) => c.id === muhatapId)?.ad || '-'}`,
      `Tutar: ${formatTl(tutar)}`,
      `Açıklama: ${aciklama || '-'}`,
    ].join('\n');
    const warning =
      islemTarihiIso < today
        ? '\nDİKKAT: Bu işlem geçmiş tarihli olduğu için Gün İçi İşlemler tablosunda görünmeyecek, sadece Raporlar → Kasa Defteri ekranında listelenecek.'
        : '';
    const message = `${baseMessage}${warning}`;
    if (!window.confirm(message)) return;

    onSaved({
      islemTarihiIso,
      kaynak,
      bankaId: bankaRequired ? bankaId : undefined,
      muhatapId: muhatapId || undefined,
      muhatap: muhatap || undefined,
      aciklama: aciklama || undefined,
      tutar,
      odemeSekli,
      kaydedenKullanici: currentUserEmail,
    });
  };

  const customerOptions: SearchableSelectOption[] = customers.map((c) => ({ id: c.id, label: c.ad }));

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Nakit Giriş</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="space-y-4">
          <FormRow label="İşlem Tarihi" required>
            <DateInput
              value={islemTarihiIso}
              onChange={(v) => {
                setIslemTarihiIso(v);
                setDirty(true);
              }}
            />
          </FormRow>
          <FormRow label="Kaynak" required>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
          </FormRow>
          {bankaRequired ? (
            <FormRow label="Banka" required>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
            </FormRow>
          ) : null}
          {(kaynak === 'MUSTERI_TAHSILAT' || kaynak === 'SATIS_GELIRI') && (
            <FormRow label="Muhatap" required={muhatapRequired}>
              <SearchableSelect
                valueId={muhatapId}
                options={customerOptions}
                placeholder="Muhatap ara"
                onChange={(id) => {
                  setMuhatapId(id);
                  setDirty(true);
                }}
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Serbest muhatap"
                value={muhatap}
                onChange={(e) => {
                  setMuhatap(e.target.value);
                  setDirty(true);
                }}
              />
            </FormRow>
          )}
          {kaynak === 'DIGER' || kaynak === 'KASA_TRANSFER_BANKADAN' ? (
            <FormRow label="Muhatap">
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={muhatap}
                onChange={(e) => {
                  setMuhatap(e.target.value);
                  setDirty(true);
                }}
                placeholder="Muhatap"
              />
            </FormRow>
          ) : null}
          <FormRow label="Açıklama">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              value={aciklama}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setAciklama(e.target.value);
                  setDirty(true);
                }
              }}
              placeholder="Açıklama"
            />
          </FormRow>
          <FormRow label="Tutar" required>
            <MoneyInput
              value={tutar}
              onChange={(v) => {
                setTutar(v);
                setDirty(true);
              }}
              placeholder="0,00"
            />
          </FormRow>
          <FormRow label="Ödeme Şekli" required>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
          </FormRow>
          <FormRow label="Kayıt Eden">
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50" value={currentUserEmail} readOnly />
          </FormRow>
          <div className="flex justify-end space-x-3 pt-2">
            <button className="px-4 py-2 bg-slate-200 rounded-lg" onClick={handleClose}>
              İptal
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg" onClick={handleSave}>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
