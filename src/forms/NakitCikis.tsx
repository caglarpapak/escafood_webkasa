import { useEffect, useMemo, useState } from 'react';
import FormRow from '../components/FormRow';
import DateInput from '../components/DateInput';
import MoneyInput from '../components/MoneyInput';
import SearchableSelect from '../components/SearchableSelect';
import { BankMaster } from '../models/bank';
import { Supplier } from '../models/supplier';
import { formatTl } from '../utils/money';
import { isoToDisplay, todayIso } from '../utils/date';

export type NakitCikisKaynak =
  | 'TEDARIKCI_ODEME'
  | 'MAAS_ODEME'
  | 'KASA_TRANSFER_BANKAYA'
  | 'DIGER';

export interface NakitCikisFormValues {
  islemTarihiIso: string;
  kaynak: NakitCikisKaynak;
  bankaId?: string;
  muhatapId?: string;
  muhatap?: string;
  aciklama?: string;
  tutar: number;
  kaydedenKullanici: string;
}

interface NakitCikisProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: NakitCikisFormValues) => void;
  currentUserEmail: string;
  suppliers: Supplier[];
  banks: BankMaster[];
}

const kaynakOptions = [
  { label: 'Tedarikçi Ödemesi', value: 'TEDARIKCI_ODEME' },
  { label: 'Maaş Ödemesi', value: 'MAAS_ODEME' },
  { label: 'Kasa Transferi (Kasadan Bankaya)', value: 'KASA_TRANSFER_BANKAYA' },
  { label: 'Diğer Nakit Çıkış', value: 'DIGER' },
];

export default function NakitCikis({ isOpen, onClose, onSaved, currentUserEmail, suppliers, banks }: NakitCikisProps) {
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [kaynak, setKaynak] = useState<NakitCikisKaynak>('TEDARIKCI_ODEME');
  const [bankaId, setBankaId] = useState('');
  const [muhatapId, setMuhatapId] = useState<string | null>(null);
  const [muhatap, setMuhatap] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [tutar, setTutar] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setKaynak('TEDARIKCI_ODEME');
      setBankaId('');
      setMuhatapId(null);
      setMuhatap('');
      setAciklama('');
      setTutar(null);
      setDirty(false);
    }
  }, [isOpen]);

  const muhatapRequired = useMemo(() => kaynak === 'TEDARIKCI_ODEME' || kaynak === 'MAAS_ODEME', [kaynak]);
  const bankaRequired = useMemo(() => kaynak === 'KASA_TRANSFER_BANKAYA', [kaynak]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    if (!islemTarihiIso || !kaynak || !tutar || tutar <= 0) return;
    if (muhatapRequired && !muhatap) return;
    if (bankaRequired && !bankaId) return;
    const kaynakLabel = kaynakOptions.find((k) => k.value === kaynak)?.label || '';
    const message = [
      'Nakit çıkış kaydedilsin mi?',
      '',
      `Tarih: ${isoToDisplay(islemTarihiIso)}`,
      `Kaynak: ${kaynakLabel}`,
      `Muhatap: ${muhatap || '-'}`,
      `Tutar: ${formatTl(tutar)}`,
      `Açıklama: ${aciklama || '-'}`,
    ].join('\n');
    if (!window.confirm(message)) return;
    onSaved({
      islemTarihiIso,
      kaynak,
      bankaId: bankaRequired ? bankaId : undefined,
      muhatapId: muhatapId || undefined,
      muhatap: muhatapRequired || muhatap ? muhatap : undefined,
      aciklama: aciklama || undefined,
      tutar,
      kaydedenKullanici: currentUserEmail,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Nakit Çıkış</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="space-y-4">
          <FormRow label="İşlem Tarihi" required>
            <DateInput
              value={islemTarihiIso}
              onChange={(val) => {
                setIslemTarihiIso(val);
                setDirty(true);
              }}
            />
          </FormRow>
          <FormRow label="Kaynak" required>
            <select
              className="input"
              value={kaynak}
              onChange={(e) => {
                setKaynak(e.target.value as NakitCikisKaynak);
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
          {bankaRequired && (
            <FormRow label="Banka" required>
              <select
                className="input"
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
          )}
          <FormRow label="Muhatap" required={muhatapRequired}>
            {kaynak === 'TEDARIKCI_ODEME' ? (
              <SearchableSelect
                valueId={muhatapId}
                onChange={(val) => {
                  setMuhatapId(val);
                  const selected = suppliers.find((s) => s.id === val);
                  setMuhatap(selected ? `${selected.kod} - ${selected.ad}` : '');
                  setDirty(true);
                }}
                options={suppliers.map((s) => ({ id: s.id, label: `${s.kod} - ${s.ad}` }))}
                placeholder="Tedarikçi seçiniz"
              />
            ) : (
              <input
                className="input"
                value={muhatap}
                onChange={(e) => {
                  setMuhatap(e.target.value);
                  setDirty(true);
                }}
                placeholder="Muhatap"
              />
            )}
          </FormRow>
          <FormRow label="Açıklama">
            <input
              className="input"
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
              className="input"
              value={tutar}
              onChange={(val) => {
                setTutar(val);
                setDirty(true);
              }}
              placeholder="0,00"
            />
          </FormRow>
          <FormRow label="Kayıt Eden">
            <input className="input" value={currentUserEmail} readOnly />
          </FormRow>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button className="px-4 py-2 bg-slate-200 rounded-lg" onClick={handleClose}>
            İptal
          </button>
          <button className="px-4 py-2 bg-rose-600 text-white rounded-lg" onClick={handleSave}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
