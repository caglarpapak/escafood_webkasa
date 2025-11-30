import { useEffect, useMemo, useState } from 'react';
import FormRow from '../components/FormRow';
import DateInput from '../components/DateInput';
import MoneyInput from '../components/MoneyInput';
import SearchableSelect from '../components/SearchableSelect';
import { BankMaster } from '../models/bank';
import { Cheque, ChequeStatus } from '../models/cheque';
import { Customer } from '../models/customer';
import { DailyTransaction } from '../models/transaction';
import { Supplier } from '../models/supplier';
import { isoToDisplay, todayIso } from '../utils/date';
import { generateId } from '../utils/id';
import { formatTl } from '../utils/money';

export interface CekIslemPayload {
  updatedCheques: Cheque[];
  transaction?: DailyTransaction;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (payload: CekIslemPayload) => void;
  cheques: Cheque[];
  customers: Customer[];
  suppliers: Supplier[];
  banks: BankMaster[];
  currentUserEmail: string;
  initialTab: 'GIRIS' | 'CIKIS' | 'YENI' | 'RAPOR';
}

type CikisReason =
  | 'TAHSIL_ELDEN'
  | 'TAHSIL_BANKADAN'
  | 'TEDARIKCI_VERILDI'
  | 'YAZILDI'
  | 'IADE'
  | 'DIGER';

type ReportSortKey = 'vadeTarihi' | 'tutar';

type QuickStatusFilter = ChequeStatus[];

const bankNameOptions = [
  'Akbank T.A.Ş.',
  'Burgan Bank A.Ş.',
  'DenizBank A.Ş.',
  'Fibabanka A.Ş.',
  'Garanti BBVA A.Ş.',
  'HSBC Bank A.Ş.',
  'ING Bank A.Ş.',
  'İstanbul Takas ve Saklama Bankası A.Ş.',
  'İller Bankası A.Ş.',
  'QNB Finansbank A.Ş.',
  'Şekerbank T.A.Ş.',
  'T.C. Ziraat Bankası A.Ş.',
  'TEB – Türk Ekonomi Bankası A.Ş.',
  'Türkiye Halk Bankası A.Ş.',
  'Türkiye İş Bankası A.Ş.',
  'Türkiye Kalkınma ve Yatırım Bankası A.Ş.',
  'Türkiye Sınai Kalkınma Bankası A.Ş. (TSKB)',
  'Türk Eximbank',
  'VakıfBank T.A.O.',
  'Yapı ve Kredi Bankası A.Ş.',
  'Diğer Banka',
];

const reasonLabels: Record<CikisReason, string> = {
  TAHSIL_ELDEN: 'Tahsil elden',
  TAHSIL_BANKADAN: 'Tahsil bankadan',
  TEDARIKCI_VERILDI: 'Tedarikçiye verildi',
  YAZILDI: 'Yazıldı',
  IADE: 'İade (İptal)',
  DIGER: 'Diğer',
};

export default function CekIslemleriModal({
  isOpen,
  onClose,
  onSaved,
  cheques,
  customers,
  suppliers,
  banks,
  currentUserEmail,
  initialTab,
}: Props) {
  const [activeTab, setActiveTab] = useState<Props['initialTab']>(initialTab);
  const [dirty, setDirty] = useState(false);

  const [girisCustomerId, setGirisCustomerId] = useState('');
  const [girisDuzenleyen, setGirisDuzenleyen] = useState('');
  const [girisLehtar, setGirisLehtar] = useState('Esca Food AŞ');
  const [girisBankaAdi, setGirisBankaAdi] = useState('');
  const [girisCekNo, setGirisCekNo] = useState('');
  const [girisTutar, setGirisTutar] = useState<number | null>(null);
  const [girisVadeTarihi, setGirisVadeTarihi] = useState(todayIso());
  const [girisAciklama, setGirisAciklama] = useState('');
  const [girisCekImage, setGirisCekImage] = useState<string | null>(null);

  const [cikisIslemTarihi, setCikisIslemTarihi] = useState(todayIso());
  const [cikisSelectedChequeId, setCikisSelectedChequeId] = useState('');
  const [cikisReason, setCikisReason] = useState<CikisReason>('TAHSIL_ELDEN');
  const [cikisTahsilBankasiId, setCikisTahsilBankasiId] = useState('');
  const [cikisSupplierId, setCikisSupplierId] = useState('');
  const [cikisAciklama, setCikisAciklama] = useState('');

  const [yeniSupplierId, setYeniSupplierId] = useState('');
  const [yeniBankId, setYeniBankId] = useState('');
  const [yeniDuzenleyen, setYeniDuzenleyen] = useState('Esca Food AŞ');
  const [yeniLehtar, setYeniLehtar] = useState('');
  const [yeniCekNo, setYeniCekNo] = useState('');
  const [yeniTutar, setYeniTutar] = useState<number | null>(null);
  const [yeniVadeTarihi, setYeniVadeTarihi] = useState(todayIso());
  const [yeniAciklama, setYeniAciklama] = useState('');
  const [yeniCekImage, setYeniCekImage] = useState<string | null>(null);

  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  const [reportStatuses, setReportStatuses] = useState<QuickStatusFilter>([
    'KASADA',
    'BANKADA_TAHSILDE',
    'ODEMEDE',
    'TAHSIL_OLDU',
    'ODEME_YAPILDI',
    'KARSILIKSIZ',
    'IPTAL',
    'CIKMIS',
  ]);
  const [reportMusteriId, setReportMusteriId] = useState('');
  const [reportTedarikciId, setReportTedarikciId] = useState('');
  const [reportSortKey, setReportSortKey] = useState<ReportSortKey>('vadeTarihi');
  const [reportSortDir, setReportSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setDirty(false);
      setGirisCustomerId('');
      setGirisDuzenleyen('');
      setGirisLehtar('Esca Food AŞ');
      setGirisBankaAdi('');
      setGirisCekNo('');
      setGirisTutar(null);
      setGirisVadeTarihi(todayIso());
      setGirisAciklama('');
      setGirisCekImage(null);

      setCikisIslemTarihi(todayIso());
      setCikisSelectedChequeId('');
      setCikisReason('TAHSIL_ELDEN');
      setCikisTahsilBankasiId('');
      setCikisSupplierId('');
      setCikisAciklama('');

      setYeniSupplierId('');
      setYeniBankId('');
      setYeniDuzenleyen('Esca Food AŞ');
      setYeniLehtar('');
      setYeniCekNo('');
      setYeniTutar(null);
      setYeniVadeTarihi(todayIso());
      setYeniAciklama('');
      setYeniCekImage(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (girisCustomerId) {
      const found = customers.find((c) => c.id === girisCustomerId);
      if (found) setGirisDuzenleyen(found.ad);
    }
  }, [girisCustomerId, customers]);

  useEffect(() => {
    if (yeniSupplierId) {
      const found = suppliers.find((s) => s.id === yeniSupplierId);
      if (found) setYeniLehtar(found.ad);
    }
  }, [yeniSupplierId, suppliers]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const customerOptions = customers.map((c) => ({ id: c.id, label: `${c.kod} - ${c.ad}` }));
  const supplierOptions = suppliers.map((s) => ({ id: s.id, label: `${s.kod} - ${s.ad}` }));

  const cikisEligibleCheques = useMemo(() => {
    return [...cheques.filter((c) => c.status === 'KASADA')].sort((a, b) => a.vadeTarihi.localeCompare(b.vadeTarihi));
  }, [cheques]);

  const reportRows = useMemo(() => {
    const base = cheques
      .filter((c) => (reportStart ? c.vadeTarihi >= reportStart : true))
      .filter((c) => (reportEnd ? c.vadeTarihi <= reportEnd : true))
      .filter((c) => reportStatuses.includes(c.status))
      .filter((c) => (reportMusteriId ? c.musteriId === reportMusteriId : true))
      .filter((c) => (reportTedarikciId ? c.tedarikciId === reportTedarikciId : true));

    const sorted = [...base].sort((a, b) => {
      const dir = reportSortDir === 'asc' ? 1 : -1;
      if (reportSortKey === 'vadeTarihi') {
        return a.vadeTarihi.localeCompare(b.vadeTarihi) * dir;
      }
      return (a.tutar - b.tutar) * dir;
    });
    return sorted;
  }, [
    cheques,
    reportEnd,
    reportMusteriId,
    reportSortDir,
    reportSortKey,
    reportStart,
    reportStatuses,
    reportTedarikciId,
  ]);

  const statusLabel = (status: ChequeStatus) => {
    switch (status) {
      case 'KASADA':
        return 'Kasada';
      case 'BANKADA_TAHSILDE':
        return 'Bankada (Tahsilde)';
      case 'TAHSIL_OLDU':
        return 'Tahsil Oldu';
      case 'ODEMEDE':
        return 'Ödemede / Dolaşımda';
      case 'ODEME_YAPILDI':
        return 'Ödeme Yapıldı';
      case 'KARSILIKSIZ':
        return 'Karşılıksız';
      case 'IPTAL':
        return 'İptal';
      case 'CIKMIS':
      default:
        return 'Çıkmış';
    }
  };

  const getKonum = (c: Cheque) => {
    if (c.kasaMi) return 'Kasada';
    if (c.status === 'BANKADA_TAHSILDE') return 'Bankada';
    return 'Dolaşımda';
  };

  const handleGirisImageChange = (file?: File | null) => {
    if (!file) {
      setGirisCekImage(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setGirisCekImage(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
    setDirty(true);
  };

  const handleYeniImageChange = (file?: File | null) => {
    if (!file) {
      setYeniCekImage(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setYeniCekImage(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
    setDirty(true);
  };

  const handleSaveGiris = () => {
    if (!girisCustomerId || !girisCekNo || !girisBankaAdi || !girisTutar || girisTutar <= 0 || !girisVadeTarihi) return;
    if (!girisCekImage) {
      alert('Çek görseli eklenmeden bu işlem kaydedilemez.');
      return;
    }
    const newCheque: Cheque = {
      id: generateId(),
      cekNo: girisCekNo,
      bankaAdi: girisBankaAdi,
      tutar: girisTutar,
      vadeTarihi: girisVadeTarihi,
      duzenleyen: girisDuzenleyen || customers.find((c) => c.id === girisCustomerId)?.ad || '',
      lehtar: girisLehtar || 'Esca Food AŞ',
      musteriId: girisCustomerId,
      status: 'KASADA',
      kasaMi: true,
      aciklama: girisAciklama || undefined,
      imageUrl: girisCekImage || undefined,
    };
    onSaved({ updatedCheques: [...cheques, newCheque] });
  };

  const handleSaveCikis = () => {
    const selectedCheque = cikisEligibleCheques.find((c) => c.id === cikisSelectedChequeId);
    if (!selectedCheque) return;
    if (cikisReason === 'TAHSIL_BANKADAN' && !cikisTahsilBankasiId) return;
    if (cikisReason === 'TEDARIKCI_VERILDI' && !cikisSupplierId) return;

    let newStatus: ChequeStatus = 'CIKMIS';
    switch (cikisReason) {
      case 'TAHSIL_ELDEN':
        newStatus = 'TAHSIL_OLDU';
        break;
      case 'TAHSIL_BANKADAN':
        newStatus = 'BANKADA_TAHSILDE';
        break;
      case 'TEDARIKCI_VERILDI':
        newStatus = 'ODEMEDE';
        break;
      case 'YAZILDI':
        newStatus = 'KARSILIKSIZ';
        break;
      case 'IADE':
        newStatus = 'IPTAL';
        break;
      case 'DIGER':
      default:
        newStatus = 'CIKMIS';
        break;
    }

    const tahsilBank = cikisReason === 'TAHSIL_BANKADAN' ? banks.find((b) => b.id === cikisTahsilBankasiId) : undefined;
    const tedarikci = cikisReason === 'TEDARIKCI_VERILDI' ? suppliers.find((s) => s.id === cikisSupplierId) : undefined;

    const updatedCheques = cheques.map((c) => {
      if (c.id !== selectedCheque.id) return c;
      return {
        ...c,
        status: newStatus,
        kasaMi: false,
        tedarikciId: tedarikci ? tedarikci.id : c.tedarikciId,
        bankaId: tahsilBank ? tahsilBank.id : c.bankaId,
        bankaAdi: tahsilBank ? tahsilBank.hesapAdi || tahsilBank.bankaAdi : c.bankaAdi,
        aciklama: cikisAciklama || c.aciklama,
      };
    });

    const nowIso = new Date().toISOString();
    const description = `Çek No: ${selectedCheque.cekNo}${cikisAciklama ? ` – ${cikisAciklama}` : ''}`;
    let tx: DailyTransaction | undefined;

    if (cikisReason === 'TAHSIL_ELDEN') {
      tx = {
        id: generateId(),
        isoDate: cikisIslemTarihi,
        displayDate: isoToDisplay(cikisIslemTarihi),
        documentNo: `CEK-${selectedCheque.cekNo}`,
        type: 'Kasadan Çek Çıkışı',
        source: 'TAHSIL_ELDEN',
        counterparty: 'Tahsil Elden',
        description,
        incoming: selectedCheque.tutar,
        outgoing: 0,
        balanceAfter: 0,
        displayIncoming: selectedCheque.tutar,
        createdAtIso: nowIso,
        createdBy: currentUserEmail,
      };
    } else if (cikisReason === 'TAHSIL_BANKADAN' && tahsilBank) {
      tx = {
        id: generateId(),
        isoDate: cikisIslemTarihi,
        displayDate: isoToDisplay(cikisIslemTarihi),
        documentNo: `CEK-${selectedCheque.cekNo}`,
        type: 'Kasadan Çek Çıkışı - Tahsil Bankadan',
        source: 'TAHSIL_BANKADAN',
        counterparty: tahsilBank.hesapAdi || tahsilBank.bankaAdi || 'Banka',
        description,
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0,
        bankId: tahsilBank.id,
        bankDelta: selectedCheque.tutar,
        displayIncoming: selectedCheque.tutar,
        createdAtIso: nowIso,
        createdBy: currentUserEmail,
      };
    } else if (cikisReason === 'TEDARIKCI_VERILDI') {
      tx = {
        id: generateId(),
        isoDate: cikisIslemTarihi,
        displayDate: isoToDisplay(cikisIslemTarihi),
        documentNo: `CEK-${selectedCheque.cekNo}`,
        type: 'Kasadan Çek Çıkışı',
        source: 'TEDARIKCIYE_VERILDI',
        counterparty: tedarikci ? `${tedarikci.kod} - ${tedarikci.ad}` : 'Tedarikçi',
        description,
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0,
        createdAtIso: nowIso,
        createdBy: currentUserEmail,
      };
    } else if (cikisReason === 'YAZILDI') {
      tx = {
        id: generateId(),
        isoDate: cikisIslemTarihi,
        displayDate: isoToDisplay(cikisIslemTarihi),
        documentNo: `CEK-${selectedCheque.cekNo}`,
        type: 'Kasadan Çek Çıkışı',
        source: 'YAZILDI',
        counterparty: 'Karşılıksız',
        description,
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0,
        createdAtIso: nowIso,
        createdBy: currentUserEmail,
      };
    } else if (cikisReason === 'IADE') {
      tx = {
        id: generateId(),
        isoDate: cikisIslemTarihi,
        displayDate: isoToDisplay(cikisIslemTarihi),
        documentNo: `CEK-${selectedCheque.cekNo}`,
        type: 'Kasadan Çek Çıkışı',
        source: 'IADE',
        counterparty: 'İade',
        description,
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0,
        createdAtIso: nowIso,
        createdBy: currentUserEmail,
      };
    } else if (cikisReason === 'DIGER') {
      tx = {
        id: generateId(),
        isoDate: cikisIslemTarihi,
        displayDate: isoToDisplay(cikisIslemTarihi),
        documentNo: `CEK-${selectedCheque.cekNo}`,
        type: 'Kasadan Çek Çıkışı',
        source: 'DIGER',
        counterparty: 'Diğer',
        description,
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0,
        createdAtIso: nowIso,
        createdBy: currentUserEmail,
      };
    }

    onSaved({ updatedCheques, transaction: tx });
  };

  const handleSaveYeni = () => {
    const bank = banks.find((b) => b.id === yeniBankId && b.cekKarnesiVarMi);
    const supplier = suppliers.find((s) => s.id === yeniSupplierId);
    if (!bank || !supplier || !yeniCekNo || !yeniTutar || yeniTutar <= 0 || !yeniVadeTarihi) return;
    if (!yeniCekImage) {
      alert('Çek görseli eklenmeden bu işlem kaydedilemez.');
      return;
    }
    const newCheque: Cheque = {
      id: generateId(),
      cekNo: yeniCekNo,
      bankaId: bank.id,
      bankaAdi: bank.bankaAdi || bank.hesapAdi,
      tutar: yeniTutar,
      vadeTarihi: yeniVadeTarihi,
      duzenleyen: yeniDuzenleyen,
      lehtar: yeniLehtar || supplier.ad,
      tedarikciId: supplier.id,
      status: 'ODEMEDE',
      kasaMi: false,
      aciklama: yeniAciklama || undefined,
      imageUrl: yeniCekImage || undefined,
    };
    onSaved({ updatedCheques: [...cheques, newCheque] });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Çek İşlemleri</div>
          <button onClick={handleClose}>✕</button>
        </div>

        <div className="flex space-x-2 mb-4 text-sm">
          {[
            { key: 'GIRIS', label: 'Kasaya Çek Girişi' },
            { key: 'CIKIS', label: 'Kasadan Çek Çıkışı' },
            { key: 'YENI', label: 'Yeni Düzenlenen Çek' },
            { key: 'RAPOR', label: 'Tüm Çekler Raporu' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`px-3 py-2 rounded-lg border ${
                activeTab === tab.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700'
              }`}
              onClick={() => setActiveTab(tab.key as Props['initialTab'])}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'GIRIS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormRow label="Müşteri" required>
                <SearchableSelect
                  valueId={girisCustomerId || null}
                  onChange={(id) => {
                    setGirisCustomerId(id || '');
                    setDirty(true);
                  }}
                  options={customerOptions}
                  placeholder="Müşteri seçin"
                />
              </FormRow>
              <FormRow label="Düzenleyen" required>
                <input
                  className="form-input"
                  value={girisDuzenleyen}
                  onChange={(e) => {
                    setGirisDuzenleyen(e.target.value);
                    setDirty(true);
                  }}
                />
              </FormRow>
              <FormRow label="Lehtar" required>
                <input
                  className="form-input"
                  value={girisLehtar}
                  onChange={(e) => {
                    setGirisLehtar(e.target.value);
                    setDirty(true);
                  }}
                />
              </FormRow>
              <FormRow label="Banka" required>
                <select
                  className="form-input w-full truncate"
                  value={girisBankaAdi}
                  onChange={(e) => {
                    setGirisBankaAdi(e.target.value);
                    setDirty(true);
                  }}
                >
                  <option value="">Seçiniz</option>
                  {bankNameOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </FormRow>
              <FormRow label="Çek No" required>
                <input
                  className="form-input"
                  value={girisCekNo}
                  onChange={(e) => {
                    setGirisCekNo(e.target.value);
                    setDirty(true);
                  }}
                />
              </FormRow>
              <FormRow label="Tutar" required>
                <MoneyInput
                  className="form-input"
                  value={girisTutar}
                  onChange={(v) => {
                    setGirisTutar(v);
                    setDirty(true);
                  }}
                  placeholder="0,00"
                />
              </FormRow>
              <FormRow label="Vade Tarihi" required>
                <DateInput
                  value={girisVadeTarihi}
                  onChange={(v) => {
                    setGirisVadeTarihi(v);
                    setDirty(true);
                  }}
                />
              </FormRow>
              <div className="md:col-span-2 flex flex-col w-full">
                <label className="block break-words mb-1 text-sm font-medium">Çek Görseli *</label>
                <input
                  className="form-input w-full"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleGirisImageChange(e.target.files?.[0])}
                />
              </div>
              <FormRow label="Açıklama">
                <input
                  className="form-input"
                  value={girisAciklama}
                  onChange={(e) => {
                    setGirisAciklama(e.target.value);
                    setDirty(true);
                  }}
                  maxLength={100}
                />
              </FormRow>
            </div>
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 bg-slate-200 rounded-lg" onClick={handleClose}>
                İptal
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg" onClick={handleSaveGiris}>
                Kaydet
              </button>
            </div>
          </div>
        )}

        {activeTab === 'CIKIS' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormRow label="İşlem Tarihi" required>
                <DateInput
                  value={cikisIslemTarihi}
                  onChange={(v) => {
                    setCikisIslemTarihi(v);
                    setDirty(true);
                  }}
                />
              </FormRow>
              <FormRow label="Çek Seçimi" required>
                <select
                  className="form-input"
                  value={cikisSelectedChequeId}
                  onChange={(e) => {
                    setCikisSelectedChequeId(e.target.value);
                    setDirty(true);
                  }}
                >
                  <option value="">Seçiniz</option>
                  {cikisEligibleCheques.map((c) => {
                    const counter = (c.duzenleyen || c.lehtar || '-').slice(0, 10);
                    return (
                      <option key={c.id} value={c.id}>
                        {`${c.cekNo} – ${counter} – ${formatTl(c.tutar)}`}
                      </option>
                    );
                  })}
                </select>
              </FormRow>
              <FormRow label="Çıkış Nedeni" required>
                <select
                  className="form-input"
                  value={cikisReason}
                  onChange={(e) => {
                    setCikisReason(e.target.value as CikisReason);
                    setDirty(true);
                  }}
                >
                  {Object.entries(reasonLabels).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </FormRow>
              {cikisReason === 'TAHSIL_BANKADAN' && (
                <FormRow label="Tahsil Bankası" required>
                  <select
                    className="form-input w-full truncate"
                    value={cikisTahsilBankasiId}
                    onChange={(e) => {
                      setCikisTahsilBankasiId(e.target.value);
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
              {cikisReason === 'TEDARIKCI_VERILDI' && (
                <FormRow label="Tedarikçi" required>
                  <SearchableSelect
                    valueId={cikisSupplierId || null}
                    onChange={(id) => {
                      setCikisSupplierId(id || '');
                      setDirty(true);
                    }}
                    options={supplierOptions}
                    placeholder="Tedarikçi"
                  />
                </FormRow>
              )}
              <FormRow label="Açıklama">
                <textarea
                  className="form-input"
                  value={cikisAciklama}
                  onChange={(e) => {
                    setCikisAciklama(e.target.value);
                    setDirty(true);
                  }}
                  maxLength={150}
                />
              </FormRow>
            </div>
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 bg-slate-200 rounded-lg" onClick={handleClose}>
                İptal
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg" onClick={handleSaveCikis}>
                Kaydet
              </button>
            </div>
          </div>
        )}

        {activeTab === 'YENI' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormRow label="Tedarikçi" required>
                <SearchableSelect
                  valueId={yeniSupplierId || null}
                  onChange={(id) => {
                    setYeniSupplierId(id || '');
                    setDirty(true);
                  }}
                  options={supplierOptions}
                  placeholder="Tedarikçi"
                />
              </FormRow>
              <FormRow label="Banka" required>
                <select
                  className="form-input w-full truncate"
                  value={yeniBankId}
                  onChange={(e) => {
                    setYeniBankId(e.target.value);
                    setDirty(true);
                  }}
                >
                  <option value="">Seçiniz</option>
                  {banks
                    .filter((b) => b.cekKarnesiVarMi)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.hesapAdi}
                      </option>
                    ))}
                </select>
              </FormRow>
              <FormRow label="Düzenleyen" required>
                <input
                  className="form-input"
                  value={yeniDuzenleyen}
                  onChange={(e) => {
                    setYeniDuzenleyen(e.target.value);
                    setDirty(true);
                  }}
                />
              </FormRow>
              <FormRow label="Lehtar" required>
                <input
                  className="form-input"
                  value={yeniLehtar}
                  onChange={(e) => {
                    setYeniLehtar(e.target.value);
                    setDirty(true);
                  }}
                />
              </FormRow>
              <FormRow label="Çek No" required>
                <input
                  className="form-input"
                  value={yeniCekNo}
                  onChange={(e) => {
                    setYeniCekNo(e.target.value);
                    setDirty(true);
                  }}
                />
              </FormRow>
              <FormRow label="Tutar" required>
                <MoneyInput
                  className="form-input"
                  value={yeniTutar}
                  onChange={(v) => {
                    setYeniTutar(v);
                    setDirty(true);
                  }}
                  placeholder="0,00"
                />
              </FormRow>
              <FormRow label="Vade Tarihi" required>
                <DateInput
                  value={yeniVadeTarihi}
                  onChange={(v) => {
                    setYeniVadeTarihi(v);
                    setDirty(true);
                  }}
                />
              </FormRow>
              <div className="md:col-span-2 flex flex-col w-full">
                <label className="block break-words mb-1 text-sm font-medium">Çek Görseli *</label>
                <input
                  className="form-input w-full"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleYeniImageChange(e.target.files?.[0])}
                />
              </div>
              <FormRow label="Açıklama">
                <input
                  className="form-input"
                  value={yeniAciklama}
                  onChange={(e) => {
                    setYeniAciklama(e.target.value);
                    setDirty(true);
                  }}
                  maxLength={100}
                />
              </FormRow>
            </div>
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 bg-slate-200 rounded-lg" onClick={handleClose}>
                İptal
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg" onClick={handleSaveYeni}>
                Kaydet
              </button>
            </div>
          </div>
        )}

        {activeTab === 'RAPOR' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormRow label="Vade Başlangıç">
                <DateInput value={reportStart} onChange={(v) => setReportStart(v)} />
              </FormRow>
              <FormRow label="Vade Bitiş">
                <DateInput value={reportEnd} onChange={(v) => setReportEnd(v)} />
              </FormRow>
              <FormRow label="Müşteri">
                <SearchableSelect
                  valueId={reportMusteriId || null}
                  onChange={(id) => setReportMusteriId(id || '')}
                  options={customerOptions}
                  placeholder="Müşteri"
                />
              </FormRow>
              <FormRow label="Tedarikçi">
                <SearchableSelect
                  valueId={reportTedarikciId || null}
                  onChange={(id) => setReportTedarikciId(id || '')}
                  options={supplierOptions}
                  placeholder="Tedarikçi"
                />
              </FormRow>
              <FormRow label="Durumlar">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      'KASADA',
                      'BANKADA_TAHSILDE',
                      'ODEMEDE',
                      'TAHSIL_OLDU',
                      'ODEME_YAPILDI',
                      'KARSILIKSIZ',
                      'IPTAL',
                      'CIKMIS',
                    ] as ChequeStatus[]
                  ).map((s) => (
                    <label key={s} className="flex items-center space-x-1 text-xs">
                      <input
                        type="checkbox"
                        checked={reportStatuses.includes(s)}
                        onChange={(e) =>
                          setReportStatuses((prev) =>
                            e.target.checked ? [...prev, s] : prev.filter((x) => x !== s)
                          )
                        }
                      />
                      <span>{statusLabel(s)}</span>
                    </label>
                  ))}
                </div>
              </FormRow>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="py-2 px-2 text-left">Çek No</th>
                    <th className="py-2 px-2 text-left">Banka</th>
                    <th className="py-2 px-2 text-left">Düzenleyen</th>
                    <th className="py-2 px-2 text-left">Lehtar</th>
                    <th
                      className="py-2 px-2 text-left cursor-pointer"
                      onClick={() => {
                        setReportSortKey('vadeTarihi');
                        setReportSortDir((prev) => (reportSortKey === 'vadeTarihi' && prev === 'asc' ? 'desc' : 'asc'));
                      }}
                    >
                      Vade Tarihi
                    </th>
                    <th
                      className="py-2 px-2 text-left cursor-pointer"
                      onClick={() => {
                        setReportSortKey('tutar');
                        setReportSortDir((prev) => (reportSortKey === 'tutar' && prev === 'asc' ? 'desc' : 'asc'));
                      }}
                    >
                      Tutar
                    </th>
                    <th className="py-2 px-2 text-left">Durum</th>
                    <th className="py-2 px-2 text-left">Konum</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-3 text-center text-slate-500">
                        Kayıt yok.
                      </td>
                    </tr>
                  )}
                  {reportRows.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="py-2 px-2">{c.cekNo}</td>
                      <td className="py-2 px-2">{c.bankaAdi || '-'}</td>
                      <td className="py-2 px-2">{c.duzenleyen}</td>
                      <td className="py-2 px-2">{c.lehtar}</td>
                      <td className="py-2 px-2">{isoToDisplay(c.vadeTarihi)}</td>
                      <td className="py-2 px-2">{formatTl(c.tutar)}</td>
                      <td className="py-2 px-2">{statusLabel(c.status)}</td>
                      <td className="py-2 px-2">{getKonum(c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
