import { useEffect, useMemo, useState } from 'react';
import { CreditCard } from '../models/card';
import { BankMaster } from '../models/bank';
import { todayIso, isoToDisplay } from '../utils/date';
import { formatTl } from '../utils/money';
import MoneyInput from '../components/MoneyInput';
import DateInput from '../components/DateInput';
import FormRow from '../components/FormRow';

export type KrediKartiMasrafTuru =
  | 'AKARYAKIT'
  | 'MARKET'
  | 'VERGI'
  | 'SGK'
  | 'FATURA'
  | 'REKLAM'
  | 'DIGER';

export type FaturaAltTuru = 'ELEKTRIK' | 'SU' | 'DOGALGAZ' | 'INTERNET' | 'DIGER';

export interface KrediKartiMasrafFormValues {
  islemTarihiIso: string;
  cardId: string;
  masrafTuru: KrediKartiMasrafTuru;
  plaka?: string;
  faturaAltTuru?: FaturaAltTuru;
  aciklama?: string;
  tutar: number;
  kaydedenKullanici: string;
  isBeforeCutoff: boolean;
  slipFileName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: KrediKartiMasrafFormValues) => void;
  currentUserEmail: string;
  creditCards?: CreditCard[];
  banks?: BankMaster[];
}

export default function KrediKartiMasraf({
  isOpen,
  onClose,
  onSaved,
  currentUserEmail,
  creditCards = [],
  banks = [],
}: Props) {
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [cardId, setCardId] = useState('');
  const [masrafTuru, setMasrafTuru] = useState<KrediKartiMasrafTuru>('AKARYAKIT');
  const [plaka, setPlaka] = useState('');
  const [faturaAltTuru, setFaturaAltTuru] = useState<FaturaAltTuru>('ELEKTRIK');
  const [aciklama, setAciklama] = useState('');
  const [tutar, setTutar] = useState<number | null>(null);
  const [slipFileName, setSlipFileName] = useState('');
  const [dirty, setDirty] = useState(false);

  const safeBanks = banks ?? [];
  const safeCards = creditCards ?? [];

  const eligibleCards = useMemo(
    () => safeCards.filter((c) => safeBanks.find((b) => b.id === c.bankaId)?.krediKartiVarMi),
    [safeBanks, safeCards]
  );

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setCardId('');
      setMasrafTuru('AKARYAKIT');
      setPlaka('');
      setFaturaAltTuru('ELEKTRIK');
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
    const selectedCard = eligibleCards.find((c) => c.id === cardId);
    if (!selectedCard) return;
    if (!islemTarihiIso || !tutar || tutar <= 0) return;
    if (masrafTuru === 'AKARYAKIT' && !plaka.trim()) return;
    if (masrafTuru === 'FATURA' && faturaAltTuru === 'DIGER' && !aciklama.trim()) return;

    const dayOfMonth = new Date(islemTarihiIso).getDate();
    const isBeforeCutoff = dayOfMonth <= (selectedCard.hesapKesimGunu || 0);
    const oldGuncel = selectedCard.guncelBorc || 0;
    const oldEkstre = selectedCard.sonEkstreBorcu || 0;
    const newGuncel = oldGuncel + tutar;
    const newEkstre = oldEkstre + (isBeforeCutoff ? tutar : 0);

    const meta =
      masrafTuru === 'AKARYAKIT'
        ? `Plaka: ${plaka}`
        : masrafTuru === 'FATURA'
        ? `Fatura: ${faturaAltTuru}`
        : '';

    const summary = [
      'Kredi kartı masrafı kaydedilsin mi?',
      '',
      `Kart: ${selectedCard.kartAdi}`,
      `Masraf Türü: ${masrafTuru}${meta ? ` (${meta})` : ''}`,
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
      masrafTuru,
      plaka: plaka || undefined,
      faturaAltTuru: masrafTuru === 'FATURA' ? faturaAltTuru : undefined,
      aciklama: aciklama || undefined,
      tutar,
      kaydedenKullanici: currentUserEmail,
      isBeforeCutoff,
      slipFileName: slipFileName || undefined,
    });
  };

  const showPlaka = masrafTuru === 'AKARYAKIT';
  const showFatura = masrafTuru === 'FATURA';

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Kredi Kartı ile Masraf İşlemi</div>
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
          <FormRow label="Masraf Türü" required>
            <select
              className="input w-full"
              value={masrafTuru}
              onChange={(e) => {
                setMasrafTuru(e.target.value as KrediKartiMasrafTuru);
                setDirty(true);
              }}
            >
              <option value="AKARYAKIT">Akaryakıt</option>
              <option value="MARKET">Market</option>
              <option value="VERGI">Vergi</option>
              <option value="SGK">SGK</option>
              <option value="FATURA">Fatura</option>
              <option value="REKLAM">Reklam</option>
              <option value="DIGER">Diğer giderler</option>
            </select>
          </FormRow>
          {showPlaka && (
            <FormRow label="Plaka" required>
              <input
                className="input w-full"
                value={plaka}
                onChange={(e) => {
                  setPlaka(e.target.value);
                  setDirty(true);
                }}
              />
            </FormRow>
          )}
          {showFatura && (
            <FormRow label="Fatura Türü" required>
              <select
                className="input w-full"
                value={faturaAltTuru}
                onChange={(e) => {
                  setFaturaAltTuru(e.target.value as FaturaAltTuru);
                  setDirty(true);
                }}
              >
                <option value="ELEKTRIK">Elektrik</option>
                <option value="SU">Su</option>
                <option value="DOGALGAZ">Doğalgaz</option>
                <option value="INTERNET">İnternet</option>
                <option value="DIGER">Diğer</option>
              </select>
            </FormRow>
          )}
          <FormRow label="Açıklama" required={masrafTuru === 'FATURA' && faturaAltTuru === 'DIGER'}>
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
