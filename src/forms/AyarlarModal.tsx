import React, { useEffect, useMemo, useState } from 'react';
import { BankMaster } from '../models/bank';
import { Customer } from '../models/customer';
import { Supplier } from '../models/supplier';
import { CreditCard } from '../models/card';
import { Loan } from '../models/loan';
import { PosTerminal } from '../models/pos';
import { GlobalSettings } from '../models/settings';
import { apiDelete, apiGet, apiPost, apiPut } from '../utils/api';
import {
  loadBankFlagsFromStorage,
  saveBankFlagsToStorage,
  loadCardExtrasFromStorage,
  type BankFlagMap,
} from '../utils/settingsUtils';
import BanksTab from '../components/settings/BanksTab';
import PosTab from '../components/settings/PosTab';
import CustomersTab from '../components/settings/CustomersTab';
import SuppliersTab from '../components/settings/SuppliersTab';
import CreditCardsTab from '../components/settings/CreditCardsTab';
import LoansTab from '../components/settings/LoansTab';
import GlobalTab from '../components/settings/GlobalTab';

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

  // Local state for editing (all tabs use local state until Save)
  const [localBanks, setLocalBanks] = useState<BankMaster[]>([]);
  const [localCreditCards, setLocalCreditCards] = useState<CreditCard[]>([]);
  const [localLoans, setLocalLoans] = useState<Loan[]>([]);
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>([]);
  const [localPosTerminals, setLocalPosTerminals] = useState<PosTerminal[]>([]);
  const [globalForm, setGlobalForm] = useState<GlobalSettings>(globalSettings);
  const [bankFlags, setBankFlags] = useState<BankFlagMap>({});
  // Track opening balances separately to preserve user input (not overwrite with currentBalance)
  const [openingBalances, setOpeningBalances] = useState<Record<string, number>>({});

  // ===== Effects =====
  // Fetch data when modal opens (only if localBanks is empty - first open or after close)
  useEffect(() => {
    if (!isOpen) return;
    // Only fetch if we don't have local data yet (first open or after close/reset)
    if (localBanks.length > 0) {
      // Already have local data, don't refetch (preserves unsaved changes)
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setDirty(false); // Reset dirty on fresh fetch

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

        // Map banks - for opening balance, use stored value or currentBalance (for new banks with no transactions yet)
        const mappedBanks: BankMaster[] = backendBanks.map((b) => {
          const flags = flagsFromStorage[b.id] || {
            cekKarnesiVarMi: false,
            posVarMi: false,
            krediKartiVarMi: false,
          };
          // Use stored opening balance if available, otherwise use currentBalance (assumes no transactions yet)
          const openingBalance = openingBalances[b.id] ?? b.currentBalance;
          return {
            id: b.id,
            bankaAdi: b.name,
            kodu: b.accountNo ? b.accountNo.substring(0, 4).toUpperCase() : 'BNK',
            hesapAdi: b.name + (b.accountNo ? ` - ${b.accountNo}` : ''),
            iban: b.iban || undefined,
            acilisBakiyesi: openingBalance,
            aktifMi: b.isActive,
            cekKarnesiVarMi: flags.cekKarnesiVarMi ?? false,
            posVarMi: flags.posVarMi ?? false,
            krediKartiVarMi: flags.krediKartiVarMi ?? false,
          };
        });

        // Map credit cards with localStorage extras
        const cardExtras = loadCardExtrasFromStorage();
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

        // Update local and parent state with fresh data
        setLocalBanks(mappedBanks);
        setLocalCreditCards(mappedCards);
        setLocalLoans(backendLoans);
        setLocalCustomers(customers);
        setLocalSuppliers(suppliers);
        setLocalPosTerminals(posTerminals);
        setBankFlags(flagsFromStorage);
        setGlobalForm(globalSettings);

        // Update parent state (only after successful fetch)
        setBanks(mappedBanks);
        setCreditCards(mappedCards);
        setLoans(backendLoans);
        setCustomers(customers);
        setSuppliers(suppliers);
        setPosTerminals(posTerminals);
      } catch (error) {
        console.error('Error fetching settings data:', error);
        alert('Ayarlar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isOpen]); // Remove dependencies that cause re-fetch on every render

  // ===== Handlers =====
  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş değişiklikler var. Kapatılsın mı?')) {
      return;
    }
    // Reset local state on close so it refetches fresh data on next open
    setLocalBanks([]);
    setLocalCreditCards([]);
    setLocalLoans([]);
    setDirty(false);
    onClose();
  };

  const handleDirty = () => setDirty(true);

  // Bank handlers
  const handleBankFieldChange = (bankId: string, field: keyof BankMaster, value: string | number | boolean) => {
    handleDirty();
    setLocalBanks((prev) => prev.map((b) => (b.id === bankId ? { ...b, [field]: value } : b)));
    // Track opening balance changes separately
    if (field === 'acilisBakiyesi') {
      setOpeningBalances((prev) => ({ ...prev, [bankId]: value as number }));
    }
  };

  const handleBankFlagChange = (bankId: string, field: keyof BankFlagMap[string], value: boolean) => {
    handleDirty();
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
    handleDirty();

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
    handleDirty();
    setLocalBanks((prev) => prev.filter((b) => b.id !== bank.id));
  };

  const handleSaveBanks = async () => {
    setLoading(true);
    try {
      // Prepare payload for bulk save
      const payload = localBanks.map((b) => ({
        id: b.id,
        name: b.bankaAdi,
        accountNo: b.hesapAdi.includes(' - ') ? b.hesapAdi.split(' - ')[1] : null,
        iban: b.iban || null,
        openingBalance: b.acilisBakiyesi ?? 0,
        isActive: b.aktifMi,
      }));

      // Save to backend
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

      // Map tmp-* IDs to real IDs: backend returns banks in same order as input
      // Create tempId -> realId mapping
      const tempIdMap: Record<string, string> = {};
      localBanks.forEach((localBank, idx) => {
        if (localBank.id.startsWith('tmp-') && saved[idx]) {
          tempIdMap[localBank.id] = saved[idx].id;
        }
      });

      // Extract and save bank flags to localStorage using real IDs
      const flagsMap: BankFlagMap = {};
      for (const b of localBanks) {
        // Use real ID from mapping if tmp-*, otherwise use existing ID
        const realId = tempIdMap[b.id] || b.id;
        flagsMap[realId] = {
          cekKarnesiVarMi: !!b.cekKarnesiVarMi,
          posVarMi: !!b.posVarMi,
          krediKartiVarMi: !!b.krediKartiVarMi,
        };
      }
      saveBankFlagsToStorage(flagsMap);
      setBankFlags(flagsMap);

      // Map saved banks back to BankMaster format
      // Preserve opening balance from user input (stored in openingBalances or localBanks)
      const newOpeningBalances: Record<string, number> = {};
      const mappedBanks: BankMaster[] = saved.map((savedBank, idx) => {
        const localBank = localBanks[idx];
        const f = flagsMap[savedBank.id] || {};
        // Preserve the opening balance that user entered
        const openingBalance = localBank?.acilisBakiyesi ?? openingBalances[savedBank.id] ?? savedBank.currentBalance ?? 0;
        // Store in newOpeningBalances for batch update
        newOpeningBalances[savedBank.id] = openingBalance;
        return {
          id: savedBank.id, // Use real ID from backend
          bankaAdi: savedBank.name,
          kodu: savedBank.accountNo ? savedBank.accountNo.substring(0, 4).toUpperCase() : 'BNK',
          hesapAdi: savedBank.name + (savedBank.accountNo ? ` - ${savedBank.accountNo}` : ''),
          iban: savedBank.iban || undefined,
          acilisBakiyesi: openingBalance, // Use user's opening balance input
          aktifMi: savedBank.isActive,
          cekKarnesiVarMi: !!f.cekKarnesiVarMi,
          posVarMi: !!f.posVarMi,
          krediKartiVarMi: !!f.krediKartiVarMi,
        };
      });
      // Update opening balances in one batch
      setOpeningBalances((prev) => ({ ...prev, ...newOpeningBalances }));

      // Update both local and parent state
      setLocalBanks(mappedBanks);
      setBanks(mappedBanks);
      setDirty(false);
    } catch (error: any) {
      console.error('Banks save error:', error);
      console.error('Error response:', error?.response || error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Bankalar kaydedilirken bir hata oluştu.';
      alert(`Hata: ${errorMessage}`);
      // Don't close modal on error - keep it open so user can fix and retry
    } finally {
      // Always stop loading, whether success or error
      setLoading(false);
    }
  };

  // Credit card handlers
  const handleCreditCardFieldChange = (
    cardId: string,
    field: keyof CreditCard,
    value: string | number | boolean | null
  ) => {
    handleDirty();
    setLocalCreditCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, [field]: value } : c)));
  };

  const handleAddCreditCard = () => {
    handleDirty();
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
    handleDirty();
    setLocalCreditCards((prev) => prev.filter((c) => c.id !== card.id));
  };

  const handleSaveCreditCards = async () => {
    setLoading(true);
    try {
      const payload = localCreditCards.map((c) => ({
        id: c.id,
        name: c.kartAdi,
        bankId: c.bankaId || null,
        limit: c.limit ?? null,
        closingDay: c.hesapKesimGunu ?? null,
        dueDay: c.sonOdemeGunu ?? null,
        sonEkstreBorcu: c.sonEkstreBorcu ?? 0,
        manualGuncelBorc: c.guncelBorc ?? null,
        isActive: c.aktifMi,
      }));

      const saved = await apiPost<
        Array<{
          id: string;
          name: string;
          bankId: string | null;
          limit: number | null;
          closingDay: number | null;
          dueDay: number | null;
          sonEkstreBorcu: number;
          manualGuncelBorc: number | null;
          isActive: boolean;
          currentDebt: number;
          availableLimit: number | null;
          lastOperationDate: string | null;
          bank?: { id: string; name: string } | null;
        }>
      >('/api/credit-cards/bulk-save', payload);

      // Load and save credit card extras (only for asgariOran and maskeliKartNo)
      const cardExtras = loadCardExtrasFromStorage();
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
          sonEkstreBorcu: c.sonEkstreBorcu, // Use from backend, not localStorage
          guncelBorc: c.currentDebt,
        };
      });

      setLocalCreditCards(mapped);
      setCreditCards(mapped);
      setDirty(false);
    } catch (error: any) {
      console.error('Credit cards save error:', error);
      const errorMessage = error?.message || 'Kredi kartları kaydedilirken bir hata oluştu.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loan handlers
  const handleLoanFieldChange = (loanId: string, field: keyof Loan, value: string | number | boolean) => {
    handleDirty();
    setLocalLoans((prev) => prev.map((l) => (l.id === loanId ? { ...l, [field]: value } : l)));
  };

  const handleAddLoan = () => {
    handleDirty();

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
    handleDirty();
    setLocalLoans((prev) => prev.filter((l) => l.id !== loan.id));
  };

  const handleSaveLoans = async () => {
    setLoading(true);
    try {
      for (const loan of localLoans) {
        // Validate required fields
        if (!loan.name || loan.name.trim().length === 0) {
          alert(`"${loan.name || '(İsimsiz)'}" kredisi için kredi adı zorunludur.`);
          return;
        }
        if (!loan.bankId || loan.bankId.trim().length === 0) {
          alert(`"${loan.name}" kredisi için banka seçimi zorunludur.`);
          return;
        }
        if (!loan.totalAmount || loan.totalAmount <= 0) {
          alert(`"${loan.name}" kredisi için toplam tutar pozitif bir değer olmalıdır.`);
          return;
        }
        if (!loan.installmentCount || loan.installmentCount <= 0) {
          alert(`"${loan.name}" kredisi için taksit sayısı pozitif bir değer olmalıdır.`);
          return;
        }
        if (!loan.firstInstallmentDate || loan.firstInstallmentDate.trim().length === 0) {
          alert(`"${loan.name}" kredisi için ilk taksit tarihi zorunludur.`);
          return;
        }
        if (loan.annualInterestRate < 0) {
          alert(`"${loan.name}" kredisi için yıllık faiz oranı negatif olamaz.`);
          return;
        }
        if (loan.bsmvRate < 0) {
          alert(`"${loan.name}" kredisi için BSMV oranı negatif olamaz.`);
          return;
        }

        if (loan.id.startsWith('tmp-')) {
          const { id, createdAt, createdBy, updatedAt, updatedBy, deletedAt, deletedBy, bank, installments, ...createPayload } = loan;
          await apiPost<Loan>('/api/loans', createPayload);
        } else {
          const { id, createdAt, createdBy, deletedAt, deletedBy, bank, installments, ...updatePayload } = loan;
          await apiPut<Loan>(`/api/loans/${loan.id}`, updatePayload);
        }
      }
      const saved = await apiGet<Loan[]>('/api/loans');
      setLocalLoans(saved);
      setLoans(saved);
      setDirty(false);
    } catch (error: any) {
      const errorMessage = error?.message || 'Krediler kaydedilirken bir hata oluştu.';
      alert(errorMessage);
      console.error('Error saving loans:', error);
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
    } catch (error: any) {
      console.error('Global settings save error:', error);
      const errorMessage = error?.message || 'Global ayarlar kaydedilirken bir hata oluştu.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===== Memoized Values =====
  const bankOptions = useMemo(
    () => localBanks.map((b) => ({ value: b.id, label: b.bankaAdi })),
    [localBanks]
  );

  // ===== Render =====
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 m-0">Ayarlar</h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100"
            type="button"
          >
            ✕
          </button>
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
            {activeTab === 'BANKALAR' && (
              <BanksTab
                banks={localBanks}
                bankFlags={bankFlags}
                loading={loading}
                onFieldChange={handleBankFieldChange}
                onFlagChange={handleBankFlagChange}
                onAdd={handleAddBank}
                onDelete={handleDeleteBank}
                onSave={handleSaveBanks}
              />
            )}
            {activeTab === 'POS' && (
              <PosTab
                terminals={localPosTerminals}
                banks={localBanks}
                onSetTerminals={setLocalPosTerminals}
                onDirty={handleDirty}
              />
            )}
            {activeTab === 'MUSTERI' && (
              <CustomersTab customers={localCustomers} onSetCustomers={setLocalCustomers} onDirty={handleDirty} />
            )}
            {activeTab === 'TEDARIKCI' && (
              <SuppliersTab suppliers={suppliers} onSetSuppliers={setSuppliers} onDirty={handleDirty} />
            )}
            {activeTab === 'KREDI_KARTI' && (
              <CreditCardsTab
                cards={localCreditCards}
                bankOptions={bankOptions}
                loading={loading}
                onFieldChange={handleCreditCardFieldChange}
                onAdd={handleAddCreditCard}
                onDelete={handleDeleteCreditCard}
                onSave={handleSaveCreditCards}
              />
            )}
            {activeTab === 'KREDILER' && (
              <LoansTab
                loans={localLoans}
                bankOptions={bankOptions}
                loading={loading}
                onFieldChange={handleLoanFieldChange}
                onAdd={handleAddLoan}
                onDelete={handleDeleteLoan}
                onSave={handleSaveLoans}
              />
            )}
            {activeTab === 'GLOBAL' && (
              <GlobalTab settings={globalForm} loading={loading} onSave={handleSaveGlobal} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyarlarModal;
