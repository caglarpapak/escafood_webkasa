import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/ui/Modal';
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
  slipImageDataUrl?: string;
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
  const [slipImageDataUrl, setSlipImageDataUrl] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [dirty, setDirty] = useState(false);

  const safeBanks = banks ?? [];
  const safeCards = creditCards ?? [];

  const cardOptions = useMemo(
    () =>
      safeCards
        .filter((c) => c.aktifMi)
        .map((c) => {
          const bank = safeBanks.find((b) => b.id === c.bankaId);
          const bankName = bank ? bank.bankaAdi : '-';
          return { id: c.id, label: `${bankName} - ${c.kartAdi}` };
        }),
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
      setSlipImageDataUrl(null);
      setSlipFile(null);
      setDirty(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    const selectedCard = safeCards.find((c) => c.id === cardId);
    if (!selectedCard) return;
    if (!islemTarihiIso || !tutar || tutar <= 0) return;
    if (masrafTuru === 'AKARYAKIT' && !plaka.trim()) return;
    if (masrafTuru === 'FATURA' && faturaAltTuru === 'DIGER' && !aciklama.trim()) return;

    const dayOfMonth = parseInt(islemTarihiIso.split('-')[2] || '0', 10);
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
      slipImageDataUrl: slipImageDataUrl || undefined,
    });
  };

  const showPlaka = masrafTuru === 'AKARYAKIT';
  const showFatura = masrafTuru === 'FATURA';

  const footer = (
    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
      <button
        className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors w-full sm:w-auto"
        onClick={handleClose}
      >
        İptal
      </button>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto"
        onClick={handleSave}
      >
        Kaydet
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Kredi Kartı ile Masraf İşlemi"
      size="lg"
      footer={footer}
    >
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
              {cardOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
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
                const file = e.target.files?.[0] || null;
                setSlipFile(file);
                if (!file) {
                  setSlipFileName('');
                  setSlipImageDataUrl(null);
                  setDirty(true);
                  return;
                }
                setSlipFileName(file.name);
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setSlipImageDataUrl(reader.result);
                  }
                };
                reader.readAsDataURL(file);
                setDirty(true);
              }}
            />
            {slipFileName ? <div className="text-xs text-slate-500 mt-1">{slipFileName}</div> : null}
          </FormRow>
          <FormRow label="Kayıt Eden">
            <input className="input w-full" value={currentUserEmail} readOnly />
          </FormRow>
        </div>
    </Modal>
  );
}
