import { useEffect, useMemo, useState } from 'react';
import { CreditCard } from '../models/card';
import { Supplier } from '../models/supplier';
import { BankMaster } from '../models/bank';
import { todayIso, isoToDisplay } from '../utils/date';
import { formatTl } from '../utils/money';
import MoneyInput from '../components/MoneyInput';
import DateInput from '../components/DateInput';
import FormRow from '../components/FormRow';

export interface KrediKartiTedarikciOdemeFormValues {
  islemTarihiIso: string;
  cardId: string;
  supplierId: string;
  muhatap: string;
  aciklama?: string;
  tutar: number;
  kaydedenKullanici: string;
  isBeforeCutoff: boolean;
  slipFileName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: KrediKartiTedarikciOdemeFormValues) => void;
  currentUserEmail: string;
  creditCards?: CreditCard[];
  suppliers?: Supplier[];
  banks?: BankMaster[];
}

export default function KrediKartiTedarikciOdeme({
  isOpen,
  onClose,
  onSaved,
  currentUserEmail,
  creditCards = [],
  suppliers = [],
  banks = [],
}: Props) {
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [cardId, setCardId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [tutar, setTutar] = useState<number | null>(null);
  const [slipFileName, setSlipFileName] = useState('');
  const [dirty, setDirty] = useState(false);

  const safeBanks = banks ?? [];
  const safeCards = creditCards ?? [];
  const safeSuppliers = suppliers ?? [];

  const eligibleCards = useMemo(
    () => safeCards.filter((c) => safeBanks.find((b) => b.id === c.bankaId)?.krediKartiVarMi),
    [safeBanks, safeCards]
  );

  const supplierOptions = useMemo(
    () => safeSuppliers.map((s) => ({ id: s.id, label: `${s.kod} - ${s.ad}` })),
    [safeSuppliers]
  );

  const selectedSupplier = safeSuppliers.find((s) => s.id === supplierId);
  const selectedCard = eligibleCards.find((c) => c.id === cardId);
  const muhatap = selectedSupplier ? `${selectedSupplier.kod} - ${selectedSupplier.ad}` : '';

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setCardId('');
      setSupplierId('');
      setAciklama('');
      setTutar(null);
      setSlipFileName('');
      setDirty(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    if (!islemTarihiIso || !cardId || !supplierId || !selectedCard || !selectedSupplier) return;
    if (!tutar || tutar <= 0) return;
    const dayOfMonth = new Date(islemTarihiIso).getDate();
    const isBeforeCutoff = dayOfMonth <= (selectedCard.hesapKesimGunu || 0);
    const oldGuncel = selectedCard.guncelBorc || 0;
    const oldEkstre = selectedCard.sonEkstreBorcu || 0;
    const newGuncel = oldGuncel + tutar;
    const newEkstre = oldEkstre + (isBeforeCutoff ? tutar : 0);

    const summary = [
      'Kredi kartı ile tedarikçi ödemesi kaydedilsin mi?',
      '',
      `Kart: ${selectedCard.kartAdi}`,
      `Tedarikçi: ${muhatap}`,
      `İşlem Tarihi: ${isoToDisplay(islemTarihiIso)}`,
      `Tutar: ${formatTl(tutar)}`,
      isBeforeCutoff
        ? 'Hesap kesim tarihinden önce: Son ekstre borcuna eklenecek.'
        : 'Hesap kesim tarihinden sonra: Sonraki ekstreye yansıyacak.',
      `Güncel Borç: ${formatTl(oldGuncel)} → ${formatTl(newGuncel)}`,
      isBeforeCutoff ? `Son Ekstre: ${formatTl(oldEkstre)} → ${formatTl(newEkstre)}` : `Son Ekstre: ${formatTl(oldEkstre)}`,
    ];

    if (!window.confirm(summary.join('\n'))) return;

    onSaved({
      islemTarihiIso,
      cardId,
      supplierId,
      muhatap,
      aciklama: aciklama || undefined,
      tutar,
      kaydedenKullanici: currentUserEmail,
      isBeforeCutoff,
      slipFileName: slipFileName || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Kredi Kartı ile Tedarikçiye Ödeme</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="space-y-4">
          <FormRow label="İşlem Tarihi" required>
            <DateInput value={islemTarihiIso} onChange={(val) => { setIslemTarihiIso(val); setDirty(true); }} />
          </FormRow>
          <FormRow label="Kredi Kartı" required>
            <select
              className="input w-full"
              value={cardId}
              onChange={(e) => {
                setCardId(e.target.value);
                setDirty(true);
              }}
            >
              <option value="">Seçiniz</option>
              {eligibleCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.kartAdi}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow label="Tedarikçi" required>
            <select
              className="input w-full"
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);
                setDirty(true);
              }}
            >
              <option value="">Seçiniz</option>
              {supplierOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow label="Muhatap">
            <input className="input w-full" value={muhatap} readOnly />
          </FormRow>
          <FormRow label="Açıklama">
            <input
              className="input w-full"
              value={aciklama}
              onChange={(e) => {
                setAciklama(e.target.value);
                setDirty(true);
              }}
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
            />
          </FormRow>
          <FormRow label="Slip Görseli">
            <input
              className="input w-full"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setSlipFileName(file ? file.name : '');
                setDirty(true);
              }}
            />
            {slipFileName ? <div className="text-xs text-slate-500 mt-1">{slipFileName}</div> : null}
          </FormRow>
          <FormRow label="Kayıt Eden">
            <input className="input w-full" value={currentUserEmail} readOnly />
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
