import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../components/ui/Modal';
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
  loadCustomersFromStorage,
  saveCustomersToStorage,
  loadSuppliersFromStorage,
  saveSuppliersToStorage,
  loadPosTerminalsFromStorage,
  savePosTerminalsToStorage,
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
  // Sync local state with parent state when modal opens (after parent state is updated from onClose)
  useEffect(() => {
    if (!isOpen) {
      // Modal closed: reset local state to force fresh fetch on next open
      setLocalBanks([]);
      setLocalCreditCards([]);
      setLocalLoans([]);
      setLocalCustomers([]);
      setLocalSuppliers([]);
      setLocalPosTerminals([]);
      setDirty(false);
      return;
    }
    
    // Modal opened: if parent state has data, sync it to local state
    // This ensures that after modal close/reopen, we use the latest parent state (which was updated in onClose)
    if (banks.length > 0 || creditCards.length > 0 || loans.length > 0 || customers.length > 0 || suppliers.length > 0 || posTerminals.length > 0) {
      console.log('[BUG-1 DEBUG] AyarlarModal - Syncing local state from parent state on modal open');
      setLocalBanks(banks);
      setLocalCreditCards(creditCards);
      setLocalLoans(loans);
      setLocalCustomers(customers);
      setLocalSuppliers(suppliers);
      setLocalPosTerminals(posTerminals);
      setGlobalForm(globalSettings);
      // Load bank flags from localStorage
      const flagsFromStorage = loadBankFlagsFromStorage();
      setBankFlags(flagsFromStorage);
      setDirty(false);
      return; // Don't fetch, use parent state
    }
    
    // Only fetch if we don't have local data yet (first open)
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
          // BUG-1 FIX: Backend contract - must include sonEkstreBorcu and manualGuncelBorc
          apiGet<
            Array<{
              id: string;
              name: string;
              bankId: string | null;
              limit: number | null;
              closingDay: number | null;
              dueDay: number | null;
              sonEkstreBorcu: number; // REQUIRED: Last statement balance from DB
              manualGuncelBorc: number | null; // REQUIRED: Manual current debt override
              isActive: boolean;
              currentDebt?: number; // Optional computed field
              availableLimit?: number | null; // Optional computed field
              lastOperationDate?: string | null;
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

        // BUG-1 FIX: localStorage ONLY for UI helpers, NOT for debt values
        const cardExtras = loadCardExtrasFromStorage();
        
        // BUG-1 FIX: Robust mapping with fallback - backend is authoritative source
        const mappedCards: CreditCard[] = backendCards.map((c) => {
          const limit = c.limit ?? null;
          const extras = cardExtras[c.id] || { asgariOran: 0.4, maskeliKartNo: '' };
          
          // BUG-1 FIX: Debt values from backend with fallback
          const sonEkstreBorcu = Number(c.sonEkstreBorcu ?? 0);
          const guncelBorc = c.manualGuncelBorc !== null && c.manualGuncelBorc !== undefined 
            ? Number(c.manualGuncelBorc) 
            : (c.currentDebt !== undefined ? Number(c.currentDebt) : null);
          
          // kullanilabilirLimit: calculate from limit and guncelBorc
          const kullanilabilirLimit = limit !== null && guncelBorc !== null 
            ? limit - guncelBorc 
            : (c.availableLimit ?? null);

          return {
            id: c.id,
            bankaId: c.bankId || '',
            kartAdi: c.name,
            kartLimit: limit,
            limit: limit,
            kullanilabilirLimit: kullanilabilirLimit,
            asgariOran: extras.asgariOran, // From localStorage (UI helper only)
            hesapKesimGunu: c.closingDay ?? 1,
            sonOdemeGunu: c.dueDay ?? 1,
            maskeliKartNo: extras.maskeliKartNo, // From localStorage (UI helper only)
            aktifMi: c.isActive,
            sonEkstreBorcu, // From backend (authoritative)
            guncelBorc, // From backend (authoritative)
          };
        });

        // Update local and parent state with fresh data
        setLocalBanks(mappedBanks);
        setLocalCreditCards(mappedCards);
        setLocalLoans(backendLoans);
        // Load customers, suppliers, and POS terminals from backend (authoritative source)
        // Fallback to localStorage if backend is unavailable
        let finalCustomers: Customer[] = [];
        let finalSuppliers: Supplier[] = [];
        let finalPosTerminals: PosTerminal[] = [];
        
        try {
          const backendCustomers = await apiGet<Array<{
            id: string;
            name: string;
            isActive: boolean;
          }>>('/api/customers');
          finalCustomers = backendCustomers.map((c) => {
            const parts = c.name.split(' - ');
            return {
              id: c.id,
              kod: parts[0] || '',
              ad: parts.slice(1).join(' - ') || c.name,
              aktifMi: c.isActive,
            };
          });
        } catch (e) {
          console.warn('Failed to load customers from backend, using localStorage:', e);
          const savedCustomers = loadCustomersFromStorage();
          finalCustomers = savedCustomers.length > 0 ? savedCustomers : customers;
        }
        
        try {
          const backendSuppliers = await apiGet<Array<{
            id: string;
            name: string;
            isActive: boolean;
          }>>('/api/suppliers');
          finalSuppliers = backendSuppliers.map((s) => {
            const parts = s.name.split(' - ');
            return {
              id: s.id,
              kod: parts[0] || '',
              ad: parts.slice(1).join(' - ') || s.name,
              aktifMi: s.isActive,
            };
          });
        } catch (e) {
          console.warn('Failed to load suppliers from backend, using localStorage:', e);
          const savedSuppliers = loadSuppliersFromStorage();
          finalSuppliers = savedSuppliers.length > 0 ? savedSuppliers : suppliers;
        }
        
        try {
          const backendPosTerminals = await apiGet<Array<{
            id: string;
            bankId: string;
            name: string;
            commissionRate: number;
            isActive: boolean;
          }>>('/api/pos-terminals');
          finalPosTerminals = backendPosTerminals.map((p) => ({
            id: p.id,
            bankaId: p.bankId,
            posAdi: p.name,
            komisyonOrani: p.commissionRate,
            aktifMi: p.isActive,
          }));
        } catch (e) {
          console.warn('Failed to load POS terminals from backend, using localStorage:', e);
          const savedPosTerminals = loadPosTerminalsFromStorage();
          finalPosTerminals = savedPosTerminals.length > 0 ? savedPosTerminals : posTerminals;
        }
        
        setLocalCustomers(finalCustomers);
        setLocalSuppliers(finalSuppliers);
        setLocalPosTerminals(finalPosTerminals);
        setBankFlags(flagsFromStorage);
        setGlobalForm(globalSettings);

        // Update parent state (only after successful fetch)
        setBanks(mappedBanks);
        setCreditCards(mappedCards);
        setLoans(backendLoans);
        setCustomers(finalCustomers);
        setSuppliers(finalSuppliers);
        setPosTerminals(finalPosTerminals);
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

  const handleSaveBanks = async (banksToSave?: BankMaster[]): Promise<BankMaster[]> => {
    setLoading(true);
    try {
      // Use provided banks or fallback to localBanks state
      // Nota: Sadece gerçek array kabul et (event objesi veya yanlış tip gelebilir)
      let banks: BankMaster[] = Array.isArray(banksToSave) ? banksToSave : localBanks;
      if (!Array.isArray(banks)) {
        banks = [];
      }
      
      if (banks.length === 0) {
        setLoading(false);
        return [];
      }

      // Prepare payload for bulk save
      const payload = banks.map((b) => {
        const accountNo = b.hesapAdi.includes(' - ') ? b.hesapAdi.split(' - ')[1] : null;
        const item = {
          id: b.id,
          name: b.bankaAdi.trim(),
          accountNo: accountNo ? accountNo.trim() : null,
          iban: b.iban ? b.iban.trim() : null,
          openingBalance: b.acilisBakiyesi ?? 0,
          isActive: b.aktifMi ?? true,
        };
        return item;
      });

      // Save to backend
      type SavedBank = {
        id: string;
        name: string;
        accountNo: string | null;
        iban: string | null;
        isActive: boolean;
        currentBalance: number;
      };
      
      let saved: SavedBank[];
      
      try {
        saved = await apiPost<SavedBank[]>('/api/banks/bulk-save', payload);
      } catch (apiError: any) {
        throw apiError;
      }
      
      if (!saved) {
        throw new Error('Backend returned null or undefined');
      }
      
      if (!Array.isArray(saved)) {
        throw new Error(`Backend did not return an array. Got: ${typeof saved}`);
      }

      // Map tmp-* IDs to real IDs: backend returns banks in same order as input
      // Create tempId -> realId mapping
      const tempIdMap: Record<string, string> = {};
      banks.forEach((localBank, idx) => {
        if (localBank.id.startsWith('tmp-') && saved[idx]) {
          tempIdMap[localBank.id] = saved[idx].id;
        }
      });

      // Extract and save bank flags to localStorage using real IDs
      const flagsMap: BankFlagMap = {};
      for (const b of banks) {
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
      // Preserve opening balance from user input (stored in openingBalances or banks)
      const newOpeningBalances: Record<string, number> = {};
      const mappedBanks: BankMaster[] = saved.map((savedBank, idx) => {
        const localBank = banks[idx];
        const f = flagsMap[savedBank.id] || {};
        // CRITICAL FIX: Use openingBalance from backend (Bank.openingBalance), NOT currentBalance
        // currentBalance = openingBalance + transactionDelta, so using it would double-count
        const openingBalance = localBank?.acilisBakiyesi ?? openingBalances[savedBank.id] ?? (savedBank as any).openingBalance ?? 0;
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
      
      return mappedBanks;
    } catch (error: any) {
      console.error('Banks save error:', error);
      console.error('Error response:', error?.response || error);
      console.error('Error stack:', error?.stack);
      const errorMessage = error?.message || error?.response?.data?.message || 'Bankalar kaydedilirken bir hata oluştu.';
      alert(`Hata: ${errorMessage}`);
      // Don't close modal on error - keep it open so user can fix and retry
      throw error; // Re-throw to let caller know it failed
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
    setLocalCreditCards((prev) => {
      const updated = prev.map((c) => {
        if (c.id === cardId) {
          const updatedCard = { ...c, [field]: value };
          // DEBUG: Log field change for debt fields
          if (field === 'sonEkstreBorcu' || field === 'guncelBorc') {
            console.log(`[BUG-1 DEBUG] handleCreditCardFieldChange - Card ${c.kartAdi} (${c.id}):`, {
              field,
              oldValue: c[field],
              newValue: value,
              valueType: typeof value,
              updatedCard_sonEkstreBorcu: updatedCard.sonEkstreBorcu,
              updatedCard_guncelBorc: updatedCard.guncelBorc
            });
          }
          return updatedCard;
        }
        return c;
      });
      return updated;
    });
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
      guncelBorc: null, // null = calculate from operations
    };
    setLocalCreditCards((prev) => [...prev, newCard]);
  };

  const handleDeleteCreditCard = async (card: CreditCard) => {
    if (!window.confirm(`${card.kartAdi} kartını silmek istediğinize emin misiniz?`)) {
        return;
      }
    try {
      if (!card.id.startsWith('tmp-')) {
        await apiDelete(`/api/credit-cards/${card.id}`);
      }
      // Remove from local state
      const updated = localCreditCards.filter((c) => c.id !== card.id);
      setLocalCreditCards(updated);
      // Update parent state
      setCreditCards(updated);
      handleDirty();
    } catch (error: any) {
      console.error('Error deleting credit card:', error);
      const errorMessage = error?.message || 'Kredi kartı silinirken bir hata oluştu.';
      alert(`Hata: ${errorMessage}`);
    }
  };

  const handleSaveCreditCards = async () => {
    setLoading(true);
    try {
      // DEBUG: Log localCreditCards state before mapping
      console.log('[BUG-1 DEBUG] handleSaveCreditCards - localCreditCards state:', JSON.stringify(localCreditCards.map(c => ({
        id: c.id,
        name: c.kartAdi,
        sonEkstreBorcu: c.sonEkstreBorcu,
        guncelBorc: c.guncelBorc,
        sonEkstreBorcu_type: typeof c.sonEkstreBorcu,
        guncelBorc_type: typeof c.guncelBorc
      })), null, 2));
      
      const payload = localCreditCards.map((c) => {
        // Preserve user-entered values, even if 0 or null
        // sonEkstreBorcu: always send the value (0 is valid)
        // manualGuncelBorc: send null if not set, otherwise send the value (0 is valid)
        // CRITICAL: Check if value is explicitly set (not undefined/null) before converting
        const sonEkstreBorcu = c.sonEkstreBorcu !== undefined && c.sonEkstreBorcu !== null 
          ? (typeof c.sonEkstreBorcu === 'number' ? c.sonEkstreBorcu : Number(c.sonEkstreBorcu) || 0)
          : 0;
        const manualGuncelBorc = c.guncelBorc !== undefined && c.guncelBorc !== null
          ? (typeof c.guncelBorc === 'number' ? c.guncelBorc : Number(c.guncelBorc) || null)
          : null;
        
        const payloadItem = {
          id: c.id,
          name: c.kartAdi,
          bankId: c.bankaId || null,
          limit: c.limit ?? null,
          closingDay: c.hesapKesimGunu ?? null,
          dueDay: c.sonOdemeGunu ?? null,
          sonEkstreBorcu,
          manualGuncelBorc,
          isActive: c.aktifMi,
        };
        
        // DEBUG: Log payload item
        console.log(`[BUG-1 DEBUG] handleSaveCreditCards - Payload for card ${c.kartAdi}:`, {
          sonEkstreBorcu: payloadItem.sonEkstreBorcu,
          manualGuncelBorc: payloadItem.manualGuncelBorc,
          localState_sonEkstreBorcu: c.sonEkstreBorcu,
          localState_guncelBorc: c.guncelBorc,
          computed_sonEkstreBorcu: sonEkstreBorcu,
          computed_manualGuncelBorc: manualGuncelBorc
        });
        
        return payloadItem;
      });

      // DEBUG: Log full payload
      console.log('[BUG-1 DEBUG] handleSaveCreditCards - Full payload:', JSON.stringify(payload, null, 2));

      // BUG-1 FIX: Backend contract - must include sonEkstreBorcu and manualGuncelBorc
      const saved = await apiPost<
        Array<{
          id: string;
          name: string;
          bankId: string | null;
          limit: number | null;
          closingDay: number | null;
          dueDay: number | null;
          sonEkstreBorcu: number; // REQUIRED: Last statement balance from DB
          manualGuncelBorc: number | null; // REQUIRED: Manual current debt override
          isActive: boolean;
          currentDebt?: number; // Optional computed field
          availableLimit?: number | null; // Optional computed field
          lastOperationDate?: string | null;
          bank?: { id: string; name: string } | null;
        }>
      >('/api/credit-cards/bulk-save', payload);

      // DEBUG: Log backend response
      console.log('[BUG-1 DEBUG] handleSaveCreditCards - Backend response:', JSON.stringify(saved.map(c => ({
        id: c.id,
        name: c.name,
        sonEkstreBorcu: c.sonEkstreBorcu,
        manualGuncelBorc: c.manualGuncelBorc
      })), null, 2));

      // BUG-1 FIX: Load localStorage ONLY for UI helpers, NOT for debt values
      const cardExtras = loadCardExtrasFromStorage();
      
      // BUG-1 FIX: Robust mapping with fallback - backend is authoritative source
      const mapped: CreditCard[] = saved.map((c) => {
        const limit = c.limit ?? null;
        const extras = cardExtras[c.id] || { asgariOran: 0.4, maskeliKartNo: '' };
        
        // BUG-1 FIX: Debt values from backend with fallback
        const sonEkstreBorcu = Number(c.sonEkstreBorcu ?? 0);
        const guncelBorc = c.manualGuncelBorc !== null && c.manualGuncelBorc !== undefined 
          ? Number(c.manualGuncelBorc) 
          : (c.currentDebt !== undefined ? Number(c.currentDebt) : null);
        
        // kullanilabilirLimit: calculate from limit and guncelBorc
        const kullanilabilirLimit = limit !== null && guncelBorc !== null 
          ? limit - guncelBorc 
          : (c.availableLimit ?? null);

        return {
          id: c.id,
          bankaId: c.bankId || '',
          kartAdi: c.name,
          kartLimit: limit,
          limit: limit,
          kullanilabilirLimit: kullanilabilirLimit,
          asgariOran: extras.asgariOran, // From localStorage (UI helper only)
          hesapKesimGunu: c.closingDay ?? 1,
          sonOdemeGunu: c.dueDay ?? 1,
          maskeliKartNo: extras.maskeliKartNo, // From localStorage (UI helper only)
          aktifMi: c.isActive,
          sonEkstreBorcu, // ALWAYS from backend
          guncelBorc, // ALWAYS from backend
        };
      });

      // DEBUG: Log final mapped values
      console.log('[BUG-1 DEBUG] handleSaveCreditCards - Final mapped cards:', JSON.stringify(mapped.map(c => ({
        id: c.id,
        name: c.kartAdi,
        sonEkstreBorcu: c.sonEkstreBorcu,
        guncelBorc: c.guncelBorc
      })), null, 2));

      // CRITICAL FIX BUG-1: Update both local and parent state with backend response
      // Backend is the source of truth - use its returned values
      setLocalCreditCards(mapped);
      setCreditCards(mapped); // Update parent state so onClose handler sees latest data
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
          // Create new loan - send only required fields
          const createPayload = {
            name: loan.name,
            bankId: loan.bankId,
            totalAmount: loan.totalAmount,
            installmentCount: loan.installmentCount,
            firstInstallmentDate: loan.firstInstallmentDate,
            annualInterestRate: loan.annualInterestRate,
            bsmvRate: loan.bsmvRate,
            isActive: loan.isActive !== undefined ? loan.isActive : true,
          };
          console.log('Creating loan with payload:', createPayload);
          await apiPost<Loan>('/api/loans', createPayload);
        } else {
          // Update existing loan - send only fields that can be updated
          const updatePayload = {
            name: loan.name,
            bankId: loan.bankId,
            totalAmount: loan.totalAmount,
            installmentCount: loan.installmentCount,
            firstInstallmentDate: loan.firstInstallmentDate,
            annualInterestRate: loan.annualInterestRate,
            bsmvRate: loan.bsmvRate,
            isActive: loan.isActive !== undefined ? loan.isActive : true,
          };
          console.log('Updating loan with payload:', updatePayload);
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

  // Customer handlers
  const handleSaveCustomers = async () => {
    setLoading(true);
    try {
      // CRITICAL FIX: Save to backend (single source of truth)
      // Convert frontend format to backend format
      const payload = localCustomers.map((c) => ({
        id: c.id,
        kod: c.kod,
        ad: c.ad,
        aktifMi: c.aktifMi,
      }));
      
      // Backend will reject empty array (400 Bad Request) to prevent accidental data loss
      const saved = await apiPost<Array<{
        id: string;
        name: string; // Backend format: "kod - ad"
        isActive: boolean;
      }>>('/api/customers/bulk-save', payload);
      
      // Convert backend response to frontend format
      const mappedCustomers: Customer[] = saved.map((c) => {
        const parts = c.name.split(' - ');
        const kod = parts[0] || '';
        const ad = parts.slice(1).join(' - ') || c.name;
        return {
          id: c.id,
          kod,
          ad,
          aktifMi: c.isActive,
        };
      });
      
      // Update both local and parent state (CRITICAL: must update both)
      setLocalCustomers(mappedCustomers);
      setCustomers(mappedCustomers);
      
      // Update localStorage cache (for offline/performance, not as source of truth)
      saveCustomersToStorage(mappedCustomers);
      
      setDirty(false);
      alert('Müşteriler başarıyla kaydedildi.');
    } catch (error: any) {
      console.error('Customers save error:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Müşteriler kaydedilirken bir hata oluştu.';
      alert(`Hata: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Supplier handlers
  const handleSaveSuppliers = async () => {
    setLoading(true);
    try {
      // Prepare payload for bulk save
      const payload = localSuppliers.map((s) => ({
        id: s.id,
        kod: s.kod,
        ad: s.ad,
        aktifMi: s.aktifMi ?? true,
      }));
      
      // Backend will reject empty array (400 Bad Request) to prevent accidental data loss
      const saved = await apiPost<Array<{
        id: string;
        name: string; // Backend format: "kod - ad"
        isActive: boolean;
      }>>('/api/suppliers/bulk-save', payload);
      
      // Convert backend response to frontend format
      const mappedSuppliers: Supplier[] = saved.map((s) => {
        const parts = s.name.split(' - ');
        const kod = parts[0] || '';
        const ad = parts.slice(1).join(' - ') || s.name;
        return {
          id: s.id,
          kod,
          ad,
          aktifMi: s.isActive,
        };
      });
      
      setLocalSuppliers(mappedSuppliers);
      setSuppliers(mappedSuppliers);
      setDirty(false);
      alert('Tedarikçiler başarıyla kaydedildi.');
    } catch (error: any) {
      console.error('Suppliers save error:', error);
      const errorMessage = error?.message || 'Tedarikçiler kaydedilirken bir hata oluştu.';
      alert(`Hata: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // POS handlers
  const handleSavePos = async () => {
    setLoading(true);
    try {
      // Prepare payload for bulk save
      const payload = localPosTerminals.map((p) => ({
        id: p.id,
        bankaId: p.bankaId,
        posAdi: p.posAdi,
        komisyonOrani: p.komisyonOrani,
        aktifMi: p.aktifMi ?? true,
      }));
      
      // Backend will reject empty array (400 Bad Request) to prevent accidental data loss
      const saved = await apiPost<Array<{
        id: string;
        bankId: string;
        name: string;
        commissionRate: number;
        isActive: boolean;
      }>>('/api/pos-terminals/bulk-save', payload);
      
      // Convert backend response to frontend format
      const mappedPosTerminals: PosTerminal[] = saved.map((p) => ({
        id: p.id,
        bankaId: p.bankId,
        posAdi: p.name,
        komisyonOrani: p.commissionRate,
        aktifMi: p.isActive,
      }));
      
      setLocalPosTerminals(mappedPosTerminals);
      setPosTerminals(mappedPosTerminals);
      setDirty(false);
      alert('POS terminalleri başarıyla kaydedildi.');
    } catch (error: any) {
      console.error('POS save error:', error);
      const errorMessage = error?.message || 'POS terminalleri kaydedilirken bir hata oluştu.';
      alert(`Hata: ${errorMessage}`);
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
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ayarlar"
      size="xl"
    >
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
                onSetBanks={setLocalBanks}
                onDirty={handleDirty}
              />
            )}
            {activeTab === 'POS' && (
              <PosTab
                terminals={localPosTerminals}
                banks={localBanks}
                onSetTerminals={setLocalPosTerminals}
                onDirty={handleDirty}
                onSave={handleSavePos}
                loading={loading}
              />
            )}
            {activeTab === 'MUSTERI' && (
              <CustomersTab
                customers={localCustomers}
                onSetCustomers={setLocalCustomers}
                onDirty={handleDirty}
                onSave={handleSaveCustomers}
                loading={loading}
              />
            )}
            {activeTab === 'TEDARIKCI' && (
              <SuppliersTab
                suppliers={localSuppliers}
                onSetSuppliers={setLocalSuppliers}
                onDirty={handleDirty}
                onSave={handleSaveSuppliers}
                loading={loading}
              />
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
    </Modal>
  );
};

export default AyarlarModal;
