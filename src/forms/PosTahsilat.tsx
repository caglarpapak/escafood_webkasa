import React, { useEffect, useMemo, useState } from 'react';
import { PosTerminal } from '../models/pos';
import { BankMaster } from '../models/bank';
import { Customer } from '../models/customer';
import FormRow from '../components/FormRow';
import DateInput from '../components/DateInput';
import MoneyInput from '../components/MoneyInput';
import SearchableSelect from '../components/SearchableSelect';
import { todayIso } from '../utils/date';

export interface PosTahsilatFormValues {
  islemTarihiIso: string;
  posId: string;
  bankaId: string;
  brutTutar: number;
  komisyonOrani: number;
  komisyonTutar: number;
  netTutar: number;
  customerId: string;
  slipImageDataUrl?: string;
  slipImageName?: string;
  aciklama?: string;
  kaydedenKullanici: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: PosTahsilatFormValues) => void;
  currentUserEmail: string;
  posTerminals: PosTerminal[];
  banks: BankMaster[];
  customers: Customer[];
}

export default function PosTahsilat({
  isOpen,
  onClose,
  onSaved,
  currentUserEmail,
  posTerminals,
  banks,
  customers,
}: Props) {
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [posId, setPosId] = useState('');
  const [bankaId, setBankaId] = useState('');
  const [komisyonOrani, setKomisyonOrani] = useState(0.02);
  const [brut, setBrut] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipDataUrl, setSlipDataUrl] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setPosId('');
      setBankaId('');
      setKomisyonOrani(0.02);
      setBrut(null);
      setCustomerId('');
      setAciklama('');
      setSlipFile(null);
      setSlipDataUrl(null);
      setDirty(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const pos = posTerminals.find((p) => p.id === posId);
    if (pos) {
      setKomisyonOrani(pos.komisyonOrani);
      setBankaId(pos.bankaId);
    }
  }, [posId, posTerminals]);

  const komisyonTutar = useMemo(() => (brut ?? 0) * komisyonOrani, [brut, komisyonOrani]);
  const netTutar = useMemo(() => (brut ?? 0) - komisyonTutar, [brut, komisyonTutar]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const customerOptions = useMemo(
    () => customers.map((c) => ({ id: c.id, label: `${c.kod} - ${c.ad}` })),
    [customers]
  );

  const selectedBankName = useMemo(() => banks.find((b) => b.id === bankaId)?.hesapAdi || '', [bankaId, banks]);

  const handleSlipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSlipFile(file);
    if (!file) {
      setSlipDataUrl(null);
      setDirty(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSlipDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    setDirty(true);
  };

  const handleSave = () => {
    if (!islemTarihiIso || !posId || !bankaId || !brut || brut <= 0 || !customerId) return;
    if (!slipDataUrl) {
      alert('Slip görseli eklenmeden POS tahsilat kaydedilemez.');
      return;
    }
    const message = [
      'POS tahsilat kaydedilsin mi?',
      '',
      `Tarih: ${islemTarihiIso}`,
      `POS: ${posTerminals.find((p) => p.id === posId)?.posAdi || '-'}`,
      `Banka: ${selectedBankName || '-'}`,
      `Brüt: ${brut.toFixed(2)}`,
      `Komisyon: ${komisyonTutar.toFixed(2)}`,
      `Net: ${netTutar.toFixed(2)}`,
    ].join('\n');
    if (!window.confirm(message)) return;
    onSaved({
      islemTarihiIso,
      posId,
      bankaId,
      brutTutar: brut,
      komisyonOrani,
      komisyonTutar,
      netTutar,
      customerId,
      slipImageDataUrl: slipDataUrl || undefined,
      slipImageName: slipFile?.name,
      aciklama: aciklama || undefined,
      kaydedenKullanici: currentUserEmail,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">POS Tahsilat</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="İşlem Tarihi" required>
            <DateInput
              value={islemTarihiIso}
              onChange={(v) => {
                setIslemTarihiIso(v);
                setDirty(true);
              }}
            />
          </FormRow>
          <FormRow label="POS" required>
            <select
              className="form-input"
              value={posId}
              onChange={(e) => {
                setPosId(e.target.value);
                setDirty(true);
              }}
            >
              <option value="">Seçiniz</option>
              {posTerminals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.posAdi}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow label="Banka" required>
            <input className="form-input" value={selectedBankName} readOnly />
          </FormRow>
          <FormRow label="Muhatap" required>
            <SearchableSelect
              valueId={customerId || null}
              onChange={(id) => {
                setCustomerId(id || '');
                setDirty(true);
              }}
              options={customerOptions}
              placeholder="Müşteri seçin"
            />
          </FormRow>
          <FormRow label="Brüt Tutar" required>
            <MoneyInput
              value={brut}
              onChange={(v) => {
                setBrut(v);
                setDirty(true);
              }}
              placeholder="0,00"
            />
          </FormRow>
          <FormRow label="Komisyon Oranı" required>
            <input
              className="form-input"
              value={komisyonOrani}
              onChange={(e) => {
                setKomisyonOrani(Number(e.target.value));
                setDirty(true);
              }}
              type="number"
              step="0.001"
            />
          </FormRow>
          <FormRow label="Komisyon Tutarı">
            <input className="form-input" value={komisyonTutar.toFixed(2)} readOnly />
          </FormRow>
          <FormRow label="Net Tutar">
            <input className="form-input" value={netTutar.toFixed(2)} readOnly />
          </FormRow>
          <FormRow label="Açıklama">
            <input
              className="form-input"
              value={aciklama}
              onChange={(e) => {
                setAciklama(e.target.value);
                setDirty(true);
              }}
              placeholder="Açıklama"
            />
          </FormRow>
        <div className="md:col-span-2 flex flex-col w-full">
          <label className="block break-words mb-1 text-sm font-medium">Slip Görseli *</label>
          <input
            className="form-input w-full"
            type="file"
            accept="image/*"
            onChange={handleSlipFileChange}
          />
        </div>
          <FormRow label="Kayıt Eden">
            <input className="form-input" value={currentUserEmail} readOnly />
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
