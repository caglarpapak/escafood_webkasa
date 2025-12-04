import { useEffect, useMemo, useState } from 'react';
import FormRow from '../components/FormRow';
import DateInput from '../components/DateInput';
import MoneyInput from '../components/MoneyInput';
import SearchableSelect from '../components/SearchableSelect';
import { BankMaster } from '../models/bank';
import { Customer } from '../models/customer';
import { Supplier } from '../models/supplier';
import { formatTl } from '../utils/money';
import { isoToDisplay, todayIso } from '../utils/date';

export type BankaNakitGirisTuru =
  | 'MUSTERI_EFT'
  | 'TEDARIKCI_EFT'
  | 'CEK_TAHSILATI'
  | 'ORTAK_EFT_GELEN'
  | 'DIGER_BANKA_GIRIS';

export interface BankaNakitGirisFormValues {
  islemTarihiIso: string;
  bankaId: string | null;
  islemTuru: BankaNakitGirisTuru;
  muhatapId?: string;
  muhatap?: string;
  aciklama?: string;
  tutar: number;
  kaydedenKullanici: string;
  cekId?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: BankaNakitGirisFormValues) => void | Promise<void>;
  currentUserEmail: string;
  banks: BankMaster[];
  customers: Customer[];
  suppliers: Supplier[];
}

const turLabels: Record<BankaNakitGirisTuru, string> = {
  MUSTERI_EFT: 'Müşteriden Gelen EFT/Havale (Resmi Tahsilat)',
  TEDARIKCI_EFT: 'Tedarikçiden Gelen EFT/Havale',
  CEK_TAHSILATI: 'Çek Tahsilatı (Kasadan Bankaya)',
  ORTAK_EFT_GELEN: 'Şirket Ortağı Şahsi Hesabından Gelen EFT/Havale',
  DIGER_BANKA_GIRIS: 'Diğer Banka Girişi',
};

export default function BankaNakitGiris({
  isOpen,
  onClose,
  onSaved,
  currentUserEmail,
  banks,
  customers,
  suppliers,
}: Props) {
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [bankaId, setBankaId] = useState<string | null>(null);
  const [islemTuru, setIslemTuru] = useState<BankaNakitGirisTuru>('MUSTERI_EFT');
  const [muhatapId, setMuhatapId] = useState<string | null>(null);
  const [muhatap, setMuhatap] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [tutar, setTutar] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setBankaId(null);
      setIslemTuru('MUSTERI_EFT');
      setMuhatapId(null);
      setMuhatap('');
      setAciklama('');
      setTutar(null);
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
    if (!islemTarihiIso || !bankaId || !islemTuru || !tutar || tutar <= 0) return;
    const selectedBank = banks.find((b) => b.id === bankaId);
    if (!selectedBank) {
      alert('Seçilen banka listede bulunamadı. Lütfen banka listesini yenileyin.');
      return;
    }
    if (muhatapRequired && !muhatap) return;
    const today = todayIso();
    if (islemTarihiIso > today) {
      alert('Gelecek tarihli işlem kaydedilemez.');
      return;
    }
    const sourceList = islemTuru === 'TEDARIKCI_EFT' ? suppliers : customers;
    const selected = muhatapId ? sourceList.find((m) => m.id === muhatapId) : undefined;
    const muhatapLabel =
      (selected && `${selected.kod} - ${selected.ad}`) ||
      muhatap ||
      '-';
    const bankaName = selectedBank.hesapAdi || '-';
    const baseMessage = [
      'Banka nakit giriş kaydedilsin mi?',
      '',
      `Tarih: ${isoToDisplay(islemTarihiIso)}`,
      `Banka: ${bankaName}`,
      `İşlem Türü: ${turLabels[islemTuru]}`,
      `Muhatap: ${muhatapLabel}`,
      `Tutar: ${formatTl(tutar)}`,
      `Açıklama: ${aciklama || '-'}`,
    ].join('\n');
    const warning =
      islemTarihiIso < today
        ? "\nUYARI: Geçmiş tarihli bir işlem kaydediyorsunuz. Bu işlem sadece Kasa Defteri'nde görünecektir."
        : '';
    const message = `${baseMessage}${warning}`;
    if (!window.confirm(message)) return;
    onSaved({
      islemTarihiIso,
      bankaId,
      islemTuru,
      muhatapId: muhatapId || undefined,
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
          <FormRow label="Banka" required>
            <select
              className="input"
              value={bankaId ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                setBankaId(value || null);
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
          <FormRow label="İşlem Türü" required>
            <select
              className="input"
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
          </FormRow>
          <FormRow label="Muhatap" required={muhatapRequired}>
            {['MUSTERI_EFT', 'TEDARIKCI_EFT', 'ORTAK_EFT_GELEN'].includes(islemTuru) ? (
              <SearchableSelect
                valueId={muhatapId}
                onChange={(val) => {
                  setMuhatapId(val);
                  const sourceList = islemTuru === 'TEDARIKCI_EFT' ? suppliers : customers;
                  const selected = sourceList.find((m) => m.id === val);
                  const label = selected
                    ? `${'kod' in selected && (selected as Supplier).kod ? (selected as Supplier).kod + ' - ' : ''}${
                        (selected as Customer | Supplier).ad
                      }`
                    : '';
                  setMuhatap(label);
                  setDirty(true);
                }}
                options={
                  islemTuru === 'TEDARIKCI_EFT'
                    ? suppliers.map((s) => ({ id: s.id, label: `${s.kod} - ${s.ad}` }))
                    : customers.map((c) => ({ id: c.id, label: `${c.kod} - ${c.ad}` }))
                }
                placeholder="Muhatap seçiniz"
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
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg" onClick={handleSave}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
