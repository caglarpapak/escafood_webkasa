import React, { useEffect, useMemo, useState } from 'react';
import { BankMaster } from '../models/bank';
import { Customer } from '../models/customer';
import { Supplier } from '../models/supplier';
import { CreditCard } from '../models/card';
import { Loan } from '../models/loan';
import { PosTerminal } from '../models/pos';
import { GlobalSettings } from '../models/settings';
import { apiDelete, apiGet, apiPost, apiPut } from '../utils/api';
import { generateId } from '../utils/id';
import FormRow from '../components/FormRow';

export type SettingsTabKey =
  | 'BANKALAR'
  | 'POS'
  | 'MUSTERI'
  | 'TEDARIKCI'
  | 'KREDI_KARTI'
  | 'KREDILER'
  | 'GLOBAL';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeTab: SettingsTabKey;
  onChangeTab: (tab: SettingsTabKey) => void;
  banks: BankMaster[];
  setBanks: (banks: BankMaster[]) => void;
  posTerminals: PosTerminal[];
  setPosTerminals: (terminals: PosTerminal[]) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  suppliers: Supplier[];
  setSuppliers: (suppliers: Supplier[]) => void;
  creditCards: CreditCard[];
  setCreditCards: (cards: CreditCard[]) => void;
  loans: Loan[];
  setLoans: (loans: Loan[]) => void;
  globalSettings: GlobalSettings;
  setGlobalSettings: (settings: GlobalSettings) => void;
}

type BankFlagMap = Record<
  string,
  {
    cekKarnesiVarMi?: boolean;
    posVarMi?: boolean;
    krediKartiVarMi?: boolean;
  }
>;

const BANK_FLAGS_STORAGE_KEY = 'esca-webkasa-bank-flags';
const CSV_DELIMITER = ';';

function loadBankFlagsFromStorage(): BankFlagMap {
  try {
    const raw = localStorage.getItem(BANK_FLAGS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as BankFlagMap;
  } catch {
    return {};
  }
}

function saveBankFlagsToStorage(flags: BankFlagMap) {
  try {
    localStorage.setItem(BANK_FLAGS_STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // Cache hatası uygulamayı bozmamalı
  }
}

function nextCode(items: { kod: string }[], prefix: string) {
  const max = items.reduce((acc, item) => {
    const num = parseInt(item.kod.replace(`${prefix}-`, ''), 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  const next = String(max + 1).padStart(4, '0');
  return `${prefix}-${next}`;
}

const AyarlarModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  banks,
  setBanks,
  posTerminals,
  setPosTerminals,
  customers,
  setCustomers,
  suppliers,
  setSuppliers,
  creditCards,
  setCreditCards,
  loans,
  setLoans,
  globalSettings,
  setGlobalSettings,
}) => {
  // ===== State Management =====
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Local state for editing
  const [localBanks, setLocalBanks] = useState<BankMaster[]>([]);
  const [localCreditCards, setLocalCreditCards] = useState<CreditCard[]>([]);
  const [localLoans, setLocalLoans] = useState<Loan[]>([]);
  const [globalForm, setGlobalForm] = useState<GlobalSettings>(globalSettings);
  const [bankFlags, setBankFlags] = useState<BankFlagMap>({});

  // Tab-specific form states
  const [posEditingId, setPosEditingId] = useState<string | null>(null);
  const [posForm, setPosForm] = useState({ bankaId: '', posAdi: '', komisyonOrani: 0.02, aktifMi: true });

  const [customerEditingId, setCustomerEditingId] = useState<string | null>(null);
  const [customerForm, setCustomerForm] = useState<{ kod: string; ad: string; aktifMi: boolean }>({
    kod: '',
    ad: '',
    aktifMi: true,
  });

  const [supplierEditingId, setSupplierEditingId] = useState<string | null>(null);
  const [supplierForm, setSupplierForm] = useState<{ kod: string; ad: string; aktifMi: boolean }>({
    kod: '',
    ad: '',
    aktifMi: true,
  });

  // ===== Effects =====
  // Sync tab forms with selected items
  useEffect(() => {
    if (posEditingId) {
      const p = posTerminals.find((x) => x.id === posEditingId);
      if (p) setPosForm({ bankaId: p.bankaId, posAdi: p.posAdi, komisyonOrani: p.komisyonOrani, aktifMi: p.aktifMi });
    } else {
      setPosForm({ bankaId: '', posAdi: '', komisyonOrani: 0.02, aktifMi: true });
    }
  }, [posEditingId, posTerminals]);

  useEffect(() => {
    if (customerEditingId) {
      const cust = customers.find((c) => c.id === customerEditingId);
      if (cust) setCustomerForm({ kod: cust.kod, ad: cust.ad, aktifMi: cust.aktifMi });
    } else {
      setCustomerForm({ kod: nextCode(customers, 'MUST'), ad: '', aktifMi: true });
    }
  }, [customerEditingId, customers]);

  useEffect(() => {
    if (supplierEditingId) {
      const sup = suppliers.find((s) => s.id === supplierEditingId);
      if (sup) setSupplierForm({ kod: sup.kod, ad: sup.ad, aktifMi: sup.aktifMi });
    } else {
      setSupplierForm({ kod: nextCode(suppliers, 'TDRK'), ad: '', aktifMi: true });
    }
  }, [supplierEditingId, suppliers]);

  // Fetch data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchAll = async () => {
      setLoading(true);
      setDirty(false);

      try {
        const [backendBanks, backendCards, backendLoans] = await Promise.all([
          apiGet<
            Array<{
              id: string;
              name: string;
              accountNo: string | null;
              iban: string | null;
              isActive: boolean;
              currentBalance: number;
            }>
          >('/api/banks'),
          apiGet<
            Array<{
              id: string;
              name: string;
              bankId: string | null;
              limit: number | null;
              closingDay: number | null;
              dueDay: number | null;
              isActive: boolean;
              currentDebt: number;
              availableLimit: number | null;
              lastOperationDate: string | null;
              bank?: { id: string; name: string } | null;
            }>
          >('/api/credit-cards'),
          apiGet<Loan[]>('/api/loans'),
        ]);

        const flagsFromStorage = loadBankFlagsFromStorage();

        // Map banks
        const mappedBanks: BankMaster[] = backendBanks.map((b) => {
          const flags = flagsFromStorage[b.id] || { cekKarnesiVarMi: false, posVarMi: false, krediKartiVarMi: false };
          return {
            id: b.id,
            bankaAdi: b.name,
            kodu: b.accountNo ? b.accountNo.substring(0, 4).toUpperCase() : 'BNK',
            hesapAdi: b.name + (b.accountNo ? ` - ${b.accountNo}` : ''),
            iban: b.iban || undefined,
            acilisBakiyesi: b.currentBalance,
            aktifMi: b.isActive,
            cekKarnesiVarMi: flags.cekKarnesiVarMi ?? false,
            posVarMi: flags.posVarMi ?? false,
            krediKartiVarMi: flags.krediKartiVarMi ?? false,
          };
        });

        // Map credit cards with localStorage extras
        const cardExtrasKey = 'esca-webkasa-card-extras';
        const savedExtras = localStorage.getItem(cardExtrasKey);
        const cardExtras: Record<string, { sonEkstreBorcu: number; asgariOran: number; maskeliKartNo: string }> =
          savedExtras ? JSON.parse(savedExtras) : {};

        const mappedCards: CreditCard[] = backendCards.map((c) => {
          const limit = c.limit;
          const availableLimit = c.availableLimit;
          const extras = cardExtras[c.id] || { sonEkstreBorcu: 0, asgariOran: 0.4, maskeliKartNo: '' };

          return {
            id: c.id,
            bankaId: c.bankId || '',
            kartAdi: c.name,
            kartLimit: limit,
            limit: limit,
            kullanilabilirLimit: availableLimit,
            asgariOran: extras.asgariOran,
            hesapKesimGunu: c.closingDay ?? 1,
            sonOdemeGunu: c.dueDay ?? 1,
            maskeliKartNo: extras.maskeliKartNo,
            aktifMi: c.isActive,
            sonEkstreBorcu: extras.sonEkstreBorcu,
            guncelBorc: c.currentDebt,
          };
        });

        setLocalBanks(mappedBanks);
        setLocalCustomers(customers);
        setLocalSuppliers(suppliers);
        setLocalCreditCards(mappedCards);
        setLocalLoans(backendLoans);
        setBankFlags(flagsFromStorage);
        setGlobalForm(globalSettings);

        // Update parent state
        setBanks(mappedBanks);
        setCreditCards(mappedCards);
        setLoans(backendLoans);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isOpen, setBanks, setCreditCards, setLoans, customers, suppliers, globalSettings]);

  // ===== Handlers =====
  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş değişiklikler var. Kapatılsın mı?')) {
      return;
    }
    onClose();
  };

  // Bank handlers
  const handleBankFieldChange = (bankId: string, field: keyof BankMaster, value: string | number | boolean) => {
    setDirty(true);
    setLocalBanks((prev) => prev.map((b) => (b.id === bankId ? { ...b, [field]: value } : b)));
  };

  const handleBankFlagChange = (bankId: string, field: keyof BankFlagMap[string], value: boolean) => {
    setDirty(true);
    setBankFlags((prev) => {
      const updated: BankFlagMap = {
        ...prev,
        [bankId]: {
          ...(prev[bankId] || {}),
          [field]: value,
        },
      };
      saveBankFlagsToStorage(updated);
      return updated;
    });

    setLocalBanks((prev) =>
      prev.map((b) =>
        b.id === bankId
          ? {
              ...b,
              cekKarnesiVarMi: field === 'cekKarnesiVarMi' ? value : b.cekKarnesiVarMi,
              posVarMi: field === 'posVarMi' ? value : b.posVarMi,
              krediKartiVarMi: field === 'krediKartiVarMi' ? value : b.krediKartiVarMi,
            }
          : b
      )
    );
  };

  const handleAddBank = () => {
    setDirty(true);
    const newBank: BankMaster = {
      id: `tmp-${Date.now()}`,
      bankaAdi: '',
      kodu: 'BNK',
      hesapAdi: '',
      iban: undefined,
      acilisBakiyesi: 0,
      aktifMi: true,
      cekKarnesiVarMi: false,
      posVarMi: false,
      krediKartiVarMi: false,
    };
    setLocalBanks((prev) => [...prev, newBank]);
  };

  const handleDeleteBank = async (bank: BankMaster) => {
    if (!window.confirm(`${bank.bankaAdi} bankasını silmek istediğinize emin misiniz?`)) {
      return;
    }
    if (!bank.id.startsWith('tmp-')) {
      await apiDelete(`/api/banks/${bank.id}`);
    }
    setDirty(true);
    setLocalBanks((prev) => prev.filter((b) => b.id !== bank.id));
  };

  const handleSaveBanks = async () => {
    setLoading(true);
    try {
      const payload = localBanks.map((b) => ({
        id: b.id,
        name: b.bankaAdi,
        accountNo: b.hesapAdi.includes(' - ') ? b.hesapAdi.split(' - ')[1] : null,
        iban: b.iban || null,
        openingBalance: b.acilisBakiyesi ?? 0,
        isActive: b.aktifMi,
      }));

      const saved = await apiPost<
        Array<{
          id: string;
          name: string;
          accountNo: string | null;
          iban: string | null;
          isActive: boolean;
          currentBalance: number;
        }>
      >('/api/banks/bulk-save', payload);

      const flagsMap: BankFlagMap = {};
      for (const b of localBanks) {
        flagsMap[b.id] = {
          cekKarnesiVarMi: !!b.cekKarnesiVarMi,
          posVarMi: !!b.posVarMi,
          krediKartiVarMi: !!b.krediKartiVarMi,
        };
      }
      saveBankFlagsToStorage(flagsMap);
      setBankFlags(flagsMap);

      const mappedBanks: BankMaster[] = saved.map((b) => {
        const f = flagsMap[b.id] || {};
        return {
          id: b.id,
          bankaAdi: b.name,
          kodu: b.accountNo ? b.accountNo.substring(0, 4).toUpperCase() : 'BNK',
          hesapAdi: b.name + (b.accountNo ? ` - ${b.accountNo}` : ''),
          iban: b.iban || undefined,
          acilisBakiyesi: b.currentBalance ?? 0,
          aktifMi: b.isActive,
          cekKarnesiVarMi: !!f.cekKarnesiVarMi,
          posVarMi: !!f.posVarMi,
          krediKartiVarMi: !!f.krediKartiVarMi,
        };
      });

      setLocalBanks(mappedBanks);
      setBanks(mappedBanks);
      setDirty(false);
    } finally {
      setLoading(false);
    }
  };

  // Credit card handlers
  const handleCreditCardFieldChange = (
    cardId: string,
    field: keyof CreditCard,
    value: string | number | boolean | null
  ) => {
    setDirty(true);
    setLocalCreditCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, [field]: value } : c)));
  };

  const handleAddCreditCard = () => {
    setDirty(true);
    const newCard: CreditCard = {
      id: `tmp-${Date.now()}`,
      bankaId: '',
      kartAdi: '',
      kartLimit: null,
      limit: null,
      kullanilabilirLimit: null,
      asgariOran: 0.4,
      hesapKesimGunu: 1,
      sonOdemeGunu: 1,
      maskeliKartNo: '',
      aktifMi: true,
      sonEkstreBorcu: 0,
      guncelBorc: 0,
    };
    setLocalCreditCards((prev) => [...prev, newCard]);
  };

  const handleDeleteCreditCard = async (card: CreditCard) => {
    if (!window.confirm(`${card.kartAdi} kartını silmek istediğinize emin misiniz?`)) {
      return;
    }
    if (!card.id.startsWith('tmp-')) {
      await apiDelete(`/api/credit-cards/${card.id}`);
    }
    setDirty(true);
    setLocalCreditCards((prev) => prev.filter((c) => c.id !== card.id));
  };

  const handleSaveCreditCards = async () => {
    setLoading(true);
    try {
      const payload = localCreditCards.map((c) => ({
        id: c.id,
        name: c.kartAdi,
        bankId: c.bankaId || null,
        limit: c.limit ?? 0,
        closingDay: c.hesapKesimGunu ?? null,
        dueDay: c.sonOdemeGunu ?? null,
        isActive: c.aktifMi,
        currentDebt: c.guncelBorc ?? 0,
      }));

      const saved = await apiPost<
        Array<{
          id: string;
          name: string;
          bankId: string | null;
          limit: number | null;
          closingDay: number | null;
          dueDay: number | null;
          isActive: boolean;
          currentDebt: number;
          availableLimit: number | null;
          lastOperationDate: string | null;
          bank?: { id: string; name: string } | null;
        }>
      >('/api/credit-cards/bulk-save', payload);

      // Load credit card extras from localStorage
      const cardExtrasKey = 'esca-webkasa-card-extras';
      const savedExtras = localStorage.getItem(cardExtrasKey);
      const cardExtras: Record<string, { sonEkstreBorcu: number; asgariOran: number; maskeliKartNo: string }> =
        savedExtras ? JSON.parse(savedExtras) : {};

      const mapped: CreditCard[] = saved.map((c) => {
        const limit = c.limit;
        const availableLimit = c.availableLimit;
        const extras = cardExtras[c.id] || { sonEkstreBorcu: 0, asgariOran: 0.4, maskeliKartNo: '' };

        return {
          id: c.id,
          bankaId: c.bankId || '',
          kartAdi: c.name,
          kartLimit: limit,
          limit: limit,
          kullanilabilirLimit: availableLimit,
          asgariOran: extras.asgariOran,
          hesapKesimGunu: c.closingDay ?? 1,
          sonOdemeGunu: c.dueDay ?? 1,
          maskeliKartNo: extras.maskeliKartNo,
          aktifMi: c.isActive,
          sonEkstreBorcu: extras.sonEkstreBorcu,
          guncelBorc: c.currentDebt,
        };
      });

      setLocalCreditCards(mapped);
      setCreditCards(mapped);
      setDirty(false);
    } finally {
      setLoading(false);
    }
  };

  // Loan handlers
  const handleLoanFieldChange = (loanId: string, field: keyof Loan, value: string | number | boolean) => {
    setDirty(true);
    setLocalLoans((prev) => prev.map((l) => (l.id === loanId ? { ...l, [field]: value } : l)));
  };

  const handleAddLoan = () => {
    setDirty(true);
    const newLoan: Loan = {
      id: `tmp-${Date.now()}`,
      name: '',
      bankId: '',
      totalAmount: 0,
      installmentCount: 0,
      firstInstallmentDate: new Date().toISOString().split('T')[0],
      annualInterestRate: 0,
      bsmvRate: 0,
      isActive: true,
    };
    setLocalLoans((prev) => [...prev, newLoan]);
  };

  const handleDeleteLoan = async (loan: Loan) => {
    if (!window.confirm(`${loan.name} kredisini silmek istediğinize emin misiniz?`)) {
      return;
    }
    if (!loan.id.startsWith('tmp-')) {
      await apiDelete(`/api/loans/${loan.id}`);
    }
    setDirty(true);
    setLocalLoans((prev) => prev.filter((l) => l.id !== loan.id));
  };

  const handleSaveLoans = async () => {
    setLoading(true);
    try {
      for (const loan of localLoans) {
        if (loan.id.startsWith('tmp-')) {
          const { id: _, ...createPayload } = loan;
          await apiPost<Loan>('/api/loans', createPayload);
        } else {
          await apiPut<Loan>(`/api/loans/${loan.id}`, loan);
        }
      }
      const saved = await apiGet<Loan[]>('/api/loans');
      setLocalLoans(saved);
      setLoans(saved);
      setDirty(false);
    } finally {
      setLoading(false);
    }
  };

  // Global settings handler
  const handleSaveGlobal = async () => {
    setLoading(true);
    try {
      const saved = await apiPut<GlobalSettings>('/api/settings/global', globalForm);
      setGlobalSettings(saved);
      setDirty(false);
    } finally {
      setLoading(false);
    }
  };

  // POS handlers
  const handlePosSave = () => {
    if (!posForm.bankaId || !posForm.posAdi) return;
    setDirty(true);
    if (posEditingId) {
      setPosTerminals(posTerminals.map((p) => (p.id === posEditingId ? { ...p, ...posForm } : p)));
    } else {
      setPosTerminals([...posTerminals, { id: generateId(), ...posForm }]);
    }
    setPosEditingId(null);
  };

  const handlePosRemove = (id: string) => {
    setDirty(true);
    setPosTerminals(posTerminals.filter((p) => p.id !== id));
  };

  // Customer handlers
  const handleCustomerSave = () => {
    if (!customerForm.ad) return;
    setDirty(true);
    if (customerEditingId) {
      setCustomers(customers.map((c) => (c.id === customerEditingId ? { ...c, ad: customerForm.ad, aktifMi: customerForm.aktifMi } : c)));
    } else {
      setCustomers([...customers, { id: generateId(), kod: customerForm.kod, ad: customerForm.ad, aktifMi: customerForm.aktifMi }]);
    }
    setCustomerEditingId(null);
  };

  const handleCustomerRemove = (id: string) => {
    setDirty(true);
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const handleCustomerCsvDownload = () => {
    const lines = [
      ['kod', 'ad', 'aktifMi'].join(CSV_DELIMITER),
      ...customers.map((c) => [c.kod, c.ad, c.aktifMi ? 'true' : 'false'].join(CSV_DELIMITER)),
    ];
    const bom = '\uFEFF';
    const csvContent = bom + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCustomerCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawText = (reader.result as string) || '';
      const cleanText = rawText.replace(/^\uFEFF/, '');
      const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (!lines.length) return;

      const header = lines[0].split(/[;,]/).map((h) => h.trim().toLowerCase());
      if (header.length < 3 || header[0] !== 'kod' || header[1] !== 'ad' || header[2] !== 'aktifmi') {
        alert('Geçersiz CSV formatı. Başlıklar kod,ad,aktifMi olmalıdır.');
        return;
      }

      const parsed: Customer[] = [];
      const getNext = () => nextCode([...customers, ...parsed], 'MUST');

      lines.slice(1).forEach((line) => {
        const cols = line.split(/[;,]/);
        const kodRaw = cols[0]?.trim() ?? '';
        const adRaw = cols[1]?.trim() ?? '';
        const aktifMiRaw = cols[2]?.trim() ?? '';

        if (!kodRaw && !adRaw) return;
        if (!adRaw) return;

        const raw = aktifMiRaw.toLowerCase();
        let aktifMi: boolean;
        if (raw === 'false' || raw === '0' || raw === 'hayır' || raw === 'hayir') {
          aktifMi = false;
        } else if (raw === 'true' || raw === '1' || raw === 'evet') {
          aktifMi = true;
        } else {
          aktifMi = true;
        }

        const kod = kodRaw || getNext();
        parsed.push({ id: generateId(), kod, ad: adRaw, aktifMi });
      });

      setDirty(true);
      setCustomers(parsed);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleCustomerCsvTrigger = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) handleCustomerCsvUpload(target.files[0]);
    };
    input.click();
  };

  // Supplier handlers
  const handleSupplierSave = () => {
    if (!supplierForm.ad) return;
    setDirty(true);
    if (supplierEditingId) {
      setSuppliers(suppliers.map((s) => (s.id === supplierEditingId ? { ...s, ad: supplierForm.ad, aktifMi: supplierForm.aktifMi } : s)));
    } else {
      setSuppliers([...suppliers, { id: generateId(), kod: supplierForm.kod, ad: supplierForm.ad, aktifMi: supplierForm.aktifMi }]);
    }
    setSupplierEditingId(null);
  };

  const handleSupplierRemove = (id: string) => {
    setDirty(true);
    setSuppliers(suppliers.filter((s) => s.id !== id));
  };

  const handleSupplierCsvDownload = () => {
    const lines = [
      ['kod', 'ad', 'aktifMi'].join(CSV_DELIMITER),
      ...suppliers.map((s) => [s.kod, s.ad, s.aktifMi ? 'true' : 'false'].join(CSV_DELIMITER)),
    ];
    const bom = '\uFEFF';
    const csvContent = bom + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'suppliers-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSupplierCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawText = (reader.result as string) || '';
      const cleanText = rawText.replace(/^\uFEFF/, '');
      const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (!lines.length) return;
      const header = lines[0].split(/[;,]/).map((h) => h.trim().toLowerCase());
      if (header.length < 3 || header[0] !== 'kod' || header[1] !== 'ad' || header[2] !== 'aktifmi') {
        alert('Geçersiz CSV formatı. Başlıklar kod,ad,aktifMi olmalıdır.');
        return;
      }

      const parsed: Supplier[] = [];
      const getNext = () => nextCode([...suppliers, ...parsed], 'TDRK');

      lines.slice(1).forEach((line) => {
        const cols = line.split(/[;,]/);
        const kodRaw = cols[0]?.trim() ?? '';
        const adRaw = cols[1]?.trim() ?? '';
        const aktifMiRaw = cols[2]?.trim() ?? '';

        if (!kodRaw && !adRaw) return;
        if (!adRaw) return;

        const raw = aktifMiRaw.toLowerCase();
        let aktifMi: boolean;
        if (raw === 'false' || raw === '0' || raw === 'hayır' || raw === 'hayir') {
          aktifMi = false;
        } else if (raw === 'true' || raw === '1' || raw === 'evet') {
          aktifMi = true;
        } else {
          aktifMi = true;
        }

        const kod = kodRaw || getNext();
        parsed.push({ id: generateId(), kod, ad: adRaw, aktifMi });
      });

      setDirty(true);
      setSuppliers(parsed);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleSupplierCsvTrigger = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) handleSupplierCsvUpload(target.files[0]);
    };
    input.click();
  };

  // ===== Memoized Values =====
  const bankOptions = useMemo(
    () => localBanks.map((b) => ({ value: b.id, label: b.bankaAdi })),
    [localBanks]
  );

  // ===== Render Functions =====
  const renderBanksTab = () => (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Bankalar</h3>
        <button type="button" className="btn btn-secondary" onClick={handleAddBank}>
          Yeni Banka
        </button>
      </div>

      <div className="settings-table-wrapper">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Banka Adı</th>
              <th>Hesap No</th>
              <th>IBAN</th>
              <th>Açılış Bakiyesi</th>
              <th>Aktif</th>
              <th>Çek Karnesi</th>
              <th>POS</th>
              <th>Kredi Kartı</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {localBanks.map((b) => (
              <tr key={b.id}>
                <td>
                  <input
                    className="input"
                    value={b.bankaAdi}
                    onChange={(e) => handleBankFieldChange(b.id, 'bankaAdi', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={b.hesapAdi.includes(' - ') ? b.hesapAdi.split(' - ')[1] : ''}
                    onChange={(e) => {
                      const accountNo = e.target.value;
                      handleBankFieldChange(b.id, 'hesapAdi', accountNo ? `${b.bankaAdi} - ${accountNo}` : b.bankaAdi);
                      handleBankFieldChange(b.id, 'kodu', accountNo ? accountNo.substring(0, 4).toUpperCase() : 'BNK');
                    }}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={b.iban ?? ''}
                    onChange={(e) => handleBankFieldChange(b.id, 'iban', e.target.value || undefined)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={b.acilisBakiyesi ?? 0}
                    onChange={(e) => handleBankFieldChange(b.id, 'acilisBakiyesi', Number(e.target.value) || 0)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={b.aktifMi}
                    onChange={(e) => handleBankFieldChange(b.id, 'aktifMi', e.target.checked)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={!!b.cekKarnesiVarMi}
                    onChange={(e) => handleBankFlagChange(b.id, 'cekKarnesiVarMi', e.target.checked)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={!!b.posVarMi}
                    onChange={(e) => handleBankFlagChange(b.id, 'posVarMi', e.target.checked)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={!!b.krediKartiVarMi}
                    onChange={(e) => handleBankFlagChange(b.id, 'krediKartiVarMi', e.target.checked)}
                  />
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBank(b)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {localBanks.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  Kayıtlı banka yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSaveBanks}>
          Kaydet
        </button>
      </div>
    </div>
  );

  const renderPosTab = () => (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>POS</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-2 py-1">POS</th>
                <th className="text-left px-2 py-1">Banka</th>
                <th className="text-left px-2 py-1">Komisyon</th>
                <th className="px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {posTerminals.map((p) => (
                <tr key={p.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setPosEditingId(p.id)}>
                  <td className="px-2 py-1">{p.posAdi}</td>
                  <td className="px-2 py-1">{banks.find((b) => b.id === p.bankaId)?.bankaAdi || '-'}</td>
                  <td className="px-2 py-1">{(p.komisyonOrani * 100).toFixed(2)}%</td>
                  <td className="px-2 py-1 text-right">
                    <button className="text-rose-600" onClick={(e) => { e.stopPropagation(); handlePosRemove(p.id); }}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-semibold">{posEditingId ? 'POS Düzenle' : 'Yeni POS'}</div>
            <button className="text-sm text-indigo-600" onClick={() => setPosEditingId(null)}>
              Yeni
            </button>
          </div>
          <FormRow label="Banka" required>
            <select className="input" value={posForm.bankaId} onChange={(e) => setPosForm({ ...posForm, bankaId: e.target.value })}>
              <option value="">Seçiniz</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bankaAdi}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow label="POS Adı" required>
            <input className="input" value={posForm.posAdi} onChange={(e) => setPosForm({ ...posForm, posAdi: e.target.value })} />
          </FormRow>
          <FormRow label="Komisyon Oranı" required>
            <input
              className="input"
              type="number"
              step="0.001"
              value={posForm.komisyonOrani}
              onChange={(e) => setPosForm({ ...posForm, komisyonOrani: Number(e.target.value) })}
            />
          </FormRow>
          <label className="inline-flex items-center space-x-2 text-sm">
            <input type="checkbox" checked={posForm.aktifMi} onChange={(e) => setPosForm({ ...posForm, aktifMi: e.target.checked })} />
            <span>Aktif</span>
          </label>
          <div className="flex justify-end">
            <button className="btn-primary" onClick={handlePosSave}>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomersTab = () => (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Müşteriler</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="max-h-96 overflow-auto">
          <div className="flex justify-between mb-2 text-sm">
            <button className="text-indigo-600" onClick={handleCustomerCsvDownload}>
              CSV Şablonu İndir
            </button>
            <button className="text-indigo-600" onClick={handleCustomerCsvTrigger}>
              CSV Yükle
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-2 py-1">Kod</th>
                <th className="text-left px-2 py-1">Ad</th>
                <th className="text-left px-2 py-1">Aktif</th>
                <th className="px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setCustomerEditingId(c.id)}>
                  <td className="px-2 py-1">{c.kod}</td>
                  <td className="px-2 py-1">{c.ad}</td>
                  <td className="px-2 py-1">{c.aktifMi ? 'Evet' : 'Hayır'}</td>
                  <td className="px-2 py-1 text-right">
                    <button className="text-rose-600" onClick={(e) => { e.stopPropagation(); handleCustomerRemove(c.id); }}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-semibold">{customerEditingId ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</div>
            <button className="text-sm text-indigo-600" onClick={() => setCustomerEditingId(null)}>
              Yeni
            </button>
          </div>
          <FormRow label="Kod">
            <input className="input" value={customerForm.kod} readOnly />
          </FormRow>
          <FormRow label="Ad" required>
            <input className="input" value={customerForm.ad} onChange={(e) => setCustomerForm({ ...customerForm, ad: e.target.value })} />
          </FormRow>
          <label className="inline-flex items-center space-x-2 text-sm">
            <input type="checkbox" checked={customerForm.aktifMi} onChange={(e) => setCustomerForm({ ...customerForm, aktifMi: e.target.checked })} />
            <span>Aktif</span>
          </label>
          <div className="flex justify-end">
            <button className="btn-primary" onClick={handleCustomerSave}>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuppliersTab = () => (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Tedarikçiler</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="max-h-96 overflow-auto">
          <div className="flex justify-between mb-2 text-sm">
            <button className="text-indigo-600" onClick={handleSupplierCsvDownload}>
              CSV Şablonu İndir
            </button>
            <button className="text-indigo-600" onClick={handleSupplierCsvTrigger}>
              CSV Yükle
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-2 py-1">Kod</th>
                <th className="text-left px-2 py-1">Ad</th>
                <th className="text-left px-2 py-1">Aktif</th>
                <th className="px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setSupplierEditingId(s.id)}>
                  <td className="px-2 py-1">{s.kod}</td>
                  <td className="px-2 py-1">{s.ad}</td>
                  <td className="px-2 py-1">{s.aktifMi ? 'Evet' : 'Hayır'}</td>
                  <td className="px-2 py-1 text-right">
                    <button className="text-rose-600" onClick={(e) => { e.stopPropagation(); handleSupplierRemove(s.id); }}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-semibold">{supplierEditingId ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}</div>
            <button className="text-sm text-indigo-600" onClick={() => setSupplierEditingId(null)}>
              Yeni
            </button>
          </div>
          <FormRow label="Kod">
            <input className="input" value={supplierForm.kod} readOnly />
          </FormRow>
          <FormRow label="Ad" required>
            <input className="input" value={supplierForm.ad} onChange={(e) => setSupplierForm({ ...supplierForm, ad: e.target.value })} />
          </FormRow>
          <label className="inline-flex items-center space-x-2 text-sm">
            <input type="checkbox" checked={supplierForm.aktifMi} onChange={(e) => setSupplierForm({ ...supplierForm, aktifMi: e.target.checked })} />
            <span>Aktif</span>
          </label>
          <div className="flex justify-end">
            <button className="btn-primary" onClick={handleSupplierSave}>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCardsTab = () => (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Kredi Kartları</h3>
        <button type="button" className="btn btn-secondary" onClick={handleAddCreditCard}>
          Yeni Kart
        </button>
      </div>

      <div className="settings-table-wrapper">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Kart Adı</th>
              <th>Banka</th>
              <th>Limit</th>
              <th>Güncel Borç</th>
              <th>Hesap Kesim Günü</th>
              <th>Son Ödeme Günü</th>
              <th>Aktif</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {localCreditCards.map((c) => (
              <tr key={c.id}>
                <td>
                  <input
                    className="input"
                    value={c.kartAdi}
                    onChange={(e) => handleCreditCardFieldChange(c.id, 'kartAdi', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="input"
                    value={c.bankaId ?? ''}
                    onChange={(e) => handleCreditCardFieldChange(c.id, 'bankaId', e.target.value || null)}
                  >
                    <option value="">Seçilmedi</option>
                    {bankOptions.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={c.limit ?? 0}
                    onChange={(e) => handleCreditCardFieldChange(c.id, 'limit', Number(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={c.guncelBorc ?? 0}
                    onChange={(e) => handleCreditCardFieldChange(c.id, 'guncelBorc', Number(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={c.hesapKesimGunu ?? ''}
                    onChange={(e) =>
                      handleCreditCardFieldChange(c.id, 'hesapKesimGunu', e.target.value ? Number(e.target.value) || null : null)
                    }
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={c.sonOdemeGunu ?? ''}
                    onChange={(e) =>
                      handleCreditCardFieldChange(c.id, 'sonOdemeGunu', e.target.value ? Number(e.target.value) || null : null)
                    }
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={c.aktifMi}
                    onChange={(e) => handleCreditCardFieldChange(c.id, 'aktifMi', e.target.checked)}
                  />
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCreditCard(c)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {localCreditCards.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  Kayıtlı kart yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSaveCreditCards}>
          Kaydet
        </button>
      </div>
    </div>
  );

  const renderLoansTab = () => (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Krediler</h3>
        <button type="button" className="btn btn-secondary" onClick={handleAddLoan}>
          Yeni Kredi
        </button>
      </div>

      <div className="settings-table-wrapper">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Kredi Adı</th>
              <th>Banka</th>
              <th>Toplam Tutar</th>
              <th>Taksit Sayısı</th>
              <th>İlk Taksit Tarihi</th>
              <th>Yıllık Faiz Oranı (%)</th>
              <th>BSMV Oranı (%)</th>
              <th>Aktif</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {localLoans.map((l) => (
              <tr key={l.id}>
                <td>
                  <input
                    className="input"
                    value={l.name}
                    onChange={(e) => handleLoanFieldChange(l.id, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="input"
                    value={l.bankId}
                    onChange={(e) => handleLoanFieldChange(l.id, 'bankId', e.target.value)}
                  >
                    <option value="">Seçilmedi</option>
                    {bankOptions.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={l.totalAmount ?? 0}
                    onChange={(e) => handleLoanFieldChange(l.id, 'totalAmount', Number(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={l.installmentCount ?? 0}
                    onChange={(e) => handleLoanFieldChange(l.id, 'installmentCount', Number(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="date"
                    value={l.firstInstallmentDate}
                    onChange={(e) => handleLoanFieldChange(l.id, 'firstInstallmentDate', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={l.annualInterestRate ?? 0}
                    onChange={(e) => handleLoanFieldChange(l.id, 'annualInterestRate', Number(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={l.bsmvRate ?? 0}
                    onChange={(e) => handleLoanFieldChange(l.id, 'bsmvRate', Number(e.target.value) || 0)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={l.isActive}
                    onChange={(e) => handleLoanFieldChange(l.id, 'isActive', e.target.checked)}
                  />
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLoan(l)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {localLoans.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  Kayıtlı kredi yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSaveLoans}>
          Kaydet
        </button>
      </div>
    </div>
  );

  const renderGlobalTab = () => (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Global Ayarlar</h3>
      </div>

      <div className="settings-form-grid"></div>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSaveGlobal}>
          Kaydet
        </button>
      </div>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'BANKALAR':
        return renderBanksTab();
      case 'POS':
        return renderPosTab();
      case 'MUSTERI':
        return renderCustomersTab();
      case 'TEDARIKCI':
        return renderSuppliersTab();
      case 'KREDI_KARTI':
        return renderCardsTab();
      case 'KREDILER':
        return renderLoansTab();
      case 'GLOBAL':
        return renderGlobalTab();
      default:
        return (
          <div className="settings-tab">
            <p>Bu sekme henüz uygulanmadı.</p>
          </div>
        );
    }
  };

  // ===== Main Render =====
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Ayarlar</div>
          <button onClick={handleClose}>✕</button>
        </div>

        <div className="settings-modal">
          <div className="settings-tabs">
            <button
              type="button"
              className={activeTab === 'BANKALAR' ? 'settings-tab-btn active' : 'settings-tab-btn'}
              onClick={() => onChangeTab('BANKALAR')}
            >
              Bankalar
            </button>
            <button
              type="button"
              className={activeTab === 'POS' ? 'settings-tab-btn active' : 'settings-tab-btn'}
              onClick={() => onChangeTab('POS')}
            >
              POS
            </button>
            <button
              type="button"
              className={activeTab === 'MUSTERI' ? 'settings-tab-btn active' : 'settings-tab-btn'}
              onClick={() => onChangeTab('MUSTERI')}
            >
              Müşteriler
            </button>
            <button
              type="button"
              className={activeTab === 'TEDARIKCI' ? 'settings-tab-btn active' : 'settings-tab-btn'}
              onClick={() => onChangeTab('TEDARIKCI')}
            >
              Tedarikçiler
            </button>
            <button
              type="button"
              className={activeTab === 'KREDI_KARTI' ? 'settings-tab-btn active' : 'settings-tab-btn'}
              onClick={() => onChangeTab('KREDI_KARTI')}
            >
              Kredi Kartları
            </button>
            <button
              type="button"
              className={activeTab === 'KREDILER' ? 'settings-tab-btn active' : 'settings-tab-btn'}
              onClick={() => onChangeTab('KREDILER')}
            >
              Krediler
            </button>
            <button
              type="button"
              className={activeTab === 'GLOBAL' ? 'settings-tab-btn active' : 'settings-tab-btn'}
              onClick={() => onChangeTab('GLOBAL')}
            >
              Global
            </button>
          </div>

          <div className="settings-content">
            {loading && (
              <div className="settings-loading-overlay">
                <span>Yükleniyor...</span>
              </div>
            )}
            {renderTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyarlarModal;
