import { useEffect, useMemo, useState } from 'react';
import { BankMaster } from '../models/bank';
import { Cheque } from '../models/cheque';
import { CreditCard } from '../models/card';
import { Supplier } from '../models/supplier';
import { Loan } from '../models/loan';
import { formatTl, formatTlPlain, parseTl } from '../utils/money';
import { isoToDisplay, todayIso } from '../utils/date';
import { apiGet, apiPost } from '../utils/api';
import SearchableSelect from '../components/SearchableSelect';

export type BankaNakitCikisTuru =
  | 'VIRMAN'
  | 'VERGI_ODEME'
  | 'SGK_ODEME'
  | 'MAAS_ODEME'
  | 'FATURA_ODEME'
  | 'ORTAK_EFT_GIDEN'
  | 'CEK_ODEME'
  | 'KREDI_KARTI_ODEME'
  | 'KREDI_ODEME'
  | 'TEDARIKCI_ODEME';

export type FaturaMuhatap = 'ELEKTRIK' | 'SU' | 'DOGALGAZ' | 'INTERNET' | 'DIGER';

export interface BankaNakitCikisFormValues {
  islemTarihiIso: string;
  bankaId: string;
  hedefBankaId?: string;
  islemTuru: BankaNakitCikisTuru;
  muhatap?: string;
  muhatapId?: string; // Supplier ID for supplier payments
  faturaMuhatabi?: FaturaMuhatap;
  aciklama?: string;
  tutar: number;
  kaydedenKullanici: string;
  cekId?: string | null;
  krediKartiId?: string | null;
  loanId?: string | null; // Loan ID for loan payment (backend will find next unpaid installment)
  supplierId?: string | null; // Supplier ID for linking transaction
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: BankaNakitCikisFormValues) => void;
  currentUserEmail: string;
  banks: BankMaster[];
  cheques: Cheque[];
  creditCards: CreditCard[];
  suppliers: Supplier[];
  loans: Loan[];
}

const turLabels: Record<BankaNakitCikisTuru, string> = {
  VIRMAN: 'Virmandan Diğer Banka Hesabına EFT/Havale',
  VERGI_ODEME: 'Vergi Ödemesi',
  SGK_ODEME: 'SGK Ödemesi',
  MAAS_ODEME: 'Maaş Ödemesi',
  FATURA_ODEME: 'Fatura Ödemesi',
  ORTAK_EFT_GIDEN: 'Şirket Ortağı Şahsi Hesaba EFT/Havale',
  CEK_ODEME: 'Çek Ödemesi',
  KREDI_KARTI_ODEME: 'Kredi Kartı Ödemesi',
  KREDI_ODEME: 'Kredi Ödemesi',
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
  suppliers,
  loans,
}: Props) {
  const safeBanks: BankMaster[] = Array.isArray(banks) ? banks : [];
  const safeCreditCards: CreditCard[] = Array.isArray(creditCards) ? creditCards : [];
  const safeSuppliers: Supplier[] = Array.isArray(suppliers) ? suppliers : [];
  const chequeList: Cheque[] = Array.isArray(cheques) ? cheques : [];
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [bankaId, setBankaId] = useState('');
  const [hedefBankaId, setHedefBankaId] = useState('');
  const [islemTuru, setIslemTuru] = useState<BankaNakitCikisTuru>('VIRMAN');
  const [muhatap, setMuhatap] = useState('');
  const [muhatapId, setMuhatapId] = useState('');
  const [faturaMuhatabi, setFaturaMuhatabi] = useState<FaturaMuhatap>('ELEKTRIK');
  const [aciklama, setAciklama] = useState('');
  const [tutarText, setTutarText] = useState('');
  const [dirty, setDirty] = useState(false);
  const [selectedChequeId, setSelectedChequeId] = useState('');
  const [krediKartiId, setKrediKartiId] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [payableCheques, setPayableCheques] = useState<Array<{
    id: string;
    cekNo: string;
    maturityDate: string;
    amount: number;
    counterparty: string;
    bankId: string | null;
  }>>([]);
  const [loadingPayableCheques, setLoadingPayableCheques] = useState(false);
  const isChequePayment = islemTuru === 'CEK_ODEME';

  // SINGLE SOURCE OF TRUTH FIX: Fetch payable cheques from backend when cheque payment is selected
  // This ensures we see the same data as dashboard upcoming payments
  useEffect(() => {
    if (isChequePayment && bankaId) {
      setLoadingPayableCheques(true);
      apiGet<Array<{
        id: string;
        cekNo: string;
        maturityDate: string;
        amount: number;
        counterparty: string;
        bankId: string | null;
      }>>(`/api/cheques/payable?bankId=${bankaId}`)
        .then((data) => {
          setPayableCheques(data);
        })
        .catch((error) => {
          console.error('Failed to fetch payable cheques:', error);
          setPayableCheques([]);
        })
        .finally(() => {
          setLoadingPayableCheques(false);
        });
    } else {
      setPayableCheques([]);
    }
  }, [isChequePayment, bankaId]);

  // FALLBACK: Use prop cheques if payableCheques is empty (for backward compatibility)
  // But prefer backend payable cheques as single source of truth
  const eligibleCheques = useMemo(() => {
    // If we have payable cheques from backend, use them (map to Cheque format)
    if (payableCheques.length > 0) {
      return payableCheques.map((pc) => {
        // Find matching cheque from prop for additional fields
        const propCheque = chequeList.find((c) => c.id === pc.id);
        return {
          id: pc.id,
          cekNo: pc.cekNo,
          tutar: pc.amount,
          vadeTarihi: pc.maturityDate,
          direction: 'BORC' as const,
          status: propCheque?.status || 'ODEMEDE' as any,
          ...propCheque, // Include other fields from prop if available
          // CRITICAL: Set lehtar and counterparty AFTER spread to override prop values
          // Backend counterparty includes supplier/customer name (e.g., "Supplier Name" or "Çek 12345")
          lehtar: pc.counterparty,
          counterparty: pc.counterparty, // Store counterparty separately for easy access
        } as Cheque & { counterparty?: string };
      });
    }
    // Fallback to prop cheques (legacy behavior)
    return chequeList.filter(
      (c) => 
        c.direction === 'BORC' && 
        (c.status === 'KASADA' || c.status === 'ODEMEDE' || c.status === 'BANKADA_TAHSILDE') &&
        c.status !== 'TAHSIL_EDILDI' &&
        c.status !== 'KARSILIKSIZ'
    );
  }, [payableCheques, chequeList]);

  // Fix Bug 1: Show all active credit cards, not just those with krediKartiVarMi flag
  const eligibleCards = useMemo(
    () => safeCreditCards.filter((c) => c.aktifMi),
    [safeCreditCards]
  );

  const krediKartiOptions = useMemo(
    () =>
      eligibleCards.map((c) => {
        const bank = safeBanks.find((b) => b.id === c.bankaId);
        return {
          id: c.id,
          label: `${c.kartAdi}${bank ? ` – ${bank.bankaAdi}` : ''}`,
        };
      }),
    [eligibleCards, safeBanks]
  );

  // Fix Bug 2: Supplier options for supplier payments
  const supplierOptions = useMemo(
    () => safeSuppliers.filter((s) => s.aktifMi).map((s) => ({ id: s.id, label: `${s.kod} - ${s.ad}` })),
    [safeSuppliers]
  );

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setBankaId('');
      setHedefBankaId('');
      setIslemTuru('VIRMAN');
      setMuhatap('');
      setMuhatapId('');
      setFaturaMuhatabi('ELEKTRIK');
      setAciklama('');
      setTutarText('');
      setDirty(false);
      setSelectedChequeId('');
      setKrediKartiId('');
      setSelectedLoanId('');
    }
  }, [isOpen]);

  const muhatapRequired = useMemo(
    () => islemTuru === 'MAAS_ODEME' || islemTuru === 'TEDARIKCI_ODEME',
    [islemTuru]
  );
  const faturaRequired = useMemo(() => islemTuru === 'FATURA_ODEME', [islemTuru]);
  const hedefRequired = useMemo(() => islemTuru === 'VIRMAN', [islemTuru]);
  const isCardPayment = islemTuru === 'KREDI_KARTI_ODEME';
  const isLoanPayment = islemTuru === 'KREDI_ODEME';
  
  // Get loans for the selected bank
  const eligibleLoans = useMemo(() => {
    if (!isLoanPayment || !bankaId) return [];
    return (loans || []).filter((loan) => loan.isActive && loan.bankId === bankaId && loan.installments && loan.installments.length > 0);
  }, [isLoanPayment, bankaId, loans]);
  
  // LOAN PAYMENT FIX: Find next installment for UI display (tutar and aciklama auto-fill)
  // Backend will find and pay the next installment, but we show it in UI for user confirmation
  const selectedLoan = useMemo(() => {
    if (!isLoanPayment || !selectedLoanId) return null;
    return eligibleLoans.find((l) => l.id === selectedLoanId) || null;
  }, [isLoanPayment, selectedLoanId, eligibleLoans]);
  
  const nextInstallment = useMemo(() => {
    if (!selectedLoan || !selectedLoan.installments) return null;
    const upcoming = selectedLoan.installments.filter(
      (inst) => inst.status === 'BEKLENIYOR' || inst.status === 'GECIKMIS'
    );
    if (upcoming.length === 0) return null;
    // Sort by dueDate to get the earliest one
    return [...upcoming].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  }, [selectedLoan]);

  // Auto-fill tutar and aciklama when loan is selected
  useEffect(() => {
    if (isLoanPayment && nextInstallment && selectedLoanId) {
      // Auto-fill tutar
      setTutarText(formatTlPlain(nextInstallment.totalAmount));
      // Auto-fill aciklama with loan name and installment number
      const loanName = selectedLoan?.name || 'Kredi';
      setAciklama(`${loanName} - Taksit #${nextInstallment.installmentNumber}`);
      setDirty(true);
    }
  }, [isLoanPayment, nextInstallment, selectedLoanId, selectedLoan]);

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
    
    // LOAN PAYMENT FIX: Backend will find next unpaid installment automatically
    // No need to validate or set installmentId here
    
    if (isCardPayment) {
      if (!selectedCard) return;
      setBankaId(selectedCard.bankaId);
    }
    const resolvedBankaId = isCardPayment && selectedCard ? selectedCard.bankaId : bankaId;
    if (!islemTarihiIso || !resolvedBankaId || !islemTuru || tutar <= 0) return;
    // Fix Bug 2: For supplier payments, require supplier selection
    if (islemTuru === 'TEDARIKCI_ODEME' && !muhatapId) {
      alert('Tedarikçi seçmelisiniz.');
      return;
    }
    if (muhatapRequired && !muhatapId && muhatap.trim().length < 3) return;
    if (faturaRequired && !faturaMuhatabi) return;
    if (hedefRequired && !hedefBankaId) return;
    if (isCardPayment && !krediKartiId) return;
    if (isLoanPayment && !selectedLoanId) {
      alert('Kredi seçmelisiniz.');
      return;
    }
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
      `Tutar: ${formatTl(tutar)}`,
      `Açıklama: ${aciklama || '-'}`,
    ].filter(Boolean) as string[];
    if (islemTarihiIso < today) {
      lines.push("UYARI: Geçmiş tarihli bir işlem kaydediyorsunuz. Bu işlem sadece Kasa Defteri'nde görünecektir.");
    }
    if (!window.confirm(lines.join('\n'))) return;
    // Fix Bug 2: Get supplier name for counterparty if supplier is selected
    const selectedSupplier = islemTuru === 'TEDARIKCI_ODEME' && muhatapId 
      ? safeSuppliers.find((s) => s.id === muhatapId) 
      : undefined;
    const finalMuhatap = islemTuru === 'CEK_ODEME'
      ? selectedCheque?.lehtar || undefined
      : islemTuru === 'TEDARIKCI_ODEME' && selectedSupplier
      ? `${selectedSupplier.kod} - ${selectedSupplier.ad}`
      : muhatapRequired || muhatap
      ? muhatap
      : undefined;

    onSaved({
      islemTarihiIso,
      bankaId: resolvedBankaId,
      hedefBankaId: hedefRequired ? hedefBankaId : undefined,
      islemTuru,
      muhatap: finalMuhatap,
      muhatapId: islemTuru === 'TEDARIKCI_ODEME' ? muhatapId : undefined,
      faturaMuhatabi: faturaRequired ? faturaMuhatabi : undefined,
      aciklama: aciklama || undefined,
      tutar,
      kaydedenKullanici: currentUserEmail,
      cekId: islemTuru === 'CEK_ODEME' ? selectedChequeId : null,
      krediKartiId: isCardPayment ? krediKartiId : null,
      loanId: isLoanPayment ? selectedLoanId : null,
      supplierId: islemTuru === 'TEDARIKCI_ODEME' ? muhatapId : null,
    });
    
    // Reset form fields after successful save
    setIslemTarihiIso(todayIso());
    setBankaId('');
    setHedefBankaId('');
    setIslemTuru('VIRMAN');
    setMuhatap('');
    setMuhatapId('');
    setFaturaMuhatabi('ELEKTRIK');
    setAciklama('');
    setTutarText('');
    setDirty(false);
    setSelectedChequeId('');
    setKrediKartiId('');
    setSelectedLoanId('');
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
                setSelectedLoanId('');
                if (next !== 'CEK_ODEME' && next !== 'KREDI_ODEME') setTutarText('');
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
          {/* Fix Bug 2: Supplier dropdown for supplier payments */}
          {islemTuru === 'TEDARIKCI_ODEME' && (
            <div className="space-y-2">
              <label>Tedarikçi <span className="text-rose-600">*</span></label>
              <SearchableSelect
                valueId={muhatapId || null}
                onChange={(id) => {
                  setMuhatapId(id || '');
                  const supplier = safeSuppliers.find((s) => s.id === id);
                  setMuhatap(supplier ? `${supplier.kod} - ${supplier.ad}` : '');
                  setDirty(true);
                }}
                options={supplierOptions}
                placeholder="Tedarikçi seçiniz"
              />
            </div>
          )}
          {isLoanPayment && (
            <>
              <div className="space-y-2">
                <label>Kredi <span className="text-rose-600">*</span></label>
                <select
                  className="w-full"
                  value={selectedLoanId}
                  onChange={(e) => {
                    setSelectedLoanId(e.target.value);
                    setDirty(true);
                  }}
                >
                  <option value="">Seçiniz</option>
                  {eligibleLoans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.name}
                    </option>
                  ))}
                </select>
              </div>
              {nextInstallment && (
                <div className="space-y-2">
                  <label>Ödenecek Taksit</label>
                  <div className="p-3 bg-slate-50 rounded border">
                    <div className="text-sm text-slate-600">Taksit #{nextInstallment.installmentNumber}</div>
                    <div className="text-sm text-slate-600">Vade: {isoToDisplay(nextInstallment.dueDate)}</div>
                    <div className="font-semibold text-lg">Tutar: {formatTl(nextInstallment.totalAmount)}</div>
                  </div>
                </div>
              )}
              {selectedLoanId && !nextInstallment && (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-50 rounded border border-amber-200">
                    <div className="text-sm text-amber-700">Bu kredi için ödenmemiş taksit bulunamadı.</div>
                  </div>
                </div>
              )}
            </>
          )}
          {!isCardPayment && !isLoanPayment && islemTuru !== 'CEK_ODEME' && islemTuru !== 'TEDARIKCI_ODEME' && (
            <div className="space-y-2">
              <label>Muhatap{muhatapRequired ? <span className="text-rose-600"> *</span> : ''}</label>
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
              {loadingPayableCheques ? (
                <div className="text-sm text-gray-500">Yükleniyor...</div>
              ) : (
                <select
                  className="w-full"
                  value={selectedChequeId}
                  onChange={(e) => {
                    setSelectedChequeId(e.target.value);
                    const cek = eligibleCheques.find((c) => c.id === e.target.value);
                    if (cek) {
                      setTutarText(formatTlPlain(cek.tutar));
                      // Auto-fill description with cheque number and supplier name
                      // Use counterparty directly from payableCheques (backend source of truth)
                      const payableCheque = payableCheques.find((pc) => pc.id === e.target.value);
                      const counterparty = payableCheque?.counterparty || (cek as any).counterparty || cek.lehtar || '';
                      // Check if counterparty is the default format (means no supplier/customer)
                      // Backend returns: supplier?.name || customer?.name || `Çek ${cekNo}`
                      const defaultPattern = `Çek ${cek.cekNo}`;
                      const isDefaultCounterparty = counterparty === defaultPattern || counterparty === cek.cekNo || !counterparty;
                      // If counterparty is not default, it's the supplier/customer name
                      const supplierName = !isDefaultCounterparty && counterparty ? ` - ${counterparty}` : '';
                      setAciklama(`Çek No: ${cek.cekNo}${supplierName}`);
                    } else {
                      setAciklama('');
                    }
                    setDirty(true);
                  }}
                >
                  <option value="">Seçiniz</option>
                  {(eligibleCheques ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {`${c.cekNo} - ${c.vadeTarihi ? isoToDisplay(c.vadeTarihi) : ''} - ${formatTl(c.tutar)} - ${c.lehtar || c.cekNo}`}
                    </option>
                  ))}
                </select>
              )}
              {!loadingPayableCheques && eligibleCheques.length === 0 && bankaId && (
                <div className="text-sm text-gray-500">Ödenecek çek bulunamadı</div>
              )}
              {!loadingPayableCheques && !bankaId && (
                <div className="text-sm text-amber-600">Önce kaynak banka seçiniz</div>
              )}
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
