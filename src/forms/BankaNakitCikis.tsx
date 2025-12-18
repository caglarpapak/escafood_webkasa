import { useEffect, useMemo, useState } from 'react';
import { BankMaster } from '../models/bank';
import { Cheque } from '../models/cheque';
import { CreditCard } from '../models/card';
import { Loan } from '../models/loan';
import { formatTl, formatTlPlain, parseTl } from '../utils/money';
import { isoToDisplay, todayIso } from '../utils/date';

export type BankaNakitCikisTuru =
  | 'VIRMAN'
  | 'VERGI_ODEME'
  | 'SGK_ODEME'
  | 'MAAS_ODEME'
  | 'FATURA_ODEME'
  | 'ORTAK_EFT_GIDEN'
  | 'KREDI_TAKSIDI'
  | 'CEK_ODEME'
  | 'KREDI_KARTI_ODEME'
  | 'TEDARIKCI_ODEME';

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
  krediKartiId?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: BankaNakitCikisFormValues) => void;
  currentUserEmail: string;
  banks: BankMaster[];
  cheques: Cheque[];
  creditCards: CreditCard[];
  loans: Loan[];
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
  KREDI_KARTI_ODEME: 'Kredi Kartı Ödemesi',
  TEDARIKCI_ODEME: 'Tedarikçi Ödemesi',
};

const faturaOptions: { value: FaturaMuhatap; label: string }[] = [
  { value: 'ELEKTRIK', label: 'Elektrik' },
  { value: 'SU', label: 'Su' },
  { value: 'DOGALGAZ', label: 'Doğalgaz' },
  { value: 'INTERNET', label: 'İnternet' },
  { value: 'DIGER', label: 'Diğer' },
];

export default function BankaNakitCikis({
  isOpen,
  onClose,
  onSaved,
  currentUserEmail,
  banks,
  cheques,
  creditCards,
  loans,
}: Props) {
  const safeBanks: BankMaster[] = Array.isArray(banks) ? banks : [];
  const safeCreditCards: CreditCard[] = Array.isArray(creditCards) ? creditCards : [];
  const chequeList: Cheque[] = Array.isArray(cheques) ? cheques : [];
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [bankaId, setBankaId] = useState('');
  const [hedefBankaId, setHedefBankaId] = useState('');
  const [islemTuru, setIslemTuru] = useState<BankaNakitCikisTuru>('VIRMAN');
  const [muhatap, setMuhatap] = useState('');
  const [faturaMuhatabi, setFaturaMuhatabi] = useState<FaturaMuhatap>('ELEKTRIK');
  const [aciklama, setAciklama] = useState('');
  const [tutarText, setTutarText] = useState('');
  const [dirty, setDirty] = useState(false);
  const [selectedChequeId, setSelectedChequeId] = useState('');
  const [krediKartiId, setKrediKartiId] = useState('');

  const eligibleCheques = useMemo(
    () =>
      chequeList.filter(
        (c) => c.tedarikciId && (c.status === 'ODEMEDE' || c.status === 'BANKADA_TAHSILDE')
      ),
    [chequeList]
  );

  const eligibleCards = useMemo(
    () => safeCreditCards.filter((c) => safeBanks.find((b) => b.id === c.bankaId)?.krediKartiVarMi),
    [safeBanks, safeCreditCards]
  );

  const krediKartiOptions = useMemo(
    () =>
      eligibleCards.map((c) => ({
        id: c.id,
        label: `${c.kartAdi} – ${safeBanks.find((b) => b.id === c.bankaId)?.bankaAdi ?? '-'}`,
      })),
    [eligibleCards, safeBanks]
  );
  const loanOptions = useMemo(
    () => loans.map((loan) => ({ id: loan.id, label: loan.krediAdi })),
    [loans]
  );

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
      setSelectedChequeId('');
      setKrediKartiId('');
      setKrediId('');
    }
  }, [isOpen]);

  const muhatapRequired = useMemo(
    () => islemTuru === 'MAAS_ODEME' || islemTuru === 'TEDARIKCI_ODEME',
    [islemTuru]
  );
  const faturaRequired = useMemo(() => islemTuru === 'FATURA_ODEME', [islemTuru]);
  const hedefRequired = useMemo(() => islemTuru === 'VIRMAN', [islemTuru]);
  const isCardPayment = islemTuru === 'KREDI_KARTI_ODEME';

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    const today = todayIso();
    let tutar = parseTl(tutarText || '0') || 0;
    const selectedCheque = eligibleCheques.find((c) => c.id === selectedChequeId);
    const selectedCard = isCardPayment ? eligibleCards.find((c) => c.id === krediKartiId) : undefined;
    if (islemTuru === 'CEK_ODEME') {
      if (!selectedCheque) return;
      tutar = selectedCheque.tutar;
      setTutarText(formatTlPlain(selectedCheque.tutar));
    }
    if (isCardPayment) {
      if (!selectedCard) return;
      setBankaId(selectedCard.bankaId);
    }
    const resolvedBankaId = isCardPayment && selectedCard ? selectedCard.bankaId : bankaId;
    if (!islemTarihiIso || !resolvedBankaId || !islemTuru || tutar <= 0) return;
    if (muhatapRequired && muhatap.trim().length < 3) return;
    if (faturaRequired && !faturaMuhatabi) return;
    if (hedefRequired && !hedefBankaId) return;
    if (isCardPayment && !krediKartiId) return;
    if (islemTuru === 'KREDI_TAKSIDI' && !krediId) return;
    if (islemTarihiIso > today) {
      alert('Gelecek tarihli işlem kaydedilemez.');
      return;
    }
    const bankaName = safeBanks.find((b) => b.id === resolvedBankaId)?.hesapAdi || '-';
    const hedefName = hedefBankaId
      ? safeBanks.find((b) => b.id === hedefBankaId)?.hesapAdi || '-'
      : null;
    const lines = [
      'Banka nakit çıkış kaydedilsin mi?',
      '',
      `Tarih: ${isoToDisplay(islemTarihiIso)}`,
      `Banka: ${bankaName}`,
      hedefName ? `Hedef Banka: ${hedefName}` : null,
      `İşlem Türü: ${turLabels[islemTuru]}`,
      isCardPayment
        ? `Kart: ${selectedCard?.kartAdi || '-'}`
        : `Muhatap: ${islemTuru === 'CEK_ODEME' ? selectedCheque?.lehtar || '-' : muhatap || '-'}`,
      islemTuru === 'KREDI_TAKSIDI' ? `Kredi: ${loanOptions.find((l) => l.id === krediId)?.label || '-'}` : null,
      `Tutar: ${formatTl(tutar)}`,
      `Açıklama: ${aciklama || '-'}`,
    ].filter(Boolean) as string[];
    if (islemTarihiIso < today) {
      lines.push("UYARI: Geçmiş tarihli bir işlem kaydediyorsunuz. Bu işlem sadece Kasa Defteri'nde görünecektir.");
    }
    if (!window.confirm(lines.join('\n'))) return;
    onSaved({
      islemTarihiIso,
      bankaId: resolvedBankaId,
      hedefBankaId: hedefRequired ? hedefBankaId : undefined,
      islemTuru,
      muhatap:
        islemTuru === 'CEK_ODEME'
          ? selectedCheque?.lehtar || undefined
          : muhatapRequired || muhatap
          ? muhatap
          : undefined,
      faturaMuhatabi: faturaRequired ? faturaMuhatabi : undefined,
      aciklama: aciklama || undefined,
      tutar,
      kaydedenKullanici: currentUserEmail,
      krediId: islemTuru === 'KREDI_TAKSIDI' ? krediId || null : null,
      cekId: islemTuru === 'CEK_ODEME' ? selectedChequeId : null,
      krediKartiId: isCardPayment ? krediKartiId : null,
    });
  };

  if (!isOpen) return null;

  const selectedCheque = eligibleCheques.find((c) => c.id === selectedChequeId);
  const selectedCard = isCardPayment ? eligibleCards.find((c) => c.id === krediKartiId) : undefined;

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
              className="w-full"
              type="date"
              value={islemTarihiIso}
              onChange={(e) => {
                setIslemTarihiIso(e.target.value);
                setDirty(true);
              }}
            />
          </div>
          {!isCardPayment && (
            <div className="space-y-2">
              <label>Kaynak Banka</label>
              <select
                className="w-full"
                value={bankaId}
                onChange={(e) => {
                  setBankaId(e.target.value);
                  setDirty(true);
                }}
              >
                <option value="">Seçiniz</option>
                {safeBanks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.hesapAdi}
                  </option>
                ))}
              </select>
            </div>
          )}
          {isCardPayment && (
            <div className="space-y-2">
              <label>Kaynak Banka</label>
              <input
                className="w-full"
                value={safeBanks.find((b) => b.id === selectedCard?.bankaId)?.hesapAdi || '-'}
                readOnly
              />
            </div>
          )}
          <div className="space-y-2">
            <label>İşlem Türü</label>
            <select
              className="w-full"
              value={islemTuru}
              onChange={(e) => {
                const next = e.target.value as BankaNakitCikisTuru;
                setIslemTuru(next);
                setDirty(true);
                setSelectedChequeId('');
                setKrediKartiId('');
                setKrediId('');
                if (next !== 'CEK_ODEME') setTutarText('');
              }}
            >
              {Object.entries(turLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {isCardPayment && (
            <div className="space-y-2">
              <label>Kredi Kartı</label>
              <select
                className="w-full"
                value={krediKartiId}
                onChange={(e) => {
                  setKrediKartiId(e.target.value);
                  const card = eligibleCards.find((c) => c.id === e.target.value);
                  if (card) setBankaId(card.bankaId);
                  setDirty(true);
                }}
              >
                <option value="">Seçiniz</option>
                {krediKartiOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {islemTuru === 'KREDI_TAKSIDI' && (
            <div className="space-y-2">
              <label>Kredi</label>
              <select
                className="w-full"
                value={krediId}
                onChange={(e) => {
                  setKrediId(e.target.value);
                  setDirty(true);
                }}
              >
                <option value="">Seçiniz</option>
                {loanOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {hedefRequired && (
            <div className="space-y-2">
              <label>Hedef Banka</label>
              <select
                className="w-full"
                value={hedefBankaId}
                onChange={(e) => {
                  setHedefBankaId(e.target.value);
                  setDirty(true);
                }}
              >
                <option value="">Seçiniz</option>
                {safeBanks
                  .filter((b) => b.id !== bankaId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.hesapAdi}
                    </option>
                  ))}
              </select>
            </div>
          )}
          {!isCardPayment && islemTuru !== 'CEK_ODEME' && (
            <div className="space-y-2">
              <label>Muhatap</label>
              <input
                className="w-full"
                value={muhatap}
                onChange={(e) => {
                  setMuhatap(e.target.value);
                  setDirty(true);
                }}
                placeholder="Muhatap"
              />
            </div>
          )}
          {islemTuru === 'CEK_ODEME' && (
            <div className="space-y-2">
              <label>Ödenecek Çek</label>
              <select
                className="w-full"
                value={selectedChequeId}
                onChange={(e) => {
                  setSelectedChequeId(e.target.value);
                  const cek = eligibleCheques.find((c) => c.id === e.target.value);
                  if (cek) setTutarText(formatTlPlain(cek.tutar));
                  setDirty(true);
                }}
              >
                <option value="">Seçiniz</option>
                {(eligibleCheques ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {`${c.cekNo} - ${c.lehtar} (${formatTl(c.tutar)})`}
                  </option>
                ))}
              </select>
            </div>
          )}
          {isCardPayment && (
            <div className="space-y-2">
              <label>Ödeme Tutarı</label>
              <input
                className="w-full"
                value={tutarText}
                onChange={(e) => {
                  setTutarText(e.target.value);
                  setDirty(true);
                }}
                placeholder="0,00"
              />
            </div>
          )}
          {faturaRequired && (
            <div className="space-y-2">
              <label>Fatura Muhatabı</label>
              <select
                className="w-full"
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
          {!isCardPayment && (
            <div className="space-y-2">
              <label>Açıklama</label>
              <input
                className="w-full"
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
          )}
          {isCardPayment && (
            <div className="space-y-2">
              <label>Açıklama</label>
              <input
                className="w-full"
                value={aciklama}
                onChange={(e) => {
                  setAciklama(e.target.value);
                  setDirty(true);
                }}
                placeholder="Açıklama"
              />
            </div>
          )}
          {!isCardPayment && (
            <div className="space-y-2">
              <label>Tutar</label>
              <input
                className="w-full"
                value={tutarText}
                onChange={(e) => {
                  setTutarText(e.target.value);
                  setDirty(true);
                }}
                placeholder="0,00"
              />
            </div>
          )}
          <div className="space-y-2">
            <label>Kayıt Eden</label>
            <input className="w-full" value={currentUserEmail} readOnly />
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
