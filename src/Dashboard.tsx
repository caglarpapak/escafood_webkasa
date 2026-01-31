import { useEffect, useMemo, useState, useRef } from 'react';
import { AppUser } from './models/user';
import { BankMaster } from './models/bank';
import { PosTerminal } from './models/pos';
import { Customer } from './models/customer';
import { Supplier } from './models/supplier';
import { CreditCard } from './models/card';
import { Loan } from './models/loan';
import { GlobalSettings } from './models/settings';
import { Cheque } from './models/cheque';
import { DailyTransaction, DailyTransactionSource, DailyTransactionType } from './models/transaction';
import { UpcomingPayment } from './models/upcomingPayment';
import { DashboardSummary } from './models/dashboard';
import { isoToDisplay, todayIso, getWeekdayTr, diffInDays, formatTRDate, formatTRDateTime } from './utils/date';
import { formatTl } from './utils/money';
import { getNextBelgeNo } from './utils/documentNo';
import { generateId } from './utils/id';
import { getCreditCardNextDue } from './utils/creditCard';
import { apiGet, apiPost, apiDelete } from './utils/api';
import { resolveDisplayAmounts } from './utils/transactionDisplay';
import { computeRunningBalance, BalanceContext } from './utils/balance';
import NakitGiris, { NakitGirisFormValues } from './forms/NakitGiris';
import NakitCikis, { NakitCikisFormValues } from './forms/NakitCikis';
import BankaNakitGiris, { BankaNakitGirisFormValues } from './forms/BankaNakitGiris';
import BankaNakitCikis, { BankaNakitCikisFormValues } from './forms/BankaNakitCikis';
import PosTahsilat, { PosTahsilatFormValues } from './forms/PosTahsilat';
import KrediKartiTedarikciOdeme, { KrediKartiTedarikciOdemeFormValues } from './forms/KrediKartiTedarikciOdeme';
import KrediKartiMasraf, { KrediKartiMasrafFormValues } from './forms/KrediKartiMasraf';
import CekIslemleriModal, { CekIslemPayload } from './forms/CekIslemleriModal';
import AyarlarModal from './forms/AyarlarModal';
import type { SettingsTabKey } from './forms/AyarlarModal';
import EpostaLogsModal from './forms/EpostaLogsModal';
import KullaniciAyarlarModal from './forms/KullaniciAyarlarModal';
import KrediKartiIzlemeModal from './forms/KrediKartiIzlemeModal';
import KasaDefteriView from './views/KasaDefteriView';
import { IslemLoguReport } from './reports/IslemLoguReport';
import { NakitAkisReport } from './reports/NakitAkisReport';
import { CekSenetReport } from './reports/CekSenetReport';

const BASE_CASH_BALANCE = 0;

type OpenFormKey =
  | null
  | 'NAKIT_GIRIS'
  | 'NAKIT_CIKIS'
  | 'BANKA_GIRIS'
  | 'BANKA_CIKIS'
  | 'POS_TAHSILAT'
  | 'KK_TEDARIKCI'
  | 'KK_MASRAF'
  | 'CEK_ISLEM'
  | 'AYARLAR'
  | 'EPOSTA_LOG'
  | 'KULLANICI_AYAR'
  | 'KK_IZLEME';

interface DashboardProps {
  currentUser: AppUser;
  onLogout: () => void;
}

type ActiveView = 'DASHBOARD' | 'KASA_DEFTERI' | 'ISLEM_LOGU' | 'NAKIT_AKIS' | 'CEK_SENET';

/**
 * Recalculate cash balances from transactions
 * IMPORTANT: Only transactions with source = KASA affect the main cash balance.
 * Bank transactions (source = BANKA) do NOT affect the main cash balance.
 */
function recalcBalances(transactions: DailyTransaction[]): DailyTransaction[] {
  // Filter to only KASA transactions for cash balance calculation
  const kasaTransactions = transactions.filter((tx) => tx.source === 'KASA');
  const sorted = [...kasaTransactions].sort((a, b) => {
    if (a.isoDate === b.isoDate) return a.documentNo.localeCompare(b.documentNo);
    return a.isoDate.localeCompare(b.isoDate);
  });
  let balance = BASE_CASH_BALANCE;
  const balanceMap = new Map<string, number>();
  
  // BUG 4 FIX: Calculate balance for each KASA transaction
  // Use displayIncoming/displayOutgoing if available, otherwise use incoming/outgoing
  // Test case: Start cash=0, Cash In 1000 → balance 1000, Cash Out 200 → balance 800, Cash Out 300 → balance 500
  // IMPORTANT: For balance calculation, use actual incoming/outgoing (not display values)
  // Display values are only for UI display, not for balance calculation
  for (const tx of sorted) {
    // BUG 4 FIX: Use actual incoming/outgoing for balance calculation (not display values)
    // Display values are for UI only, balance must use actual transaction amounts
    const incoming = tx.incoming ?? 0;
    const outgoing = tx.outgoing ?? 0;
    // BUG 4 FIX: Ensure correct sign - incoming increases balance, outgoing decreases balance
    balance += incoming - outgoing;
    balanceMap.set(tx.id, balance);
  }
  
  // Return all transactions, but only KASA transactions have balanceAfter updated
  // For non-KASA transactions, show the last KASA balance (they don't affect cash balance)
  const lastKasaBalance = balanceMap.size > 0 ? Array.from(balanceMap.values())[balanceMap.size - 1] : BASE_CASH_BALANCE;
  
  return transactions.map((tx) => {
    if (tx.source === 'KASA' && balanceMap.has(tx.id)) {
      return { ...tx, balanceAfter: balanceMap.get(tx.id)! };
    }
    // For non-KASA transactions, show the last KASA balance
    // These transactions don't affect cash balance
    return { ...tx, balanceAfter: lastKasaBalance };
  });
}

function mergeTransactions(
  existing: DailyTransaction[],
  additions: DailyTransaction[]
): DailyTransaction[] {
  // BUG 1 FIX: Use balanceAfter from backend, don't recalculate
  // Backend already calculates balanceAfter correctly starting from 0
  // Frontend recalcBalances uses BASE_CASH_BALANCE which causes inconsistency
  const duplicates = new Set(
    existing.map(
      (t) => `${t.isoDate}|${t.documentNo}|${t.type}|${t.incoming}|${t.outgoing}|${t.counterparty}`
    )
  );
  const filtered = additions.filter(
    (t) => !duplicates.has(`${t.isoDate}|${t.documentNo}|${t.type}|${t.incoming}|${t.outgoing}|${t.counterparty}`)
  );
  // BUG 1 FIX: Don't recalculate - use balanceAfter from backend
  // Sort by date, documentNo, and createdAtIso to maintain correct chronological order
  // This ensures that newly added transactions appear in the correct position
  // FIX: Sort by createdAtIso (creation time) to maintain correct chronological order
  // This ensures that newly added transactions appear in the order they were created
  // Primary sort: by creation timestamp (most reliable)
  const merged = [...existing, ...filtered].sort((a, b) => {
    const aCreated = a.createdAtIso || a.isoDate + 'T00:00:00';
    const bCreated = b.createdAtIso || b.isoDate + 'T00:00:00';
    const timeCompare = aCreated.localeCompare(bCreated);
    if (timeCompare !== 0) return timeCompare;
    
    // Secondary sort: by date (if same timestamp)
    if (a.isoDate !== b.isoDate) return a.isoDate.localeCompare(b.isoDate);
    
    // Tertiary sort: by documentNo (if same date and timestamp)
    return a.documentNo.localeCompare(b.documentNo);
  });
  
  // For non-KASA transactions, set balanceAfter to last KASA transaction's balanceAfter
  let lastKasaBalance = BASE_CASH_BALANCE;
  return merged.map((tx) => {
    if (tx.source === 'KASA') {
      // BUG 1 FIX: Use balanceAfter from backend (already calculated correctly)
      // Backend calculates: balance = 0 + Σ(incoming - outgoing) for KASA transactions
      lastKasaBalance = tx.balanceAfter ?? lastKasaBalance;
      return tx;
    }
    // For non-KASA transactions, show the last KASA balance
    return { ...tx, balanceAfter: lastKasaBalance };
  });
}

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [openForm, setOpenForm] = useState<OpenFormKey>(null);
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>('BANKALAR');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<ActiveView>('DASHBOARD');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  // Start with empty banks array - will be loaded from backend
  const [banks, setBanks] = useState<BankMaster[]>([]);
  const [posTerminals, setPosTerminals] = useState<PosTerminal[]>([]);

  // POS Terminals: Load from backend (authoritative source)
  useEffect(() => {
    const fetchPosTerminals = async () => {
      try {
        // Try backend first (authoritative source)
        const backendPosTerminals = await apiGet<Array<{
          id: string;
          bankId: string;
          name: string;
          commissionRate: number;
          isActive: boolean;
        }>>('/api/pos-terminals');
        
        // Convert backend format to frontend format
        const mappedPosTerminals: PosTerminal[] = backendPosTerminals.map((p) => ({
          id: p.id,
          bankaId: p.bankId,
          posAdi: p.name,
          komisyonOrani: p.commissionRate,
          aktifMi: p.isActive,
        }));
        
        setPosTerminals(mappedPosTerminals);
        
        // Cache in localStorage (optional, for offline fallback)
        try {
          localStorage.setItem('esca-webkasa-pos-terminals', JSON.stringify(mappedPosTerminals));
        } catch (e) {
          console.warn('Failed to update POS terminals cache in localStorage:', e);
        }
      } catch (error: any) {
        console.error('Failed to load POS terminals from backend:', error);
        // Fallback to localStorage if backend is unavailable
        try {
          const savedPosTerminals = localStorage.getItem('esca-webkasa-pos-terminals');
          if (savedPosTerminals) {
            const parsed = JSON.parse(savedPosTerminals);
            if (Array.isArray(parsed)) {
              setPosTerminals(parsed);
              console.warn('Using cached POS terminals from localStorage (backend unavailable)');
            }
          }
        } catch (e) {
          console.error('Failed to parse POS terminals from localStorage:', e);
        }
      }
    };
    
    fetchPosTerminals();
  }, []);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    varsayilanAsgariOdemeOrani: 0.4,
    varsayilanBsmvOrani: 0.05,
    yaklasanOdemeGun: 7,
  });
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [dailyTransactions, setDailyTransactions] = useState<DailyTransaction[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [cekInitialTab, setCekInitialTab] = useState<'GIRIS' | 'CIKIS' | 'YENI' | 'RAPOR'>('GIRIS');
  
  // Dashboard summary state (authoritative balance source)
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  // FINANCIAL INVARIANT: Balance context for "Gün İçi İşlemler" table
  // Default: KASA (cash balance) - only source=KASA transactions affect this balance
  const [balanceContext, setBalanceContext] = useState<BalanceContext>({ type: 'KASA' });
  const [selectedBankForBalance, setSelectedBankForBalance] = useState<string>('');

  // Fix Bug 6: Fetch credit cards from backend on mount
  useEffect(() => {
    const fetchCreditCards = async () => {
      try {
        console.log('Loading credit cards from backend...');
        // BUG-1 FIX: Backend contract - must include sonEkstreBorcu and manualGuncelBorc
        const backendCreditCards = await apiGet<Array<{
          id: string;
          name: string;
          bankId: string | null;
          limit: number | null;
          closingDay: number | null;
          dueDay: number | null;
          sonEkstreBorcu: number; // REQUIRED: Last statement balance from DB
          manualGuncelBorc: number | null; // REQUIRED: Manual current debt override (null = calculate from operations)
          isActive: boolean;
          currentDebt?: number; // Optional computed field
          availableLimit?: number | null; // Optional computed field
          lastOperationDate?: string | null;
        }>>('/api/credit-cards');

        console.log('Backend credit cards received:', backendCreditCards);

        // BUG-1 FIX: localStorage ONLY for UI helpers (maskeliKartNo, asgariOran), NOT for debt values
        const cardExtrasKey = 'esca-webkasa-card-extras';
        const savedExtras = localStorage.getItem(cardExtrasKey);
        const cardExtras: Record<string, { sonEkstreBorcu?: number; asgariOran: number; maskeliKartNo: string }> = savedExtras ? JSON.parse(savedExtras) : {};
        
        // BUG-1 FIX: Robust mapping with fallback - backend is authoritative source
        const mappedCreditCards: CreditCard[] = backendCreditCards.map((card) => {
          const limit = card.limit ?? null;
          const extras = cardExtras[card.id] || { asgariOran: 0.4, maskeliKartNo: '' };
          
          // BUG-1 FIX: Debt values from backend with fallback
          // sonEkstreBorcu: backend value or 0
          const sonEkstreBorcu = Number(card.sonEkstreBorcu ?? 0);
          
          // guncelBorc: manualGuncelBorc (backend) or currentDebt (computed) or null
          const guncelBorc = card.manualGuncelBorc !== null && card.manualGuncelBorc !== undefined 
            ? Number(card.manualGuncelBorc) 
            : (card.currentDebt !== undefined ? Number(card.currentDebt) : null);
          
          // kullanilabilirLimit: calculate from limit and guncelBorc
          const kullanilabilirLimit = limit !== null && guncelBorc !== null 
            ? limit - guncelBorc 
            : (card.availableLimit ?? null);

          return {
            id: card.id,
            bankaId: card.bankId || '',
            kartAdi: card.name,
            kartLimit: limit,
            limit: limit,
            kullanilabilirLimit: kullanilabilirLimit,
            asgariOran: extras.asgariOran, // From localStorage (UI helper only)
            hesapKesimGunu: card.closingDay ?? 1,
            sonOdemeGunu: card.dueDay ?? 1,
            maskeliKartNo: extras.maskeliKartNo, // From localStorage (UI helper only)
            aktifMi: card.isActive,
            sonEkstreBorcu, // From backend (authoritative)
            guncelBorc, // From backend (authoritative)
          };
        });

        console.log('Mapped credit cards:', mappedCreditCards);
        setCreditCards(mappedCreditCards);
      } catch (error: any) {
        console.error('Failed to load credit cards from backend:', error);
        // If backend is not running, don't show error to user - just use empty array
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
          console.warn('Backend server appears to be down. Credit cards will be empty until server is started.');
        }
        setCreditCards([]);
      }
    };

    fetchCreditCards();
  }, []);

  // Fetch loans from backend on mount
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const backendLoans = await apiGet<Loan[]>('/api/loans');
        setLoans(backendLoans);
      } catch (error: any) {
        console.error('Failed to load loans from backend:', error);
        // If backend is not running, don't show error to user - just use empty array
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
          console.warn('Backend server appears to be down. Loans will be empty until server is started.');
        }
        setLoans([]);
      }
    };

    fetchLoans();
  }, []);

  // Fetch banks from backend on mount
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        console.log('Loading banks from backend...');
        const backendBanks = await apiGet<Array<{
          id: string;
          name: string;
          accountNo: string | null;
          iban: string | null;
          isActive: boolean;
          currentBalance: number;
        }>>('/api/banks');
        
        console.log('Backend banks received:', backendBanks);
        
        if (backendBanks.length === 0) {
          console.warn('No banks found in database. Please create banks in the settings screen.');
          // Clear mock banks - user must create banks first
          setBanks([]);
          return;
        }
        
        // Map backend banks to frontend BankMaster format
        // Fix Bug 2: Load boolean flags from localStorage (they're not stored in backend)
        const bankFlagsKey = 'esca-webkasa-bank-flags';
        const savedFlags = localStorage.getItem(bankFlagsKey);
        const bankFlags: Record<string, { cekKarnesiVarMi: boolean; posVarMi: boolean; krediKartiVarMi: boolean }> = savedFlags ? JSON.parse(savedFlags) : {};
        
        const mappedBanks: BankMaster[] = backendBanks.map((bank) => {
          const flags = bankFlags[bank.id] || { cekKarnesiVarMi: false, posVarMi: false, krediKartiVarMi: false };
          return {
            id: bank.id, // Use the real UUID from database
            bankaAdi: bank.name,
            kodu: bank.accountNo ? bank.accountNo.substring(0, 4).toUpperCase() : 'BNK',
            hesapAdi: bank.name + (bank.accountNo ? ` - ${bank.accountNo}` : ''),
            iban: bank.iban || undefined,
            // BUG FIX: Use openingBalance (NOT currentBalance) for acilisBakiyesi
            // currentBalance = openingBalance + all bankDelta transactions
            // If we use currentBalance, it will be double-counted when we add openingBalancesSum
            acilisBakiyesi: (bank as any).openingBalance ?? 0,
            aktifMi: bank.isActive,
            // Fix Bug 2: Load boolean flags from localStorage
            cekKarnesiVarMi: flags.cekKarnesiVarMi,
            posVarMi: flags.posVarMi,
            krediKartiVarMi: flags.krediKartiVarMi,
          };
        });
        
        console.log('Mapped banks:', mappedBanks);
        setBanks(mappedBanks);
      } catch (error: any) {
        console.error('Failed to load banks from backend:', error);
        // If backend is not running, don't show error to user - just use empty array
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
          console.warn('Backend server appears to be down. Banks will be empty until server is started.');
        }
        // Clear mock banks on error - user must create banks first
        setBanks([]);
      }
    };
    
    fetchBanks();
  }, []);

  // CRITICAL FIX: Fetch customers from backend (single source of truth)
  // localStorage is only used as cache, not as primary source
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Try backend first (authoritative source)
        const backendCustomers = await apiGet<Array<{
          id: string;
          name: string; // Backend format: "kod - ad"
          phone: string | null;
          email: string | null;
          taxNo: string | null;
          address: string | null;
          isActive: boolean;
        }>>('/api/customers');
        
        // Convert backend format to frontend format
        // Backend name = "kod - ad", split to get kod and ad
        const mappedCustomers: Customer[] = backendCustomers.map((c) => {
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
        
        setCustomers(mappedCustomers);
        
        // Update localStorage cache (for offline/performance, not as source of truth)
        try {
          localStorage.setItem('esca-webkasa-customers', JSON.stringify(mappedCustomers));
        } catch (e) {
          console.warn('Failed to update customers cache in localStorage:', e);
        }
      } catch (error: any) {
        console.error('Failed to load customers from backend:', error);
        
        // Fallback: Try localStorage cache if backend is unavailable
        // But this is NOT the source of truth - just a temporary fallback
        if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
          console.warn('Backend unavailable, trying localStorage cache...');
          try {
            const savedCustomers = localStorage.getItem('esca-webkasa-customers');
            if (savedCustomers) {
              const parsed = JSON.parse(savedCustomers);
              if (Array.isArray(parsed)) {
                setCustomers(parsed);
                console.warn('Using cached customers from localStorage (backend unavailable)');
              }
            }
          } catch (e) {
            console.error('Failed to parse customers from localStorage:', e);
          }
        }
      }
    };
    
    fetchCustomers();
  }, []);

  // Suppliers: Load from backend (authoritative source)
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        // Try backend first (authoritative source)
        const backendSuppliers = await apiGet<Array<{
          id: string;
          name: string; // Backend format: "kod - ad"
          phone: string | null;
          email: string | null;
          taxNo: string | null;
          address: string | null;
          isActive: boolean;
        }>>('/api/suppliers');
        
        // Convert backend format to frontend format
        const mappedSuppliers: Supplier[] = backendSuppliers.map((s) => {
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
        
        setSuppliers(mappedSuppliers);
        
        // Cache in localStorage (optional, for offline fallback)
        try {
          localStorage.setItem('esca-webkasa-suppliers', JSON.stringify(mappedSuppliers));
        } catch (e) {
          console.warn('Failed to update suppliers cache in localStorage:', e);
        }
      } catch (error: any) {
        console.error('Failed to load suppliers from backend:', error);
        // Fallback to localStorage if backend is unavailable
        try {
          const savedSuppliers = localStorage.getItem('esca-webkasa-suppliers');
          if (savedSuppliers) {
            const parsed = JSON.parse(savedSuppliers);
            if (Array.isArray(parsed)) {
              setSuppliers(parsed);
              console.warn('Using cached suppliers from localStorage (backend unavailable)');
            }
          }
        } catch (e) {
          console.error('Failed to parse suppliers from localStorage:', e);
        }
      }
    };
    
    fetchSuppliers();
  }, []);

  // Load dashboard summary (authoritative balance source + upcoming payments)
  const loadDashboardSummary = async () => {
    setSummaryLoading(true);
    try {
      const summaryData = await apiGet<DashboardSummary>('/api/dashboard/summary');
      
      setSummary(summaryData);
      
      // NUCLEAR FIX: Use backend summary as single source of truth
      if (summaryData.upcomingPayments) {
        setUpcomingPayments(summaryData.upcomingPayments);
      } else {
        setUpcomingPayments([]);
      }
    } catch (error: any) {
      console.error('Failed to load dashboard summary:', error);
      // If backend is not running, don't show error to user - just use null
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
        console.warn('Backend server appears to be down. Dashboard summary will be unavailable until server is started.');
      }
      setSummary(null);
      setUpcomingPayments([]); // Fallback to empty array on error
    } finally {
      setSummaryLoading(false);
    }
  };

  // Refresh all data (summary + transactions)
  const refreshAll = async () => {
    await Promise.all([
      loadDashboardSummary(),
      (async () => {
        try {
          const today = todayIso();
          const response = await apiGet<{ items: any[]; totalCount: number }>(
            `/api/transactions?from=${today}&to=${today}&sortKey=isoDate&sortDir=asc`
          );
          const mapped = response.items.map((tx) => ({
            id: tx.id,
            isoDate: tx.isoDate,
            displayDate: isoToDisplay(tx.isoDate),
            documentNo: tx.documentNo || '',
            type: tx.type,
            source: tx.source,
            counterparty: tx.counterparty || '',
            description: tx.description || '',
            incoming: Number(tx.incoming) ?? 0,
            outgoing: Number(tx.outgoing) ?? 0,
            balanceAfter: Number(tx.balanceAfter) ?? 0,
            bankId: tx.bankId || undefined,
            bankDelta: tx.bankDelta !== undefined && tx.bankDelta !== null ? Number(tx.bankDelta) : undefined, // CRITICAL FIX: Preserve bankDelta including negative values (0 is falsy!)
            displayIncoming: tx.displayIncoming || undefined,
            displayOutgoing: tx.displayOutgoing || undefined,
            createdAtIso: tx.createdAt,
            createdBy: tx.createdBy,
            attachmentType: tx.attachmentType || undefined,
            attachmentImageDataUrl: tx.attachmentImageDataUrl || undefined,
            attachmentImageName: tx.attachmentImageName || undefined,
          }));
          
          const sorted = [...mapped].sort((a, b) => {
            const aCreated = a.createdAtIso || a.isoDate + 'T00:00:00';
            const bCreated = b.createdAtIso || b.isoDate + 'T00:00:00';
            return aCreated.localeCompare(bCreated);
          });
          setDailyTransactions(sorted);
        } catch (error) {
          console.error('Failed to refresh transactions:', error);
        }
      })(),
      // HEDEF-1 FIX: Refresh loans state so upcoming payments update immediately after loan payment
      (async () => {
        try {
          const backendLoans = await apiGet<Loan[]>('/api/loans');
          setLoans(backendLoans);
        } catch (error: any) {
          console.error('Failed to refresh loans:', error);
          // Don't show error to user - just log it
        }
      })(),
    ]);
  };

  // Load dashboard summary on mount
  useEffect(() => {
    loadDashboardSummary();
  }, []);

  // SINGLE SOURCE OF TRUTH FIX: Load cheques from backend on mount
  // This ensures cheques are available in reports and module from the start
  useEffect(() => {
    const loadCheques = async () => {
      try {
        // Backend returns ChequeListResponse with items array
        const response = await apiGet<{ items: any[]; totalCount: number }>('/api/cheques');
        // Map backend DTO to frontend Cheque format
        const mappedCheques: Cheque[] = response.items.map((c) => ({
          id: c.id,
          cekNo: c.cekNo,
          tutar: c.amount,
          vadeTarihi: c.maturityDate,
          bankaId: c.depositBankId || undefined, // Çeki tahsile verdiğimiz banka (bizim bankamız)
          bankaAdi: c.depositBank?.name || undefined, // Backend'den gelen deposit bank adı
          issuerBankName: c.issuerBankName || undefined, // Çeki düzenleyen banka adı
          // CRITICAL: drawerName ve payeeName backend'den korunmalı (tedarikçi/müşteri adı ile değiştirilmemeli)
          duzenleyen: c.drawerName || c.customer?.name || c.supplier?.name || '', // Backend'den gelen drawerName
          lehtar: c.payeeName || c.supplier?.name || c.customer?.name || `Çek ${c.cekNo}`, // Backend'den gelen payeeName
          musteriId: c.customerId || undefined,
          tedarikciId: c.supplierId || undefined,
          direction: c.direction,
          status: c.status as any,
          kasaMi: c.status === 'KASADA',
          aciklama: c.description || undefined,
          imageUrl: c.imageDataUrl || undefined,
          imageDataUrl: c.imageDataUrl || undefined,
        }));
        setCheques(mappedCheques);
      } catch (error) {
        console.error('Failed to load cheques from backend:', error);
        setCheques([]);
      }
    };
    loadCheques();
  }, []);

  // Fetch today's transactions from backend
  useEffect(() => {
    const fetchTodaysTransactions = async () => {
      try {
        const today = todayIso();
        const response = await apiGet<{ items: any[]; totalCount: number }>(
          `/api/transactions?from=${today}&to=${today}&sortKey=isoDate&sortDir=asc`
        );
        // Map backend response to frontend format
        const mapped = response.items.map((tx) => {
          // DEBUG: Log attachmentId from backend
          if (tx.type === 'POS_TAHSILAT_BRUT' || tx.type === 'POS_KOMISYONU' || 
              tx.type === 'KREDI_KARTI_HARCAMA' || tx.type === 'KREDI_KARTI_EKSTRE_ODEME' || 
              tx.type === 'KREDI_KARTI_MASRAF' || tx.type === 'CEK_GIRISI' || 
              tx.type === 'CEK_TAHSIL_BANKA' || tx.type === 'CEK_ODENMESI' || 
              tx.type === 'CEK_KARSILIKSIZ') {
            console.log('[Dashboard] Backend response - transaction:', {
              id: tx.id,
              type: tx.type,
              attachmentId: tx.attachmentId,
              attachmentIdType: typeof tx.attachmentId,
            });
          }
          return {
            id: tx.id,
            isoDate: tx.isoDate,
            displayDate: isoToDisplay(tx.isoDate),
            documentNo: tx.documentNo || '',
            type: tx.type,
            source: tx.source,
            counterparty: tx.counterparty || '',
            description: tx.description || '',
            incoming: Number(tx.incoming) ?? 0, // BUG 4 FIX: Use ?? instead of || to preserve 0
            outgoing: Number(tx.outgoing) ?? 0, // BUG 4 FIX: Use ?? instead of || to preserve 0
            balanceAfter: Number(tx.balanceAfter) ?? 0, // BUG 4 FIX: Use balanceAfter from backend (calculated correctly)
            bankId: tx.bankId || undefined,
            bankDelta: tx.bankDelta || undefined,
            displayIncoming: tx.displayIncoming || undefined,
            displayOutgoing: tx.displayOutgoing || undefined,
            createdAtIso: tx.createdAt,
            createdBy: tx.createdBy,
            attachmentId: tx.attachmentId ?? undefined, // Use ?? to preserve null (null means no attachment, undefined means not set)
          };
        });
        
        // FIX: Sort by createdAtIso (creation time) to show transactions in the order they were created
        // This ensures that transactions appear in chronological order, not by type or documentNo
        const sorted = [...mapped].sort((a, b) => {
          const aCreated = a.createdAtIso || a.isoDate + 'T00:00:00';
          const bCreated = b.createdAtIso || b.isoDate + 'T00:00:00';
          return aCreated.localeCompare(bCreated);
        });
        
        setDailyTransactions(sorted);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch today\'s transactions:', error);
        // Ensure empty array on error - no stale data
        setDailyTransactions([]);
      }
    };
    fetchTodaysTransactions();
  }, []);

  // UPCOMING PAYMENTS FIX: Backend summary is now the single source of truth
  // Removed buildUpcomingPayments useMemo - upcoming payments come directly from backend summary
  // This eliminates stale state issues when loan installments are paid

  // BUG-A FIX: Use backend summary as single source of truth for bank balances
  // Backend calculates bankDelta sum correctly (including POS_KOMISYONU negative values)
  // Frontend client-side calculation can miss transactions or have race conditions
  const bankDeltasById = useMemo(() => {
    // If we have backend summary, use it as authoritative source
    if (summary?.bankBalances) {
      const map: Record<string, number> = {};
      summary.bankBalances.forEach((bb) => {
        map[bb.bankId] = bb.balance; // This is already the sum of all bankDelta for this bank
      });
      return map;
    }
    
    // Fallback: Calculate from dailyTransactions if summary not available
    // This should only happen during initial load or if backend is down
    return dailyTransactions.reduce((map, tx) => {
      if (tx.bankId && tx.bankDelta !== undefined && tx.bankDelta !== null) {
        map[tx.bankId] = (map[tx.bankId] || 0) + tx.bankDelta;
      }
      return map;
    }, {} as Record<string, number>);
  }, [summary?.bankBalances, dailyTransactions]);

  // BUG-A FIX: Use backend summary totalBankBalance as single source of truth
  // This ensures POS_KOMISYONU and all other bankDelta transactions are correctly included
  const totalBanksBalance = useMemo(() => {
    // If we have backend summary, use its totalBankBalance (authoritative)
    if (summary?.totalBankBalance !== undefined) {
      // Backend totalBankBalance is sum of bankDelta only (doesn't include opening balances)
      // We need to add opening balances from frontend banks state
      const openingBalancesSum = banks
        .filter((b) => b.aktifMi)
        .reduce((sum, b) => sum + (b.acilisBakiyesi || 0), 0);
      return summary.totalBankBalance + openingBalancesSum;
    }
    
    // Fallback: Calculate from banks + bankDeltasById if summary not available
    return banks
      .filter((b) => b.aktifMi)
      .reduce((sum, b) => sum + (b.acilisBakiyesi || 0) + (bankDeltasById[b.id] || 0), 0);
  }, [summary?.totalBankBalance, banks, bankDeltasById]);

  // Cash balance from authoritative backend summary (not client-side calculation)
  const cashBalance = summary?.cashBalance ?? BASE_CASH_BALANCE;

  const chequesInCash = cheques.filter((c) => c.status === 'KASADA');
  const chequesTotal = chequesInCash.reduce((sum, c) => sum + c.tutar, 0);

  // TARİH / SAAT SÖZLEŞMESİ - 5.3: Gün içi işlemler başlığı
  // Asla new Date() kullanmaz
  // Liste hangi transactionDate'i gösteriyorsa başlık da onu gösterir
  // "Sabah yanlış, sonra düzeliyor" bug'ı bu şekilde kapanır
  const today = todayIso();

  // State to store opening balance (balance before today) from backend
  const [openingBalance, setOpeningBalance] = useState<number | null>(null);
  // State to store total bank opening balance (balance before today) from backend
  const [totalBankOpeningBalance, setTotalBankOpeningBalance] = useState<number | null>(null);
  // State to store bank opening balances (balance before today) from backend - Map of bankId -> balance
  const [bankOpeningBalances, setBankOpeningBalances] = useState<Map<string, number>>(new Map());

  const todaysTransactions = useMemo(
    () => dailyTransactions.filter((tx) => tx.isoDate === today),
    [dailyTransactions, today]
  );
  
  // Get the transactionDate from the first transaction (if any) or use today
  // This ensures the title always matches what's shown in the list
  const displayedDate = useMemo(() => {
    if (todaysTransactions.length > 0) {
      // Use the transactionDate from the first transaction
      return todaysTransactions[0].isoDate;
    }
    // If no transactions, use today (but this should match the filter)
    return today;
  }, [todaysTransactions, today]);

  // Fetch opening balance from backend (balance before today)
  useEffect(() => {
    const fetchOpeningBalance = async () => {
      try {
        // Get the last KASA transaction before today to get the closing balance of previous day
        // We'll get all transactions up to today, then filter to get the last one before today
        const response = await apiGet<{ items: any[]; totalCount: number }>(
          `/api/transactions?source=KASA&to=${today}&sortKey=isoDate&sortDir=desc&pageSize=100`
        );
        
        // Filter to get transactions before today
        const beforeToday = response.items.filter(tx => tx.isoDate < today);
        
        if (beforeToday.length > 0) {
          // Get the last transaction before today (already sorted desc by isoDate)
          const lastBeforeToday = beforeToday[0];
          setOpeningBalance(Number(lastBeforeToday.balanceAfter) ?? 0);
        } else {
          // No transactions before today, opening balance is 0
          setOpeningBalance(0);
        }
      } catch (error) {
        console.error('Failed to fetch opening balance:', error);
        setOpeningBalance(0); // Fallback to 0 on error
      }
    };
    
    const fetchTotalBankOpeningBalance = async () => {
      try {
        // Get all bank transactions before today to calculate total bank balance
        // Backend API has a max pageSize of 500, so we use that
        const response = await apiGet<{ items: any[]; totalCount: number }>(
          `/api/transactions?to=${today}&sortKey=isoDate&sortDir=desc&pageSize=500`
        );
        
        // Filter to get transactions before today that have bankDelta
        const beforeToday = response.items.filter(
          tx => tx.isoDate < today && tx.bankDelta !== undefined && tx.bankDelta !== null
        );
        
        // Calculate bank opening balances per bank
        const bankBalancesMap = new Map<string, number>();
        
        // Initialize with opening balances
        banks.forEach(bank => {
          if (bank.aktifMi) {
            bankBalancesMap.set(bank.id, bank.acilisBakiyesi || 0);
          }
        });
        
        // Add bankDelta values from before today
        beforeToday.forEach(tx => {
          if (tx.bankId) {
            const currentBalance = bankBalancesMap.get(tx.bankId) || 0;
            bankBalancesMap.set(tx.bankId, currentBalance + (Number(tx.bankDelta) || 0));
          }
        });
        
        setBankOpeningBalances(bankBalancesMap);
        
        // Sum all bankDelta values from before today for total
        const totalBankDelta = beforeToday.reduce((sum, tx) => sum + (Number(tx.bankDelta) || 0), 0);
        
        // Total bank opening balance = sum of all bank opening balances + sum of all bankDelta before today
        const totalOpening = banks.filter(b => b.aktifMi).reduce((sum, b) => sum + (b.acilisBakiyesi || 0), 0);
        setTotalBankOpeningBalance(totalOpening + totalBankDelta);
      } catch (error) {
        console.error('Failed to fetch total bank opening balance:', error);
        // Fallback: calculate from banks only (without bankDelta)
        const bankBalancesMap = new Map<string, number>();
        banks.forEach(bank => {
          if (bank.aktifMi) {
            bankBalancesMap.set(bank.id, bank.acilisBakiyesi || 0);
          }
        });
        setBankOpeningBalances(bankBalancesMap);
        const totalOpening = banks.filter(b => b.aktifMi).reduce((sum, b) => sum + (b.acilisBakiyesi || 0), 0);
        setTotalBankOpeningBalance(totalOpening);
      }
    };
    
    fetchOpeningBalance();
    fetchTotalBankOpeningBalance();
  }, [today, banks]);

  // FINANCIAL INVARIANT: Calculate initial balance (carryover from previous day)
  // This is the balance before today's transactions
  const initialBalance = useMemo(() => {
    if (balanceContext.type === 'KASA') {
      // For KASA context, use opening balance from backend
      // If not loaded yet, fallback to calculating from dailyTransactions (though it should be empty for before today)
      if (openingBalance !== null) {
        return openingBalance;
      }
      // Fallback: Calculate from dailyTransactions (should be 0 since dailyTransactions only has today's transactions)
      const beforeToday = dailyTransactions
        .filter(tx => tx.isoDate < today && tx.source === 'KASA')
        .sort((a, b) => {
          const aCreated = a.createdAtIso || a.isoDate + 'T00:00:00';
          const bCreated = b.createdAtIso || b.isoDate + 'T00:00:00';
          return aCreated.localeCompare(bCreated);
        });
      return beforeToday.reduce((sum, tx) => sum + (tx.incoming || 0) - (tx.outgoing || 0), BASE_CASH_BALANCE);
    } else if (balanceContext.type === 'BANKA') {
      // For bank context, use bank opening balance from backend
      // If not loaded yet, fallback to calculating from banks only (without bankDelta)
      if (bankOpeningBalances.has(balanceContext.bankId)) {
        return bankOpeningBalances.get(balanceContext.bankId) || 0;
      }
      // Fallback: Calculate from banks only (should be incomplete since dailyTransactions only has today's transactions)
      const bank = banks.find(b => b.id === balanceContext.bankId);
      const bankOpeningBalance = bank?.acilisBakiyesi || 0;
      const beforeToday = dailyTransactions
        .filter(tx => tx.isoDate < today && tx.bankId === balanceContext.bankId && tx.bankDelta !== undefined && tx.bankDelta !== null)
        .reduce((sum, tx) => sum + (tx.bankDelta || 0), 0);
      return bankOpeningBalance + beforeToday;
    } else if (balanceContext.type === 'BANKA_TOPLAM') {
      // For total bank context, use total bank opening balance from backend
      // If not loaded yet, fallback to calculating from banks only (without bankDelta)
      if (totalBankOpeningBalance !== null) {
        return totalBankOpeningBalance;
      }
      // Fallback: Calculate from banks only (should be incomplete since dailyTransactions only has today's transactions)
      const totalOpening = banks.filter(b => b.aktifMi).reduce((sum, b) => sum + (b.acilisBakiyesi || 0), 0);
      const beforeToday = dailyTransactions
        .filter(tx => tx.isoDate < today && tx.bankDelta !== undefined && tx.bankDelta !== null)
        .reduce((sum, tx) => sum + (tx.bankDelta || 0), 0);
      return totalOpening + beforeToday;
    }
    return 0;
  }, [balanceContext, dailyTransactions, today, banks, openingBalance, totalBankOpeningBalance, bankOpeningBalances]);

  // FINANCIAL INVARIANT: Compute context-aware running balance for today's transactions
  // This ensures credit card transactions don't affect KASA balance
  const todaysBalanceMap = useMemo(() => {
    // Sort transactions chronologically (by createdAtIso or isoDate)
    const sorted = [...todaysTransactions].sort((a, b) => {
      const aCreated = a.createdAtIso || a.isoDate + 'T00:00:00';
      const bCreated = b.createdAtIso || b.isoDate + 'T00:00:00';
      return aCreated.localeCompare(bCreated);
    });
    
    return computeRunningBalance(sorted, balanceContext, initialBalance);
  }, [todaysTransactions, balanceContext, initialBalance]);

  const toggleSection = (key: string) => {
    setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBackToDashboard = () => setActiveView('DASHBOARD');

  const addTransactions = (newOnes: DailyTransaction[]) => {
    setDailyTransactions((prev) => mergeTransactions(prev, newOnes));
  };

  const handleNakitGirisSaved = async (values: NakitGirisFormValues) => {
    try {
    const documentNo = getNextBelgeNo('NKT-GRS', values.islemTarihiIso, dailyTransactions);
    const foundCustomer = values.muhatapId ? customers.find((c) => c.id === values.muhatapId) : undefined;
    const counterparty =
      (foundCustomer && `${foundCustomer.kod} - ${foundCustomer.ad}`) || values.muhatap || 'Diğer';
      const isBankToCash = values.kaynak === 'KASA_TRANSFER_BANKADAN';
      
      console.log('handleNakitGirisSaved - values:', values);
      console.log('handleNakitGirisSaved - isBankToCash:', isBankToCash);
      console.log('handleNakitGirisSaved - values.bankaId:', values.bankaId);
      
      // Validate bankId for BANKA_KASA_TRANSFER
      if (isBankToCash) {
        if (!values.bankaId || !values.bankaId.trim()) {
          alert('Banka transferi için banka seçmelisiniz.');
          return;
        }
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const trimmedBankId = values.bankaId.trim();
        if (!uuidRegex.test(trimmedBankId)) {
          console.error('Invalid bankId format:', trimmedBankId);
          alert('Geçersiz banka ID formatı.');
          return;
        }
      }
      
      // Prepare payload
      // Note: BANKA_KASA_TRANSFER_IN requires source='KASA' and bankDelta=0
      // Backend will create two transactions (OUT for bank, IN for cash) automatically
      const payload = {
        isoDate: values.islemTarihiIso,
        documentNo,
        type: isBankToCash ? 'BANKA_KASA_TRANSFER_IN' : 'NAKIT_TAHSILAT',
        source: 'KASA', // BANKA_KASA_TRANSFER_IN must have source=KASA to affect cash balance
        counterparty,
        description: values.aciklama || null,
        incoming: values.tutar,
        outgoing: 0,
        bankDelta: 0, // CRITICAL: KASA source requires bankDelta=0 (backend creates transfer transactions separately)
        bankId: isBankToCash && values.bankaId ? values.bankaId.trim() : null,
      };
      
      console.log('handleNakitGirisSaved - payload:', payload);
      
      // Send to backend
      const response = await apiPost<{
        id: string;
        isoDate: string;
        documentNo: string | null;
        type: DailyTransactionType;
        source: DailyTransactionSource;
        counterparty: string | null;
        description: string | null;
        incoming: number;
        outgoing: number;
        balanceAfter: number;
        bankId: string | null;
        bankDelta: number;
        createdAt: string;
        createdBy: string;
      }>('/api/transactions', payload);

      // Map backend response to frontend format
      const tx: DailyTransaction = {
        id: response.id,
        isoDate: response.isoDate,
        displayDate: isoToDisplay(response.isoDate),
        documentNo: response.documentNo || '',
        type: response.type,
        source: response.source,
        counterparty: response.counterparty || '',
        description: response.description || '',
        incoming: response.incoming,
        outgoing: response.outgoing,
        balanceAfter: response.balanceAfter,
        bankId: response.bankId || undefined,
        bankDelta: response.bankDelta || undefined,
        createdAtIso: response.createdAt,
        createdBy: response.createdBy,
    };
      // Refresh summary and transactions after successful save
      await refreshAll();
      
      setOpenForm(null);
    } catch (error: any) {
      console.error('Failed to save nakit giris:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'İşlem kaydedilemedi. Lütfen tekrar deneyin.';
      alert(`Hata: ${errorMessage}`);
    }
  };

  const handleNakitCikisSaved = async (values: NakitCikisFormValues) => {
    try {
    const documentNo = getNextBelgeNo('NKT-CKS', values.islemTarihiIso, dailyTransactions);
    const foundSupplier = values.muhatapId ? suppliers.find((s) => s.id === values.muhatapId) : undefined;
    const counterparty =
      (foundSupplier && `${foundSupplier.kod} - ${foundSupplier.ad}`) || values.muhatap || 'Diğer';
      const isCashToBank = values.kaynak === 'KASA_TRANSFER_BANKAYA';
      
      // Prepare payload
      // Note: KASA_BANKA_TRANSFER_OUT requires source='KASA' and bankDelta=0
      // Backend will create two transactions (OUT for cash, IN for bank) automatically
      // NAKIT_ODEME requires source='KASA' for cash out
      const payload = {
      isoDate: values.islemTarihiIso,
      documentNo,
        type: isCashToBank ? 'KASA_BANKA_TRANSFER_OUT' : 'NAKIT_ODEME',
        source: 'KASA', // Both types require source=KASA for cash balance calculation
      counterparty,
        description: values.aciklama || null,
      incoming: 0,
        outgoing: values.tutar, // Fix: Set outgoing = amount for cash out
        bankDelta: 0, // CRITICAL: KASA source requires bankDelta=0 (backend creates transfer transactions separately)
        bankId: isCashToBank && values.bankaId ? values.bankaId : null,
      };
      
      console.log('NakitCikis payload:', payload);
      
      // Send to backend
      const response = await apiPost<{
        id: string;
        isoDate: string;
        documentNo: string | null;
        type: DailyTransactionType;
        source: DailyTransactionSource;
        counterparty: string | null;
        description: string | null;
        incoming: number;
        outgoing: number;
        balanceAfter: number;
        bankId: string | null;
        bankDelta: number;
        createdAt: string;
        createdBy: string;
      }>('/api/transactions', payload);

      // FIX: Refresh immediately to ensure cashBalance updates correctly for cash out transactions
      // This ensures that the new transaction's balanceAfter is included in the refresh
      // IMPORTANT: Refresh ALL KASA transactions (not just today) to get correct balance
      const today = todayIso();
      try {
        // Get all transactions from the beginning to ensure we have complete history for balance calculation
        // But for display, we'll still filter to today's transactions
        const refreshResponse = await apiGet<{ items: any[]; totalCount: number }>(
          `/api/transactions?from=${today}&to=${today}&sortKey=isoDate&sortDir=asc`
        );
        const refreshed = refreshResponse.items.map((tx) => ({
          id: tx.id,
          isoDate: tx.isoDate,
          displayDate: isoToDisplay(tx.isoDate),
          documentNo: tx.documentNo || '',
          type: tx.type,
          source: tx.source, // Backend returns storedSource as 'source'
          counterparty: tx.counterparty || '',
          description: tx.description || '',
          incoming: tx.incoming,
          outgoing: tx.outgoing,
          balanceAfter: Number(tx.balanceAfter) ?? 0, // Ensure balanceAfter is a number
          bankId: tx.bankId || undefined,
          bankDelta: tx.bankDelta || undefined,
          displayIncoming: tx.displayIncoming || undefined,
          displayOutgoing: tx.displayOutgoing || undefined,
          createdAtIso: tx.createdAt,
          createdBy: tx.createdBy,
        }));
        
        console.log('NakitCikis refresh - refreshed transactions:', refreshed);
        console.log('NakitCikis refresh - KASA transactions:', refreshed.filter(tx => tx.source === 'KASA'));
        
        // FIX: Sort by createdAtIso (creation time) to show transactions in the order they were created
        const sorted = [...refreshed].sort((a, b) => {
          const aCreated = a.createdAtIso || a.isoDate + 'T00:00:00';
          const bCreated = b.createdAtIso || b.isoDate + 'T00:00:00';
          return aCreated.localeCompare(bCreated);
        });
        
        // Update state - this will trigger cashBalance recalculation
        setDailyTransactions(sorted);
      } catch (refreshError) {
        console.error('Failed to refresh transactions:', refreshError);
        // Fallback: Map backend response to frontend format and add directly
        const tx: DailyTransaction = {
          id: response.id,
          isoDate: response.isoDate,
          displayDate: isoToDisplay(response.isoDate),
          documentNo: response.documentNo || '',
          type: response.type,
          source: response.source, // Backend returns storedSource as 'source'
          counterparty: response.counterparty || '',
          description: response.description || '',
          incoming: response.incoming,
          outgoing: response.outgoing,
          balanceAfter: Number(response.balanceAfter) ?? 0,
          bankId: response.bankId || undefined,
          bankDelta: response.bankDelta || undefined,
          createdAtIso: response.createdAt,
          createdBy: response.createdBy,
    };
    console.log('NakitCikis fallback - adding transaction:', tx);
    addTransactions([tx]);
      }
      
      // Refresh banks to update bank balances
      try {
        const backendBanks = await apiGet<Array<{
          id: string;
          name: string;
          accountNo: string | null;
          iban: string | null;
          isActive: boolean;
          currentBalance: number;
        }>>('/api/banks');
        
        const bankFlagsKey = 'esca-webkasa-bank-flags';
        const savedFlags = localStorage.getItem(bankFlagsKey);
        const bankFlags: Record<string, { cekKarnesiVarMi: boolean; posVarMi: boolean; krediKartiVarMi: boolean }> = savedFlags ? JSON.parse(savedFlags) : {};
        
        const mappedBanks: BankMaster[] = backendBanks.map((bank) => {
          const flags = bankFlags[bank.id] || { cekKarnesiVarMi: false, posVarMi: false, krediKartiVarMi: false };
          return {
            id: bank.id,
            bankaAdi: bank.name,
            kodu: bank.accountNo ? bank.accountNo.substring(0, 4).toUpperCase() : 'BNK',
            hesapAdi: bank.name + (bank.accountNo ? ` - ${bank.accountNo}` : ''),
            iban: bank.iban || undefined,
            // BUG FIX: Use openingBalance (NOT currentBalance) for acilisBakiyesi
            acilisBakiyesi: (bank as any).openingBalance ?? 0,
            aktifMi: bank.isActive,
            cekKarnesiVarMi: flags.cekKarnesiVarMi,
            posVarMi: flags.posVarMi,
            krediKartiVarMi: flags.krediKartiVarMi,
          };
        });
        setBanks(mappedBanks);
      } catch (bankRefreshError) {
        console.error('Failed to refresh banks:', bankRefreshError);
        // Continue anyway
      }
      
      // Refresh summary and transactions after successful save
      await refreshAll();
      
      setOpenForm(null);
    } catch (error: any) {
      console.error('Failed to save nakit cikis:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        stack: error?.stack,
      });
      const errorMessage = error?.message || error?.response?.data?.message || 'İşlem kaydedilemedi. Lütfen tekrar deneyin.';
      alert(`Hata: ${errorMessage}`);
    }
  };

  const handleBankaNakitGirisSaved = async (values: BankaNakitGirisFormValues) => {
    try {
    const documentNo = getNextBelgeNo('BNK-GRS', values.islemTarihiIso, dailyTransactions);
    const foundCustomer = values.muhatapId ? customers.find((c) => c.id === values.muhatapId) : undefined;
    const foundSupplier = values.muhatapId ? suppliers.find((s) => s.id === values.muhatapId) : undefined;
    const counterparty =
      (foundCustomer && `${foundCustomer.kod} - ${foundCustomer.ad}`) ||
      (foundSupplier && `${foundSupplier.kod} - ${foundSupplier.ad}`) ||
      values.muhatap ||
      'Diğer';
          // Fix Bug 3: Bank cash in should use NAKIT_TAHSILAT type with incoming = amount
    const type: DailyTransactionType =
            values.islemTuru === 'CEK_TAHSILATI' ? 'CEK_TAHSIL_BANKA' : 'NAKIT_TAHSILAT';

          // Validate bankId is present and exists in the banks array
          if (!values.bankaId || !values.bankaId.trim()) {
            alert('Banka seçmelisiniz.');
            return;
          }

          // Verify the selected bank exists in the loaded banks array
          // If not found, reload from backend to ensure we have the latest bank data
          let selectedBank = banks.find((b) => b.id === values.bankaId.trim());
          if (!selectedBank) {
            // Try to reload banks from backend in case they're stale
            try {
              console.log('Bank not found in local array, reloading from backend...');
              const backendBanks = await apiGet<Array<{
                id: string;
                name: string;
                accountNo: string | null;
                iban: string | null;
                isActive: boolean;
                currentBalance: number;
              }>>('/api/banks');

              const mappedBanks: BankMaster[] = backendBanks.map((bank) => ({
                id: bank.id, // This is the real Bank.id from Prisma
                bankaAdi: bank.name,
                kodu: bank.accountNo ? bank.accountNo.substring(0, 4).toUpperCase() : 'BNK',
                hesapAdi: bank.name + (bank.accountNo ? ` - ${bank.accountNo}` : ''),
                iban: bank.iban || undefined,
                // BUG FIX: Use openingBalance (NOT currentBalance) for acilisBakiyesi
                acilisBakiyesi: (bank as any).openingBalance ?? 0,
                aktifMi: bank.isActive,
                cekKarnesiVarMi: false,
                posVarMi: false,
                krediKartiVarMi: false,
              }));

              setBanks(mappedBanks);

              // Check again after reload
              selectedBank = mappedBanks.find((b) => b.id === values.bankaId.trim());
              if (!selectedBank) {
                alert(`Seçilen banka (ID: ${values.bankaId}) veritabanında bulunamadı. Lütfen geçerli bir banka seçin.\n\nMevcut bankalar:\n${mappedBanks.map(b => `- ${b.hesapAdi} (${b.id})`).join('\n')}`);
                console.error('Selected bank ID not found even after reload:', values.bankaId);
                console.error('Available banks after reload:', mappedBanks.map(b => ({ id: b.id, name: b.hesapAdi })));
                return;
              }

              // Bank found after reload, continue with transaction
              console.log('Bank found after reload:', selectedBank.hesapAdi, 'ID:', selectedBank.id);
            } catch (reloadError) {
              alert('Banka bilgileri yüklenirken hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
              console.error('Failed to reload banks:', reloadError);
              return;
            }
          }

          // At this point, selectedBank is guaranteed to exist and have the real Bank.id
          console.log('Using bank:', selectedBank.hesapAdi, 'with ID:', selectedBank.id);

          // Use the verified bank's ID (guaranteed to be the real Bank.id from Prisma)
          // This ensures we always send the correct ID, even if values.bankaId somehow got corrupted
          const normalizedBankId = selectedBank.id.trim();

          // Ensure bankId is a valid UUID format (Bank.id is String @id @default(uuid()) in schema)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(normalizedBankId)) {
            alert(`Geçersiz banka ID formatı: ${normalizedBankId}. Lütfen geçerli bir banka seçin.`);
            console.error('Invalid bank ID format:', normalizedBankId);
            return;
          }

          console.log('Sending transaction with bankId:', normalizedBankId, 'for bank:', selectedBank.hesapAdi);

          // BUG 2 FIX: Bank cash in - type: NAKIT_TAHSILAT, source: BANKA
          // Backend normalizes: incoming=0, outgoing=0, bankDelta=+amount
          // But we need displayIncoming=+amount for UI display
          const response = await apiPost<{
            id: string;
            isoDate: string;
            documentNo: string | null;
            type: DailyTransactionType;
            source: DailyTransactionSource;
            counterparty: string | null;
            description: string | null;
            incoming: number;
            outgoing: number;
            balanceAfter: number;
            bankId: string | null;
            bankDelta: number;
            displayIncoming: number | null;
            displayOutgoing: number | null;
            createdAt: string;
            createdBy: string;
          }>('/api/transactions', {
      isoDate: values.islemTarihiIso,
      documentNo,
      type,
      source: 'BANKA',
      counterparty,
            description: values.aciklama || null,
            incoming: 0, // CRITICAL: BANKA source requires incoming=0 (only bankDelta is used)
      outgoing: 0, // CRITICAL: BANKA source requires outgoing=0 (only bankDelta is used)
            bankDelta: values.tutar, // BANKA source: only bankDelta is used for bank balance
            displayIncoming: values.tutar, // BUG 2 FIX: Show amount in UI
            displayOutgoing: null,
            bankId: normalizedBankId,
          });

      // Backend'den gelen transaction'ı frontend formatına çevir
      // BUG 2 FIX: Include displayIncoming and displayOutgoing for bank transactions
      const tx: DailyTransaction = {
        id: response.id,
        isoDate: response.isoDate,
        displayDate: isoToDisplay(response.isoDate),
        documentNo: response.documentNo || '',
        type: response.type,
        source: response.source,
        counterparty: response.counterparty || '',
        description: response.description || '',
        incoming: response.incoming,
        outgoing: response.outgoing,
        balanceAfter: response.balanceAfter,
        bankId: response.bankId || undefined,
        bankDelta: response.bankDelta || undefined,
        displayIncoming: response.displayIncoming ?? undefined, // BUG 2 FIX: Preserve displayIncoming for bank cash in
        displayOutgoing: response.displayOutgoing ?? undefined, // BUG 2 FIX: Preserve displayOutgoing for bank cash out
        createdAtIso: response.createdAt,
        createdBy: response.createdBy,
      };

    if (values.islemTuru === 'CEK_TAHSILATI' && values.cekId) {
        setCheques((prev) => prev.map((c) => (c.id === values.cekId ? { ...c, status: 'TAHSIL_EDILDI' } : c)));
    }

    // Refresh summary and transactions after successful save
    await refreshAll();
    
    setOpenForm(null);
    } catch (error: any) {
      alert(`Hata: ${error.message || 'Banka nakit girişi kaydedilemedi'}`);
    }
  };

  const handleBankaNakitCikisSaved = async (values: BankaNakitCikisFormValues) => {
    try {
      // Validate bankId is a valid UUID string
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!values.bankaId || !values.bankaId.trim()) {
        alert('Banka seçmelisiniz.');
        return;
      }
      const normalizedBankId = values.bankaId.trim();
      if (!uuidRegex.test(normalizedBankId)) {
        alert('Geçersiz banka ID formatı.');
        return;
      }

    if (values.islemTuru === 'VIRMAN' && values.hedefBankaId) {
        if (!values.hedefBankaId.trim() || !uuidRegex.test(values.hedefBankaId.trim())) {
          alert('Geçersiz hedef banka ID formatı.');
          return;
        }
        const normalizedHedefBankId = values.hedefBankaId.trim();

      const documentNoCks = getNextBelgeNo('BNK-CKS', values.islemTarihiIso, dailyTransactions);
      const documentNoGrs = getNextBelgeNo('BNK-GRS', values.islemTarihiIso, [
        ...dailyTransactions,
        { documentNo: documentNoCks } as DailyTransaction,
      ]);

        // Backend'e kaydet - çıkış transaction'ı
        const outResponse = await apiPost<{
          id: string;
          isoDate: string;
          documentNo: string | null;
          type: DailyTransactionType;
          source: DailyTransactionSource;
          counterparty: string | null;
          description: string | null;
          incoming: number;
          outgoing: number;
          balanceAfter: number;
          bankId: string | null;
          bankDelta: number;
          createdAt: string;
          createdBy: string;
        }>('/api/transactions', {
        isoDate: values.islemTarihiIso,
        documentNo: documentNoCks,
        type: 'BANKA_HAVALE_CIKIS',
        source: 'BANKA',
        counterparty: values.muhatap || 'Virman',
          description: values.aciklama || null,
        incoming: 0, // CRITICAL: BANKA source requires incoming=0 (only bankDelta is used)
          outgoing: 0, // CRITICAL: BANKA source requires outgoing=0 (only bankDelta is used)
        bankDelta: -values.tutar, // BANKA source: only bankDelta is used for bank balance
          bankId: normalizedBankId,
        });

        // Backend'e kaydet - giriş transaction'ı
        const inResponse = await apiPost<{
          id: string;
          isoDate: string;
          documentNo: string | null;
          type: DailyTransactionType;
          source: DailyTransactionSource;
          counterparty: string | null;
          description: string | null;
          incoming: number;
          outgoing: number;
          balanceAfter: number;
          bankId: string | null;
          bankDelta: number;
          displayIncoming: number | null;
          displayOutgoing: number | null;
          createdAt: string;
          createdBy: string;
        }>('/api/transactions', {
        isoDate: values.islemTarihiIso,
        documentNo: documentNoGrs,
        type: 'BANKA_HAVALE_GIRIS',
        source: 'BANKA',
        counterparty: values.muhatap || 'Virman',
        description: `Virman - Kaynak İşlem: ${documentNoCks}`,
        incoming: 0,
        outgoing: 0,
        bankDelta: values.tutar,
          displayIncoming: values.tutar, // FIX: Show incoming amount for virman giriş transaction
          displayOutgoing: null,
          bankId: normalizedHedefBankId,
        });

        // Backend'den gelen transaction'ları frontend formatına çevir
        const outTx: DailyTransaction = {
          id: outResponse.id,
          isoDate: outResponse.isoDate,
          displayDate: isoToDisplay(outResponse.isoDate),
          documentNo: outResponse.documentNo || '',
          type: outResponse.type,
          source: outResponse.source,
          counterparty: outResponse.counterparty || '',
          description: outResponse.description || '',
          incoming: outResponse.incoming,
          outgoing: outResponse.outgoing,
          balanceAfter: outResponse.balanceAfter,
          bankId: outResponse.bankId || undefined,
          bankDelta: outResponse.bankDelta || undefined,
          createdAtIso: outResponse.createdAt,
          createdBy: outResponse.createdBy,
        };

        const inTx: DailyTransaction = {
          id: inResponse.id,
          isoDate: inResponse.isoDate,
          displayDate: isoToDisplay(inResponse.isoDate),
          documentNo: inResponse.documentNo || '',
          type: inResponse.type,
          source: inResponse.source,
          counterparty: inResponse.counterparty || '',
          description: inResponse.description || '',
          incoming: inResponse.incoming,
          outgoing: inResponse.outgoing,
          balanceAfter: inResponse.balanceAfter,
          bankId: inResponse.bankId || undefined,
          bankDelta: inResponse.bankDelta || undefined,
          displayIncoming: inResponse.displayIncoming ?? values.tutar, // FIX: Use displayIncoming from backend
          displayOutgoing: inResponse.displayOutgoing ?? undefined, // BUG 2 FIX: Use undefined instead of null to prevent showing 0,00 TL
          createdAtIso: inResponse.createdAt,
          createdBy: inResponse.createdBy,
        };

      // Refresh summary and transactions after successful save
      await refreshAll();
      
      setOpenForm(null);
        return;
    } else {
      const documentNo = getNextBelgeNo('BNK-CKS', values.islemTarihiIso, dailyTransactions);
      let tutar = values.tutar;
      let aciklama = values.aciklama || '';
      let counterparty = values.muhatap || 'Diğer';
      let description = aciklama;


      // FIX: For cheque payment, use the new /api/cheques/:id/pay endpoint
      // This endpoint handles both transaction creation and cheque status update atomically
      if (values.islemTuru === 'CEK_ODEME' && values.cekId) {
        try {
          const payResponse = await apiPost<{
            ok: boolean;
            paidChequeId: string;
            transactionId: string;
            updatedCheque: {
              id: string;
              status: string;
              paidAt: string | null;
              paidBankId: string | null;
              paymentTransactionId: string | null;
            };
          }>(`/api/cheques/${values.cekId}/pay`, {
            bankId: normalizedBankId,
            paymentDate: values.islemTarihiIso,
            note: values.aciklama || null,
          });

          if (payResponse.ok) {
            // Update local cheque state
            setCheques((prev) =>
              prev.map((c) => 
                c.id === payResponse.paidChequeId 
                  ? { ...c, status: 'ODENDI' as ChequeStatus }
                  : c
              )
            );

            // Refresh summary and transactions
            await refreshAll();
            setOpenForm(null);
            return; // Exit early - payment is complete
          }
        } catch (chequePayError: any) {
          console.error('Failed to pay cheque:', chequePayError);
          alert(chequePayError?.errorData?.message || 'Çek ödeme işlemi başarısız oldu');
          return;
        }
      }

      // Legacy cheque handling (if not using new endpoint)
      let chequeToUpdate: { id: string; supplierId: string | null } | null = null;
      if (values.islemTuru === 'CEK_ODEME' && values.cekId && !chequeToUpdate) {
        const cheque = cheques.find((c) => c.id === values.cekId);
        if (cheque) {
          tutar = cheque.tutar;
          const supplierId = values.supplierId || cheque.tedarikciId || null;
          const supplier = supplierId ? suppliers.find((s) => s.id === supplierId) : undefined;
          counterparty = supplier ? `${supplier.kod} - ${supplier.ad}` : cheque.lehtar || counterparty;
          description = `Çek No: ${cheque.cekNo}${values.aciklama ? ` – ${values.aciklama}` : ''}`;
          chequeToUpdate = { id: values.cekId, supplierId };
        }
      }

      if (values.islemTuru === 'KREDI_KARTI_ODEME' && values.krediKartiId) {
        const card = creditCards.find((c) => c.id === values.krediKartiId);
        if (!card) {
          setOpenForm(null);
          return;
        }

          try {
            const response = await apiPost<{
              operation: {
                id: string;
                creditCardId: string;
                isoDate: string;
                type: string;
                amount: number;
              };
              transaction: {
                id: string;
                isoDate: string;
                type: string;
                source: string;
                bankId: string | null;
                bankDelta: number;
                outgoing: number;
              };
              // CREDIT CARD EKSTRE ÖDEME FIX: Include updated credit card in response
              creditCard: {
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
                bank: {
                  id: string;
                  name: string;
                } | null;
              };
            }>('/api/credit-cards/payment', {
              creditCardId: values.krediKartiId,
          isoDate: values.islemTarihiIso,
              amount: values.tutar,
              description: values.aciklama || null,
              paymentSource: 'BANKA', // Always from bank in this flow
              bankId: values.bankaId || null,
            });

            // CREDIT CARD EKSTRE ÖDEME FIX: Update credit cards state with response from backend
            // This ensures frontend state is immediately consistent with backend's updated debt values
            if (response.creditCard) {
              const updatedCard: CreditCard = {
                id: response.creditCard.id,
                bankaId: response.creditCard.bankId || '',
                kartAdi: response.creditCard.name,
                limit: response.creditCard.limit,
                hesapKesimGunu: response.creditCard.closingDay,
                sonOdemeGunu: response.creditCard.dueDay,
                sonEkstreBorcu: response.creditCard.sonEkstreBorcu,
                guncelBorc: response.creditCard.manualGuncelBorc !== null 
                  ? response.creditCard.manualGuncelBorc 
                  : response.creditCard.currentDebt,
                kullanilabilirLimit: response.creditCard.availableLimit,
                aktifMi: response.creditCard.isActive,
              };
              
              // Update credit cards state
              setCreditCards((prev) => 
                prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
              );
            }

            // Map backend transaction to frontend format
            const tx: DailyTransaction = {
              id: response.transaction.id,
              isoDate: response.transaction.isoDate,
              displayDate: isoToDisplay(response.transaction.isoDate),
          documentNo,
              type: response.transaction.type as DailyTransactionType,
              source: response.transaction.source as DailyTransactionSource,
          counterparty: card.kartAdi,
          description: values.aciklama || '',
          incoming: 0,
              outgoing: response.transaction.outgoing,
              balanceAfter: 0, // Will be recalculated
              bankId: response.transaction.bankId || undefined,
              bankDelta: response.transaction.bankDelta,
              createdAtIso: new Date().toISOString(),
          createdBy: currentUser.email,
        };

        // Refresh summary and transactions after successful save
        await refreshAll();
        
        setOpenForm(null);
        return;
          } catch (error: any) {
            alert(`Hata: ${error.message || 'Kredi kartı ödemesi kaydedilemedi'}`);
            return;
          }
        }

      // LOAN PAYMENT FIX: Handle loan payment via new endpoint (loanId only, no installmentId)
      if (values.islemTuru === 'KREDI_ODEME' && values.loanId) {
        try {
          const response = await apiPost<{
            ok: boolean;
            paidLoanId: string;
            paidInstallmentId: string;
            loan: any;
            transaction: {
              id: string;
              isoDate: string;
              type: string;
              source: string;
              bankId: string | null;
              bankDelta: number;
              outgoing: number;
            };
          }>(`/api/loans/${values.loanId}/pay-next-installment`, {
            bankId: values.bankaId,
            isoDate: values.islemTarihiIso,
            note: values.aciklama || null,
          });

          // LOAN PAYMENT FIX: Verify payment was successful
          if (!response.ok || !response.paidInstallmentId) {
            throw new Error(`Payment failed: ${response.paidInstallmentId || 'unknown error'}`);
          }

          // LOAN PAYMENT FIX: Hard refresh after successful payment
          await refreshAll();
          
          // Then refresh transactions and loans in parallel (but summary already updated)
          await Promise.all([
            (async () => {
              try {
                const today = todayIso();
                const response = await apiGet<{ items: any[]; totalCount: number }>(
                  `/api/transactions?from=${today}&to=${today}&sortKey=isoDate&sortDir=asc`
                );
                const mapped = response.items.map((tx) => ({
                  id: tx.id,
                  isoDate: tx.isoDate,
                  displayDate: isoToDisplay(tx.isoDate),
                  documentNo: tx.documentNo || '',
                  type: tx.type,
                  source: tx.source,
                  counterparty: tx.counterparty || '',
                  description: tx.description || '',
                  incoming: Number(tx.incoming) ?? 0,
                  outgoing: Number(tx.outgoing) ?? 0,
                  balanceAfter: Number(tx.balanceAfter) ?? 0,
                  bankId: tx.bankId || undefined,
                  bankDelta: tx.bankDelta !== undefined && tx.bankDelta !== null ? Number(tx.bankDelta) : undefined,
                  displayIncoming: tx.displayIncoming || undefined,
                  displayOutgoing: tx.displayOutgoing || undefined,
                  createdAtIso: tx.createdAt,
                  createdBy: tx.createdBy,
                  attachmentType: tx.attachmentType || undefined,
                  attachmentImageDataUrl: tx.attachmentImageDataUrl || undefined,
                  attachmentImageName: tx.attachmentImageName || undefined,
                }));
                
                const sorted = [...mapped].sort((a, b) => {
                  const aCreated = a.createdAtIso || a.isoDate + 'T00:00:00';
                  const bCreated = b.createdAtIso || b.isoDate + 'T00:00:00';
                  return aCreated.localeCompare(bCreated);
                });
                setDailyTransactions(sorted);
              } catch (error) {
                console.error('Failed to refresh transactions:', error);
              }
            })(),
            (async () => {
              try {
                const backendLoans = await apiGet<Loan[]>('/api/loans');
                setLoans(backendLoans);
              } catch (error: any) {
                console.error('Failed to refresh loans:', error);
              }
            })(),
          ]);
          
          setOpenForm(null);
          return;
        } catch (error: any) {
          alert(`Hata: ${error.message || 'Kredi ödemesi kaydedilemedi'}`);
          return;
        }
      }

        // Fix Bug 2: Get supplier for supplier payments
        const selectedSupplier = values.supplierId ? suppliers.find((s) => s.id === values.supplierId) : undefined;
        if (values.islemTuru === 'TEDARIKCI_ODEME') {
          if (selectedSupplier) {
            counterparty = `${selectedSupplier.kod} - ${selectedSupplier.ad}`;
          } else if (!values.supplierId) {
            // If no supplier selected, use muhatap field
            counterparty = values.muhatap || 'Tedarikçi Ödemesi';
          } else {
            // Supplier ID provided but not found - this should not happen but handle gracefully
            counterparty = values.muhatap || 'Tedarikçi Ödemesi';
          }
        }

        // Backend'e kaydet
        const response = await apiPost<{
          id: string;
          isoDate: string;
          documentNo: string | null;
          type: DailyTransactionType;
          source: DailyTransactionSource;
          counterparty: string | null;
          description: string | null;
          incoming: number;
          outgoing: number;
          balanceAfter: number;
          bankId: string | null;
          bankDelta: number;
          supplierId: string | null;
          createdAt: string;
          createdBy: string;
        }>('/api/transactions', {
        isoDate: values.islemTarihiIso,
        documentNo,
          // BUG 2 FIX: Bank cash out - type: NAKIT_ODEME (or CEK_ODENMESI for cheques), source: BANKA
          // CRITICAL: BANKA source requires incoming=0, outgoing=0 (only bankDelta is used)
          // But we need displayOutgoing=amount for UI display
          type: values.islemTuru === 'CEK_ODEME' ? 'CEK_ODENMESI' : 'NAKIT_ODEME',
        source: 'BANKA',
          counterparty: counterparty || 'Diğer',
          description: description || null,
        incoming: 0, // CRITICAL: BANKA source requires incoming=0 (only bankDelta is used)
          outgoing: 0, // CRITICAL: BANKA source requires outgoing=0 (only bankDelta is used)
          bankDelta: -tutar, // BANKA source: only bankDelta is used for bank balance
          displayIncoming: null, // BUG 2 FIX: No incoming for bank cash out
          displayOutgoing: tutar, // BUG 2 FIX: Show amount in UI
          bankId: normalizedBankId,
          // FIX: Normalize supplierId - only set if supplier payment and supplierId is valid UUID
          supplierId: (values.islemTuru === 'TEDARIKCI_ODEME' && values.supplierId && values.supplierId.trim() && uuidRegex.test(values.supplierId.trim())) 
            ? values.supplierId.trim() 
            : null,
          creditCardId: (values.krediKartiId && values.krediKartiId.trim()) ? values.krediKartiId.trim() : null,
          chequeId: values.cekId && values.cekId.trim() ? values.cekId.trim() : null, // BUG 3 FIX: Include chequeId for cheque payments
        });

        // Backend'den gelen transaction'ı frontend formatına çevir
        const tx: DailyTransaction = {
          id: response.id,
          isoDate: response.isoDate,
          displayDate: isoToDisplay(response.isoDate),
          documentNo: response.documentNo || '',
          type: response.type,
          source: response.source,
          counterparty: response.counterparty || '',
          description: response.description || '',
          incoming: response.incoming,
          outgoing: response.outgoing,
          balanceAfter: response.balanceAfter,
          bankId: response.bankId || undefined,
          bankDelta: response.bankDelta || undefined,
          displayIncoming: response.displayIncoming || undefined, // BUG 2 FIX: Use displayIncoming from backend
          displayOutgoing: response.displayOutgoing || undefined, // BUG 2 FIX: Use displayOutgoing from backend
          createdAtIso: response.createdAt,
          createdBy: response.createdBy,
        };

      // Legacy cheque status update (should not be reached if new endpoint is used)
      if (chequeToUpdate) {
        try {
          await apiPut<{
            id: string;
            status: string;
            supplierId: string | null;
          }>(`/api/cheques/${chequeToUpdate.id}/status`, {
            newStatus: 'ODENDI', // FIX: Status should be ODENDI when cheque is paid from bank
            isoDate: values.islemTarihiIso,
            supplierId: chequeToUpdate.supplierId,
            description: description || null,
          });
          
          // Update local cheque state
          setCheques((prev) =>
            prev.map((c) => 
              c.id === chequeToUpdate.id 
                ? { ...c, status: 'ODENDI' as ChequeStatus, kasaMi: false, tedarikciId: chequeToUpdate.supplierId || undefined }
                : c
            )
          );
        } catch (chequeError: any) {
          console.error('Failed to update cheque status:', chequeError);
          // Don't block the transaction - just log the error
        }
      }
      
      // Refresh summary and transactions after successful save
      await refreshAll();
      
      setOpenForm(null);
        return;
      }
    } catch (error: any) {
      alert(`Hata: ${error.message || 'Banka nakit çıkışı kaydedilemedi'}`);
    }
  };


  const handlePosTahsilatSaved = async (values: PosTahsilatFormValues) => {
    try {
    const customer = customers.find((c) => c.id === values.customerId);
    const bank = banks.find((b) => b.id === values.bankaId);
    if (!customer || !bank) {
      setOpenForm(null);
      return;
    }
    const documentNo = getNextBelgeNo('BNK-GRS', values.islemTarihiIso, dailyTransactions);
    const counterparty = `${customer.kod} - ${customer.ad}`;

      // Upload attachment first if slip image provided
      let attachmentId: string | null = null;
      if (values.slipImageDataUrl) {
        try {
          const attachmentResponse = await apiPost<{
            id: string;
            fileName: string;
            mimeType: string;
            imageDataUrl: string;
            createdAt: string;
            createdBy: string | null;
          }>('/api/attachments', {
            imageDataUrl: values.slipImageDataUrl,
            fileName: values.slipImageName || null,
            type: 'POS_SLIP',
          });
          attachmentId = attachmentResponse.id;
        } catch (attachmentError: any) {
          console.error('Failed to upload attachment:', attachmentError);
          alert(`Slip görseli yüklenemedi: ${attachmentError?.message || 'Bilinmeyen hata'}`);
          return;
        }
      }

      // Create POS tahsilat (brut) transaction
      const brutResponse = await apiPost<{
        id: string;
        isoDate: string;
        documentNo: string | null;
        type: DailyTransactionType;
        source: DailyTransactionSource;
        counterparty: string | null;
        description: string | null;
        incoming: number;
        outgoing: number;
        balanceAfter: number;
        bankId: string | null;
        bankDelta: number;
        displayIncoming: number | null;
        createdAt: string;
        createdBy: string;
      }>('/api/transactions', {
      isoDate: values.islemTarihiIso,
      documentNo,
      type: 'POS_TAHSILAT_BRUT',
      source: 'POS',
      counterparty,
        description: values.aciklama || null,
      incoming: 0,
      outgoing: 0,
        bankDelta: values.brutTutar, // POS tahsilat: Bankaya brüt tutar eklenir
      bankId: values.bankaId,
      displayIncoming: values.brutTutar, // BUG 5 FIX: Brut amount for display
      displayOutgoing: null, // BUG 5 FIX: Must be null/0 for POS_TAHSILAT_BRUT validation
      attachmentId: attachmentId, // Use uploaded attachment ID
    });

      // Fix: POS commission transaction - outgoing=commissionAmount, bankDelta=-commissionAmount
      let komisyonResponse;
      try {
        const komisyonPayload = {
          isoDate: values.islemTarihiIso,
          documentNo: `${documentNo}-KOM`,
          type: 'POS_KOMISYONU',
          source: 'POS',
          counterparty,
          description: values.aciklama || 'POS Komisyonu',
          incoming: 0,
          outgoing: 0,
          bankDelta: -values.komisyonTutar,
          bankId: values.bankaId,
          displayIncoming: null,
          displayOutgoing: values.komisyonTutar,
          attachmentId: attachmentId, // Use same attachment ID as brut transaction
        };
        
        komisyonResponse = await apiPost<{
        id: string;
        isoDate: string;
        documentNo: string | null;
        type: DailyTransactionType;
        source: DailyTransactionSource;
        counterparty: string | null;
        description: string | null;
        incoming: number;
        outgoing: number;
        balanceAfter: number;
        bankId: string | null;
        bankDelta: number;
        displayOutgoing: number | null;
        createdAt: string;
        createdBy: string;
      }>('/api/transactions', komisyonPayload);
      
      } catch (komisyonError: any) {
        // Don't throw - continue with brut transaction only, but log the error
        console.error('Komisyon transaction kaydedilemedi:', komisyonError);
        alert(`Komisyon transaction'ı kaydedilemedi: ${komisyonError?.message || 'Bilinmeyen hata'}. Brüt transaction kaydedildi.`);
        komisyonResponse = null;
      }

      // Map backend responses to frontend format
      const brutTx: DailyTransaction = {
        id: brutResponse.id,
        isoDate: brutResponse.isoDate,
        displayDate: isoToDisplay(brutResponse.isoDate),
        documentNo: brutResponse.documentNo || '',
        type: brutResponse.type,
        source: brutResponse.source,
        counterparty: brutResponse.counterparty || '',
        description: brutResponse.description || '',
        incoming: brutResponse.incoming,
        outgoing: brutResponse.outgoing,
        balanceAfter: brutResponse.balanceAfter,
        bankId: brutResponse.bankId || undefined,
        bankDelta: brutResponse.bankDelta || undefined,
        displayIncoming: brutResponse.displayIncoming ?? undefined, // POS_TAHSILAT_BRUT: brut tutar
        displayOutgoing: brutResponse.displayOutgoing ?? undefined, // Should be null for POS_TAHSILAT_BRUT
        createdAtIso: brutResponse.createdAt,
        createdBy: brutResponse.createdBy,
      };

      // CRITICAL FIX: Add both transactions to the list (brut and commission)
      // Previously only brutTx was added, causing commission bankDelta to be ignored
      if (komisyonResponse) {
        const komisyonTx: DailyTransaction = {
          id: komisyonResponse.id,
          isoDate: komisyonResponse.isoDate,
          displayDate: isoToDisplay(komisyonResponse.isoDate),
          documentNo: komisyonResponse.documentNo || '',
          type: komisyonResponse.type,
          source: komisyonResponse.source,
          counterparty: komisyonResponse.counterparty || '',
          description: komisyonResponse.description || '',
          incoming: komisyonResponse.incoming,
          outgoing: komisyonResponse.outgoing,
          balanceAfter: komisyonResponse.balanceAfter,
          bankId: komisyonResponse.bankId || undefined,
        // CRITICAL FIX: Preserve negative bankDelta values (commission reduces bank balance)
        // Use !== undefined check instead of || to preserve negative values
        bankDelta: komisyonResponse.bankDelta !== undefined && komisyonResponse.bankDelta !== null 
          ? komisyonResponse.bankDelta 
          : undefined,
        displayIncoming: komisyonResponse.displayIncoming ?? undefined, // Should be null for POS_KOMISYONU
        displayOutgoing: komisyonResponse.displayOutgoing ?? undefined, // POS_KOMISYONU: komisyon tutarı
        createdAtIso: komisyonResponse.createdAt,
        createdBy: komisyonResponse.createdBy,
      };

        addTransactions([brutTx, komisyonTx]);
      } else {
        // Only add brut transaction if commission failed
        addTransactions([brutTx]);
      }

    // Refresh summary and transactions after successful save
    // NOTE: refreshAll() will fetch transactions from backend, which should include both brut and commission
    // The bankDelta mapping fix ensures negative values (commission) are preserved
    await refreshAll();
    setOpenForm(null);
    } catch (error: any) {
      alert(`Hata: ${error.message || 'POS tahsilat kaydedilemedi'}`);
    }
  };

  const handleKrediKartiTedarikciSaved = async (values: KrediKartiTedarikciOdemeFormValues) => {
    const supplier = suppliers.find((s) => s.id === values.supplierId);
    if (!supplier) {
      setOpenForm(null);
      return;
    }

    try {
      const response = await apiPost<{
        operation: {
          id: string;
          creditCardId: string;
          isoDate: string;
          type: string;
          amount: number;
        };
        transaction: {
          id: string;
          isoDate: string;
          type: string;
          source: string;
          displayOutgoing: number | null;
        };
        // CRITICAL FIX: Response now includes updated credit card
        creditCard: {
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
          bank: {
            id: string;
            name: string;
          } | null;
        };
      }>('/api/credit-cards/expense', {
        creditCardId: values.cardId,
        isoDate: values.islemTarihiIso,
        amount: values.tutar,
        description: values.aciklama || null,
        counterparty: values.muhatap || `${supplier.kod} - ${supplier.ad}` || null,
      });

      // Map backend transaction to frontend format
      const tx: DailyTransaction = {
        id: response.transaction.id,
        isoDate: response.transaction.isoDate,
        displayDate: isoToDisplay(response.transaction.isoDate),
        documentNo: `KK-TED-${Date.now()}`,
        type: response.transaction.type as DailyTransactionType,
        source: response.transaction.source as DailyTransactionSource,
        counterparty: values.muhatap || `${supplier.kod} - ${supplier.ad}`,
        description: values.aciklama || '',
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0, // Will be recalculated
        bankDelta: 0,
        displayOutgoing: response.transaction.displayOutgoing ?? undefined,
        createdAtIso: new Date().toISOString(),
        createdBy: currentUser.email,
      };

      addTransactions([tx]);
      
      // CRITICAL FIX: Update credit card state from response (single source of truth: backend)
      const cardExtrasKey = 'esca-webkasa-card-extras';
      const savedExtras = localStorage.getItem(cardExtrasKey);
      const cardExtras: Record<string, { sonEkstreBorcu: number; asgariOran: number; maskeliKartNo: string }> = savedExtras ? JSON.parse(savedExtras) : {};
      
      // Update the specific card that was modified
      const updatedCard: CreditCard = {
        id: response.creditCard.id,
        bankaId: response.creditCard.bankId || '',
        kartAdi: response.creditCard.name,
        kartLimit: response.creditCard.limit,
        limit: response.creditCard.limit,
        kullanilabilirLimit: response.creditCard.availableLimit,
        asgariOran: cardExtras[response.creditCard.id]?.asgariOran || 0.4,
        hesapKesimGunu: response.creditCard.closingDay ?? 1,
        sonOdemeGunu: response.creditCard.dueDay ?? 1,
        maskeliKartNo: cardExtras[response.creditCard.id]?.maskeliKartNo || '',
        aktifMi: response.creditCard.isActive,
        sonEkstreBorcu: response.creditCard.sonEkstreBorcu, // Use from backend response
        guncelBorc: response.creditCard.currentDebt, // Use from backend response
      };
      
      // Update credit cards state: replace the updated card
      setCreditCards((prevCards) => {
        const index = prevCards.findIndex((c) => c.id === updatedCard.id);
        if (index >= 0) {
          const newCards = [...prevCards];
          newCards[index] = updatedCard;
          return newCards;
        }
        // If card not found, add it (shouldn't happen, but safe fallback)
        return [...prevCards, updatedCard];
      });
      
      // Refresh summary and transactions after successful save
      await refreshAll();
      
      setOpenForm(null);
    } catch (error: any) {
      alert(`Hata: ${error.message || 'Kredi kartı harcaması kaydedilemedi'}`);
    }
  };

  const handleKrediKartiMasrafSaved = async (values: KrediKartiMasrafFormValues) => {
    try {
      // Upload attachment first if slip image provided
      let attachmentId: string | null = null;
      if (values.slipImageDataUrl) {
        try {
          const attachmentResponse = await apiPost<{
            id: string;
            fileName: string;
            mimeType: string;
            imageDataUrl: string;
            createdAt: string;
            createdBy: string | null;
          }>('/api/attachments', {
            imageDataUrl: values.slipImageDataUrl,
            fileName: values.slipFileName || null,
            type: 'POS_SLIP',
          });
          attachmentId = attachmentResponse.id;
        } catch (attachmentError: any) {
          console.error('Failed to upload attachment:', attachmentError);
          alert(`Slip görseli yüklenemedi: ${attachmentError?.message || 'Bilinmeyen hata'}`);
          return;
        }
      }

      const meta =
        values.masrafTuru === 'AKARYAKIT'
          ? values.plaka
          : values.masrafTuru === 'FATURA'
          ? values.faturaAltTuru
          : undefined;
      const counterparty = values.aciklama || meta || values.masrafTuru;

      const response = await apiPost<{
        operation: {
          id: string;
          creditCardId: string;
          isoDate: string;
          type: string;
          amount: number;
        };
        transaction: {
          id: string;
          isoDate: string;
          type: string;
          source: string;
          displayOutgoing: number | null;
        };
        // CRITICAL FIX: Response now includes updated credit card
        creditCard: {
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
          bank: {
            id: string;
            name: string;
          } | null;
        };
      }>('/api/credit-cards/expense', {
        creditCardId: values.cardId,
        isoDate: values.islemTarihiIso,
        amount: values.tutar,
        description: values.aciklama || null,
        counterparty: counterparty || 'Masraf' || null,
        attachmentId: attachmentId, // Use uploaded attachment ID
      });

      // Map backend transaction to frontend format
      const tx: DailyTransaction = {
        id: response.transaction.id,
        isoDate: response.transaction.isoDate,
        displayDate: isoToDisplay(response.transaction.isoDate),
        documentNo: `KK-MSF-${Date.now()}`,
        type: response.transaction.type as DailyTransactionType,
        source: response.transaction.source as DailyTransactionSource,
        counterparty: counterparty || 'Masraf',
        description: values.aciklama || '',
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0, // Will be recalculated
        bankDelta: 0,
        displayOutgoing: response.transaction.displayOutgoing ?? undefined,
        attachmentId: attachmentId ?? undefined, // Include attachmentId if uploaded
        createdAtIso: new Date().toISOString(),
        createdBy: currentUser.email,
      };

      // CRITICAL FIX: Refresh all to get the transaction with attachmentId from backend
      await refreshAll();
      
      // CRITICAL FIX: Update credit card state from response (single source of truth: backend)
      const cardExtrasKey = 'esca-webkasa-card-extras';
      const savedExtras = localStorage.getItem(cardExtrasKey);
      const cardExtras: Record<string, { sonEkstreBorcu: number; asgariOran: number; maskeliKartNo: string }> = savedExtras ? JSON.parse(savedExtras) : {};
      
      // Update the specific card that was modified
      const updatedCard: CreditCard = {
        id: response.creditCard.id,
        bankaId: response.creditCard.bankId || '',
        kartAdi: response.creditCard.name,
        kartLimit: response.creditCard.limit,
        limit: response.creditCard.limit,
        kullanilabilirLimit: response.creditCard.availableLimit,
        asgariOran: cardExtras[response.creditCard.id]?.asgariOran || 0.4,
        hesapKesimGunu: response.creditCard.closingDay ?? 1,
        sonOdemeGunu: response.creditCard.dueDay ?? 1,
        maskeliKartNo: cardExtras[response.creditCard.id]?.maskeliKartNo || '',
        aktifMi: response.creditCard.isActive,
        sonEkstreBorcu: response.creditCard.sonEkstreBorcu, // Use from backend response
        guncelBorc: response.creditCard.currentDebt, // Use from backend response
      };
      
      // Update credit cards state: replace the updated card
      setCreditCards((prevCards) => {
        const index = prevCards.findIndex((c) => c.id === updatedCard.id);
        if (index >= 0) {
          const newCards = [...prevCards];
          newCards[index] = updatedCard;
          return newCards;
        }
        // If card not found, add it (shouldn't happen, but safe fallback)
        return [...prevCards, updatedCard];
      });
      
    setOpenForm(null);
    } catch (error: any) {
      alert(`Hata: ${error.message || 'Kredi kartı masrafı kaydedilemedi'}`);
    }
  };

  // SINGLE SOURCE OF TRUTH FIX: After cheque operations, refresh from backend
  // This ensures all screens (upcoming, dropdown, reports, module) see the same data
  const handleCekIslemSaved = async (payload: CekIslemPayload) => {
    // Update local state immediately for UI responsiveness
    setCheques(payload.updatedCheques);
    if (payload.transaction) {
      addTransactions([payload.transaction]);
    }
    setOpenForm(null);
    
    // CRITICAL: Refresh from backend to ensure single source of truth
    // This ensures upcoming payments, dropdown, and reports all see the same data
    try {
      const today = todayIso();
      const hasTransactionToday = payload.transaction && payload.transaction.isoDate === today;
      
      // Backend returns ChequeListResponse with items array
      const response = await apiGet<{ items: any[]; totalCount: number }>('/api/cheques');
      // Map backend DTO to frontend Cheque format
      // CRITICAL: drawerName ve payeeName backend'den korunmalı (tedarikçi adı ile karıştırılmamalı)
      const mappedCheques: Cheque[] = response.items.map((c) => ({
        id: c.id,
        cekNo: c.cekNo,
        tutar: c.amount,
        vadeTarihi: c.maturityDate,
        bankaId: c.depositBankId || undefined, // Çeki tahsile verdiğimiz banka (bizim bankamız)
        bankaAdi: c.depositBank?.name || undefined, // Backend'den gelen deposit bank adı
        issuerBankName: c.issuerBankName || undefined, // Çeki düzenleyen banka adı
        // CRITICAL: drawerName ve payeeName backend'den korunmalı (tedarikçi/müşteri adı ile değiştirilmemeli)
        duzenleyen: c.drawerName || c.customer?.name || c.supplier?.name || '', // Backend'den gelen drawerName
        lehtar: c.payeeName || c.supplier?.name || c.customer?.name || `Çek ${c.cekNo}`, // Backend'den gelen payeeName
        musteriId: c.customerId || undefined,
        tedarikciId: c.supplierId || undefined,
        direction: c.direction,
        status: c.status as any,
        kasaMi: c.status === 'KASADA',
        aciklama: c.description || undefined,
        imageUrl: c.imageDataUrl || undefined,
        imageDataUrl: c.imageDataUrl || undefined,
      }));
      setCheques(mappedCheques);
      
      // CRITICAL FIX: If transaction is from today, refresh today's transactions from backend
      // This ensures gün içi işlemler shows the cheque transaction and bank balance is updated
      if (hasTransactionToday) {
        try {
          const txResponse = await apiGet<{ items: any[]; totalCount: number }>(
            `/api/transactions?from=${today}&to=${today}&sortKey=isoDate&sortDir=asc`
          );
          const mapped = txResponse.items.map((tx) => ({
            id: tx.id,
            isoDate: tx.isoDate,
            displayDate: isoToDisplay(tx.isoDate),
            documentNo: tx.documentNo || '',
            type: tx.type,
            source: tx.source,
            counterparty: tx.counterparty || '',
            description: tx.description || '',
            incoming: Number(tx.incoming) ?? 0,
            outgoing: Number(tx.outgoing) ?? 0,
            balanceAfter: Number(tx.balanceAfter) ?? 0,
            bankId: tx.bankId || undefined,
            bankDelta: tx.bankDelta !== undefined && tx.bankDelta !== null ? Number(tx.bankDelta) : undefined,
            displayIncoming: tx.displayIncoming || undefined,
            displayOutgoing: tx.displayOutgoing || undefined,
            createdAtIso: tx.createdAt,
            createdBy: tx.createdBy,
            attachmentType: tx.attachmentType || undefined,
            attachmentImageDataUrl: tx.attachmentImageDataUrl || undefined,
            attachmentImageName: tx.attachmentImageName || undefined,
          }));
          
          const sorted = [...mapped].sort((a, b) => {
            const aCreated = a.createdAtIso || a.isoDate + 'T00:00:00';
            const bCreated = b.createdAtIso || b.isoDate + 'T00:00:00';
            return aCreated.localeCompare(bCreated);
          });
          setDailyTransactions(sorted);
        } catch (error) {
          console.error('Failed to refresh today\'s transactions after cheque operation:', error);
        }
      }
      
      // Also refresh summary to update upcoming payments (single source of truth)
      await loadDashboardSummary();
    } catch (error) {
      console.error('Failed to refresh cheques from backend:', error);
      // Keep local state if refresh fails
    }
  };

  const removeTransaction = async (id: string) => {
    if (!window.confirm('Bu satırı silmek istediğinize emin misiniz?')) return;
    // BUG 1 FIX: Delete transaction from backend, then re-fetch to get correct balanceAfter values
    // Don't use recalcBalances which uses BASE_CASH_BALANCE and causes inconsistency
    try {
      // Delete from backend first
      await apiDelete(`/api/transactions/${id}`);
      
      // Then re-fetch today's transactions to get correct balanceAfter values
      const today = todayIso();
      const response = await apiGet<{ items: any[]; totalCount: number }>(
        `/api/transactions?from=${today}&to=${today}&sortKey=isoDate&sortDir=asc`
      );
      const mapped = response.items.map((tx) => ({
        id: tx.id,
        isoDate: tx.isoDate,
        displayDate: isoToDisplay(tx.isoDate),
        documentNo: tx.documentNo || '',
        type: tx.type,
        source: tx.source,
        counterparty: tx.counterparty || '',
        description: tx.description || '',
        incoming: Number(tx.incoming) ?? 0,
        outgoing: Number(tx.outgoing) ?? 0,
        balanceAfter: Number(tx.balanceAfter) ?? 0, // BUG 1 FIX: Use balanceAfter from backend
        bankId: tx.bankId || undefined,
        bankDelta: tx.bankDelta || undefined,
        displayIncoming: tx.displayIncoming || undefined,
        displayOutgoing: tx.displayOutgoing || undefined,
        attachmentType: tx.attachmentType || undefined,
        attachmentImageDataUrl: tx.attachmentImageDataUrl || undefined,
        attachmentImageName: tx.attachmentImageName || undefined,
        createdAtIso: tx.createdAt,
        createdBy: tx.createdBy,
      }));
      
      // FIX: Sort by createdAtIso (creation time) to show transactions in the order they were created
      const sorted = [...mapped].sort((a, b) => {
        const aCreated = a.createdAtIso || a.isoDate + 'T00:00:00';
        const bCreated = b.createdAtIso || b.isoDate + 'T00:00:00';
        return aCreated.localeCompare(bCreated);
      });
      
      setDailyTransactions(sorted);
    } catch (error) {
      console.error('Failed to refresh transactions after delete:', error);
      // Fallback: just remove the transaction from local state
      setDailyTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const todayDisplay = isoToDisplay(today);
  const weekday = getWeekdayTr(today);

  return (
    <div className="flex min-h-screen bg-slate-100 overflow-x-hidden">
      <div
        className={`no-print fixed inset-y-0 left-0 w-72 bg-[#111827] text-white transform transition-transform duration-200 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-4 flex items-center justify-between lg:hidden">
          <span className="font-semibold">Menü</span>
          <button className="text-white" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>
        <div className="space-y-2 p-4 text-sm overflow-y-auto max-h-screen pr-1">
          {[
            {
              title: 'Nakit İşlemler',
              color: 'bg-emerald-700',
              key: 'nakit',
              items: [
                { label: 'Nakit Giriş', form: 'NAKIT_GIRIS' },
                { label: 'Nakit Çıkış', form: 'NAKIT_CIKIS' },
              ],
            },
            {
              title: 'Banka İşlemleri',
              color: 'bg-indigo-700',
              key: 'banka',
              items: [
                { label: 'Banka Nakit Giriş', form: 'BANKA_GIRIS' },
                { label: 'Banka Nakit Çıkış', form: 'BANKA_CIKIS' },
              ],
            },
            {
              title: 'Kartlı İşlemler',
              color: 'bg-purple-700',
              key: 'kart',
              items: [
                { label: 'POS Tahsilat İşlemi', form: 'POS_TAHSILAT' },
                { label: 'Kredi Kartı ile Tedarikçiye Ödeme', form: 'KK_TEDARIKCI' },
                { label: 'Kredi Kartı ile Masraf İşlemi', form: 'KK_MASRAF' },
                { label: 'Kredi Kartı İzleme', form: 'KK_IZLEME' },
              ],
            },
            {
              title: 'Çek İşlemleri',
              color: 'bg-orange-700',
              key: 'cek',
              items: [
                { label: 'Kasaya Çek Girişi', form: 'CEK_ISLEM' },
                { label: 'Kasadan Çek Çıkışı', form: 'CEK_ISLEM' },
                { label: 'Yeni Düzenlenen Çek', form: 'CEK_ISLEM' },
                { label: 'Tüm Çekler Raporu', form: 'CEK_ISLEM' },
              ],
            },
            {
              title: 'Raporlar',
              color: 'bg-[#E3A64D] text-white hover:bg-[#d3913d]',
              key: 'rapor',
              items: [
                { label: 'Kasa Defteri', form: null },
                { label: 'Nakit Akış Raporu', form: null },
                { label: 'Çek/Senet Modülü', form: null },
                { label: 'Diğer Raporlar', form: null },
              ],
            },
            {
              title: 'Ayarlar',
              color: 'bg-[#E393BA] text-white hover:bg-[#d17fa6]',
              key: 'ayar',
              items: [
                { label: 'Bankalar', form: 'AYARLAR', tab: 'BANKALAR' },
                { label: 'POS Listesi', form: 'AYARLAR', tab: 'POS' },
                { label: 'Müşteriler', form: 'AYARLAR', tab: 'MUSTERI' },
                { label: 'Tedarikçiler', form: 'AYARLAR', tab: 'TEDARIKCI' },
                { label: 'Kredi Kartları', form: 'AYARLAR', tab: 'KARTLAR' },
                { label: 'Krediler', form: 'AYARLAR', tab: 'KREDILER' },
                { label: 'Global Ayarlar', form: 'AYARLAR', tab: 'GLOBAL' },
                { label: 'E-posta Logs', form: 'EPOSTA_LOG' },
                { label: 'Kullanıcı Ayarları', form: 'KULLANICI_AYAR' },
              ],
            },
          ].map((section) => (
            <div key={section.key}>
              <button
                className={`w-full text-left px-3 py-2 rounded ${section.color} font-semibold`}
                onClick={() => toggleSection(section.key)}
              >
                {section.title}
              </button>
              {openSection[section.key] && (
                <div className="mt-1 space-y-1">
                  {section.items.map((item, idx) => (
                    <div
                      key={`${section.key}-${idx}`}
                      className="bg-[#1F2937] text-white px-3 py-2 rounded cursor-pointer hover:bg-[#111827]/70"
                      onClick={() => {
                        if (item.label === 'Kasa Defteri') {
                          setActiveView('KASA_DEFTERI');
                          return;
                        }
                        if (item.label === 'Nakit Akış Raporu') {
                          setActiveView('NAKIT_AKIS');
                          return;
                        }
                        if (item.label === 'Diğer Raporlar') {
                          setActiveView('ISLEM_LOGU');
                          return;
                        }
                        if (item.label === 'Çek/Senet Modülü') {
                          setActiveView('CEK_SENET');
                          return;
                        }
                        if (section.key === 'cek') {
                          if (item.label === 'Kasaya Çek Girişi') setCekInitialTab('GIRIS');
                          if (item.label === 'Kasadan Çek Çıkışı') setCekInitialTab('CIKIS');
                          if (item.label === 'Yeni Düzenlenen Çek') setCekInitialTab('YENI');
                          if (item.label === 'Tüm Çekler Raporu') setCekInitialTab('RAPOR');
                        }
                        if (item.tab) setSettingsTab(item.tab as SettingsTabKey);
                        if (item.form) setOpenForm(item.form as OpenFormKey);
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 lg:ml-72 min-h-screen w-0 min-w-0 overflow-x-hidden">
        <div className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 overflow-x-hidden">
          <div className="flex flex-nowrap items-center justify-between px-3 sm:px-4 py-2 sm:py-3 gap-2 min-w-0">
            {/* Sol blok: Hamburger + Esca Logo */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0 min-w-0">
              <button className="lg:hidden flex-shrink-0 text-3xl px-1 sm:px-2" onClick={() => setSidebarOpen(true)}>
                ☰
              </button>
              <img
                src="https://esca-food.com/image/cache/catalog/esca%20food%20logosu%20tek_-700x800.png"
                alt="Esca Food"
                className="h-28 sm:h-8 md:h-12 lg:h-[168px] w-auto object-contain flex-shrink-0"
              />
              {activeView !== 'DASHBOARD' && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBackToDashboard();
                  }}
                  className="inline-flex flex-col items-center gap-0.5 sm:gap-1 text-slate-700 hover:text-slate-900 hover:underline cursor-pointer flex-shrink-0"
                  aria-label="Ana sayfaya dön"
                >
                  <img
                    src="https://esca-food.com/image/cache/catalog/f5342283-469e-4d51-b720-9cb77ddfd0ac-700x800.png"
                    alt=""
                    className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 lg:h-[120px] lg:w-[120px] object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="text-[10px] sm:text-xs lg:text-sm whitespace-nowrap hidden sm:inline">Anasayfa</span>
                </a>
              )}
            </div>
            {/* Sağ blok: Web Kasa Logo + Email + Çıkış Butonu */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-1 min-w-0 justify-end">
              <img
                src="https://esca-food.com/image/cache/catalog/web%20kasa%20logosu%20tek_-700x800.png"
                alt="Web Kasa"
                className="h-20 sm:h-6 md:h-8 lg:h-[120px] w-auto object-contain flex-shrink-0"
              />
              <span className="truncate text-xs sm:text-sm text-slate-600 min-w-0 max-w-[100px] sm:max-w-[160px] md:max-w-none">
                {currentUser.email}
              </span>
              <button
                className="px-2 sm:px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-100 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                onClick={onLogout}
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>

        {activeView === 'DASHBOARD' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-600 truncate">Bankalar Toplamı</div>
                <div className="text-2xl sm:text-3xl font-bold mt-2 break-keep">{formatTl(totalBanksBalance)}</div>
                <div className="mt-3 max-h-52 overflow-y-auto divide-y -mx-4 px-4">
                  {banks.filter((b) => b.aktifMi).length === 0 && (
                    <div className="py-2 text-sm text-slate-500">Tanımlı banka hesabı yok.</div>
                  )}
                  {banks
                    .filter((b) => b.aktifMi)
                    .map((b) => {
                      // BUG-A FIX: Use backend summary bank balance if available, otherwise calculate from state
                      const bankBalance = summary?.bankBalances?.find(bb => bb.bankId === b.id)?.balance;
                      const calculatedBalance = (b.acilisBakiyesi || 0) + (bankDeltasById[b.id] || 0);
                      const displayBalance = bankBalance !== undefined 
                        ? (b.acilisBakiyesi || 0) + bankBalance // Backend balance is bankDelta sum only, add opening balance
                        : calculatedBalance;
                      
                      return (
                        <div key={b.id} className="flex justify-between py-2 text-sm gap-2">
                          <span className="truncate flex-1 min-w-0">{b.hesapAdi}</span>
                          <span className="font-semibold flex-shrink-0">{formatTl(displayBalance)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-600 truncate">Ana Kasa Bakiyesi</div>
                <div className="text-2xl sm:text-3xl font-bold mt-2 break-keep">{formatTl(cashBalance)}</div>
              </div>
              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-600 truncate">Kasadaki Çekler</div>
                <div className="mt-2 text-base sm:text-lg font-semibold">{chequesInCash.length} Adet</div>
                <div className="text-xl sm:text-2xl font-bold break-keep">{formatTl(chequesTotal)}</div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base sm:text-lg font-semibold">Yaklaşan Ödemeler</div>
                  <div className="text-xs text-slate-500">Kredi kartı, kredi ve çek vadesi yaklaşan ödemeler</div>
                </div>
              </div>
              {upcomingPayments.length === 0 && (
                <div className="py-3 text-center text-slate-500 text-sm mt-3">
                  Kayıt yok.
                </div>
              )}
              {/* Mobile: Card List */}
              <div className="mt-3 space-y-2 sm:hidden">
                {upcomingPayments.map((p) => {
                  let color = 'text-slate-700';
                  if (p.daysLeft < 0) color = 'text-rose-600 font-semibold';
                  else if (p.daysLeft <= globalSettings.yaklasanOdemeGun) color = 'text-amber-600 font-semibold';
                  return (
                    <div key={p.id} className="border border-slate-200 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{p.name}</div>
                          {p.installmentId && (
                            <div className="text-[10px] text-slate-400">{p.installmentId.slice(0, 8)}</div>
                          )}
                        </div>
                        <div className={`text-sm font-semibold ml-2 ${color}`}>{p.daysLeft} gün</div>
                      </div>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Tür:</span>
                          <span className="font-medium">{p.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Banka:</span>
                          <span className="font-medium truncate ml-2">{p.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vade:</span>
                          <span className="font-medium">{p.dueDateDisplay}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-100">
                          <span className="font-semibold">Tutar:</span>
                          <span className="font-bold text-emerald-600">{formatTl(p.amount)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Desktop: Table */}
              <div className="mt-3 hidden sm:block">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                    <tr>
                      <th className="py-2 px-2 text-left">Tür</th>
                      <th className="py-2 px-2 text-left">Banka</th>
                      <th className="py-2 px-2 text-left">Adı</th>
                      <th className="py-2 px-2 text-left">Vade</th>
                      <th className="py-2 px-2 text-left">Ödenecek Tutar</th>
                      <th className="py-2 px-2 text-left">Kalan Gün</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingPayments.map((p) => {
                      let color = 'text-slate-700';
                      if (p.daysLeft < 0) color = 'text-rose-600 font-semibold';
                      else if (p.daysLeft <= globalSettings.yaklasanOdemeGun) color = 'text-amber-600 font-semibold';
                      return (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-2 px-2">{p.category}</td>
                          <td className="py-2 px-2">{p.bankName}</td>
                          <td className="py-2 px-2">
                            {p.name}
                            {p.installmentId && (
                              <span className="text-[10px] text-slate-400 ml-1">({p.installmentId.slice(0, 8)})</span>
                            )}
                          </td>
                          <td className="py-2 px-2">{p.dueDateDisplay}</td>
                          <td className="py-2 px-2">{formatTl(p.amount)}</td>
                          <td className={`py-2 px-2 ${color}`}>{p.daysLeft}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
                <div className="text-base sm:text-lg font-semibold">
                  Gün İçi İşlemler
                  {/* TARİH / SAAT SÖZLEŞMESİ - 5.3: Liste hangi transactionDate'i gösteriyorsa başlık da onu gösterir */}
                  {displayedDate && (
                    <span className="ml-2 text-xs sm:text-sm font-normal text-slate-500">
                      ({isoToDisplay(displayedDate)} - {getWeekdayTr(displayedDate)})
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  {/* FINANCIAL INVARIANT: Balance context selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-600 whitespace-nowrap">Bakiye Türü:</label>
                    <select
                      className="text-xs border border-slate-300 rounded px-2 py-1 flex-1 sm:flex-none"
                      value={balanceContext.type === 'BANKA' ? `BANKA_${balanceContext.bankId}` : balanceContext.type}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'KASA') {
                          setBalanceContext({ type: 'KASA' });
                          setSelectedBankForBalance('');
                        } else if (value === 'BANKA_TOPLAM') {
                          setBalanceContext({ type: 'BANKA_TOPLAM' });
                          setSelectedBankForBalance('');
                        } else if (value.startsWith('BANKA_')) {
                          const bankId = value.replace('BANKA_', '');
                          setBalanceContext({ type: 'BANKA', bankId });
                          setSelectedBankForBalance(bankId);
                        }
                      }}
                    >
                      <option value="KASA">Kasa Bakiyesi</option>
                      <option value="BANKA_TOPLAM">Tüm Bankalar Toplam</option>
                      {banks.filter(b => b.aktifMi).map(b => (
                        <option key={b.id} value={`BANKA_${b.id}`}>
                          {b.bankaAdi}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 flex items-center space-x-2">
                    <span>{todayDisplay}</span>
                    <span className="text-orange-500 capitalize">{weekday}</span>
                  </div>
                </div>
              </div>
              {todaysTransactions.length === 0 && (
                <div className="py-3 text-center text-slate-500 text-sm mt-3">
                  Devir bakiyesi dışında gün içi işlem yok.
                </div>
              )}
              {/* Mobile: Card List */}
              <div className="mt-3 space-y-3 sm:hidden">
                {/* Devir Bakiyesi - İlk Satır */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {balanceContext.type === 'KASA' ? 'Kasa Gün Devir Bakiyesi' : balanceContext.type === 'BANKA' ? 'Banka Gün Devir Bakiyesi' : 'Banka Toplam Gün Devir Bakiyesi'}
                      </div>
                      <div className="text-xs text-slate-500">{isoToDisplay(today)}</div>
                    </div>
                    <div className="ml-2 flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-600">-</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Belge No:</span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kaynak:</span>
                      <span className="font-medium truncate ml-2 text-right">
                        {balanceContext.type === 'KASA' ? 'KASA' : balanceContext.type === 'BANKA' ? `BANKA (${banks.find(b => b.id === balanceContext.bankId)?.bankaAdi || ''})` : 'BANKA TOPLAM'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Muhatap:</span>
                      <span className="font-medium truncate ml-2 text-right">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Açıklama:</span>
                      <span className="font-medium truncate ml-2 text-right">Önceki günden devir</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="font-semibold">Bakiye:</span>
                      <span className="font-bold">
                        {formatTl(initialBalance)}
                      </span>
                    </div>
                  </div>
                </div>
                {todaysTransactions.map((tx) => {
                  // Fix Bug 6: Get bank name for bank transactions
                  const bankName = tx.bankId ? banks.find((b) => b.id === tx.bankId)?.bankaAdi : null;
                  // Fix Bug 6: Get credit card name for credit card transactions
                  const creditCardName = (tx as any).creditCardId 
                    ? creditCards.find((c) => c.id === (tx as any).creditCardId)?.kartAdi 
                    : null;
                  // Build source label with bank/card info
                  let sourceLabel = tx.source;
                  if (tx.source === 'BANKA' && bankName) {
                    sourceLabel = `${tx.source} (${bankName})`;
                  }
                  if (creditCardName) {
                    sourceLabel = creditCardName;
                    if (bankName) {
                      sourceLabel = `${creditCardName} - ${bankName}`;
                    }
                  }
                  const { giris, cikis } = resolveDisplayAmounts(tx);
                  return (
                    <div key={tx.id} className="border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{tx.type}</div>
                          <div className="text-xs text-slate-500">{tx.displayDate}</div>
                        </div>
                        <div className="ml-2 flex items-center gap-2">
                          {giris !== null && giris > 0 && (
                            <span className="text-xs sm:text-sm font-bold text-emerald-600">+{formatTl(giris)}</span>
                          )}
                          {cikis !== null && cikis > 0 && (
                            <span className="text-xs sm:text-sm font-bold text-rose-600">-{formatTl(cikis)}</span>
                          )}
                          <button
                            className="text-rose-600 hover:underline text-xs sm:text-sm px-2 py-1"
                            onClick={() => removeTransaction(tx.id)}
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Belge No:</span>
                          <span className="font-medium">{tx.documentNo || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kaynak:</span>
                          <span className="font-medium truncate ml-2 text-right">{sourceLabel}</span>
                        </div>
                        {tx.counterparty && (
                          <div className="flex justify-between">
                            <span>Muhatap:</span>
                            <span className="font-medium truncate ml-2 text-right">{tx.counterparty}</span>
                          </div>
                        )}
                        {tx.description && (
                          <div className="flex justify-between">
                            <span>Açıklama:</span>
                            <span className="font-medium truncate ml-2 text-right">{tx.description}</span>
                          </div>
                        )}
                        {tx.attachmentId != null && ( // != null checks for both null and undefined
                          <div className="flex justify-between">
                            <span>Belge:</span>
                            <button
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                              onClick={async () => {
                                if (!tx.attachmentId) return;
                                try {
                                  const attachment = await apiGet<{
                                    id: string;
                                    fileName: string;
                                    mimeType: string;
                                    imageDataUrl: string;
                                    createdAt: string;
                                    createdBy: string | null;
                                  }>(`/api/attachments/${tx.attachmentId}`);
                                  setPreviewImageUrl(attachment.imageDataUrl);
                                  const isPosSlip = tx.type === 'POS_TAHSILAT_BRUT' || 
                                                   tx.type === 'POS_KOMISYONU' ||
                                                   tx.type === 'KREDI_KARTI_HARCAMA' ||
                                                   tx.type === 'KREDI_KARTI_EKSTRE_ODEME' ||
                                                   tx.type === 'KREDI_KARTI_MASRAF';
                                  const isCheque = tx.type === 'CEK_GIRISI' || 
                                                   tx.type === 'CEK_TAHSIL_BANKA' || 
                                                   tx.type === 'CEK_ODENMESI' || 
                                                   tx.type === 'CEK_KARSILIKSIZ';
                                  const attachmentTitle = isPosSlip ? 'Slip' : isCheque ? 'Çek Görseli' : 'Belge';
                                  setPreviewTitle(attachment.fileName || attachmentTitle);
                                } catch (error: any) {
                                  console.error('Failed to fetch attachment:', error);
                                  alert(`Görsel yüklenemedi: ${error?.message || 'Bilinmeyen hata'}`);
                                }
                              }}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Görüntüle
                            </button>
                          </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-slate-100">
                          <span className="font-semibold">Bakiye:</span>
                          <span className="font-bold">
                            {formatTl(todaysBalanceMap.get(tx.id) ?? (balanceContext.type === 'KASA' ? cashBalance : 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Desktop: Table */}
              <div className="mt-3 hidden sm:block">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                    <tr>
                      <th className="py-2 px-2 text-left">Tarih</th>
                      <th className="py-2 px-2 text-left">Belge No</th>
                      <th className="py-2 px-2 text-left">Tür</th>
                      <th className="py-2 px-2 text-left">Kaynak</th>
                      <th className="py-2 px-2 text-left">Muhatap</th>
                      <th className="py-2 px-2 text-left">Açıklama</th>
                      <th className="py-2 px-2 text-left">Belge</th>
                      <th className="py-2 px-2 text-right">Giriş</th>
                      <th className="py-2 px-2 text-right">Çıkış</th>
                      <th className="py-2 px-2 text-right">Bakiye</th>
                      <th className="py-2 px-2 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Devir Bakiyesi - İlk Satır */}
                    <tr className="border-b bg-slate-50">
                      <td className="py-2 px-2">{isoToDisplay(today)}</td>
                      <td className="py-2 px-2">-</td>
                      <td className="py-2 px-2 font-semibold">
                        {balanceContext.type === 'KASA' ? 'Kasa Gün Devir Bakiyesi' : balanceContext.type === 'BANKA' ? 'Banka Gün Devir Bakiyesi' : 'Banka Toplam Gün Devir Bakiyesi'}
                      </td>
                      <td className="py-2 px-2">
                        {balanceContext.type === 'KASA' ? 'KASA' : balanceContext.type === 'BANKA' ? `BANKA (${banks.find(b => b.id === balanceContext.bankId)?.bankaAdi || ''})` : 'BANKA TOPLAM'}
                      </td>
                      <td className="py-2 px-2">-</td>
                      <td className="py-2 px-2">Önceki günden devir</td>
                      <td className="py-2 px-2">-</td>
                      <td className="py-2 px-2 text-right">-</td>
                      <td className="py-2 px-2 text-right">-</td>
                      <td className="py-2 px-2 text-right font-semibold">
                        {formatTl(initialBalance)}
                      </td>
                      <td className="py-2 px-2 text-right">-</td>
                    </tr>
                    {todaysTransactions.map((tx) => {
                      // Fix Bug 6: Get bank name for bank transactions
                      const bankName = tx.bankId ? banks.find((b) => b.id === tx.bankId)?.bankaAdi : null;
                      // Fix Bug 6: Get credit card name for credit card transactions
                      const creditCardName = (tx as any).creditCardId 
                        ? creditCards.find((c) => c.id === (tx as any).creditCardId)?.kartAdi 
                        : null;
                      // Build source label with bank/card info
                      let sourceLabel = tx.source;
                      if (tx.source === 'BANKA' && bankName) {
                        sourceLabel = `${tx.source} (${bankName})`;
                      }
                      if (creditCardName) {
                        sourceLabel = creditCardName;
                        if (bankName) {
                          sourceLabel = `${creditCardName} - ${bankName}`;
                        }
                      }
                      // Check for attachment - show "Görüntüle" if attachmentId exists (not null/undefined)
                      // Tüm transaction tipleri için attachmentId kontrolü yapılıyor
                      const hasAttachment = tx.attachmentId != null; // != null checks for both null and undefined
                      const isPosSlipType = tx.type === 'POS_TAHSILAT_BRUT' || 
                                           tx.type === 'POS_KOMISYONU' ||
                                           tx.type === 'KREDI_KARTI_HARCAMA' ||
                                           tx.type === 'KREDI_KARTI_EKSTRE_ODEME' ||
                                           tx.type === 'KREDI_KARTI_MASRAF';
                      const isChequeType = tx.type === 'CEK_GIRISI' || 
                                          tx.type === 'CEK_TAHSIL_BANKA' || 
                                          tx.type === 'CEK_ODENMESI' || 
                                          tx.type === 'CEK_KARSILIKSIZ';
                      
                      // Determine attachment title based on transaction type
                      let attachmentTitle = 'Belge';
                      if (isPosSlipType) {
                        attachmentTitle = 'Slip';
                      } else if (isChequeType) {
                        attachmentTitle = 'Çek Görseli';
                      }
                      return (
                      <tr key={tx.id} className="border-b last:border-0">
                        <td className="py-2 px-2">{tx.displayDate}</td>
                        <td className="py-2 px-2">{tx.documentNo}</td>
                        <td className="py-2 px-2">{tx.type}</td>
                        <td className="py-2 px-2">
                          {sourceLabel}
                        </td>
                        <td className="py-2 px-2">{tx.counterparty}</td>
                        <td className="py-2 px-2">{tx.description}</td>
                        <td className="py-2 px-2">
                          {hasAttachment ? (
                            <button
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                              onClick={async () => {
                                if (!tx.attachmentId) return;
                                try {
                                  const attachment = await apiGet<{
                                    id: string;
                                    fileName: string;
                                    mimeType: string;
                                    imageDataUrl: string;
                                    createdAt: string;
                                    createdBy: string | null;
                                  }>(`/api/attachments/${tx.attachmentId}`);
                                  setPreviewImageUrl(attachment.imageDataUrl);
                                  setPreviewTitle(attachment.fileName || attachmentTitle);
                                } catch (error: any) {
                                  console.error('Failed to fetch attachment:', error);
                                  alert(`Görsel yüklenemedi: ${error?.message || 'Bilinmeyen hata'}`);
                                }
                              }}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Görüntüle
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right text-emerald-600">
                          {(() => {
                            const { giris } = resolveDisplayAmounts(tx);
                            return giris !== null ? formatTl(giris) : '-';
                          })()}
                        </td>
                        <td className="py-2 px-2 text-right text-rose-600">
                          {(() => {
                            const { cikis } = resolveDisplayAmounts(tx);
                            return cikis !== null ? formatTl(cikis) : '-';
                          })()}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold">
                          {/* FINANCIAL INVARIANT: Use context-aware balance, not tx.balanceAfter */}
                          {formatTl(todaysBalanceMap.get(tx.id) ?? (balanceContext.type === 'KASA' ? cashBalance : 0))}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            className="text-rose-600 hover:underline"
                            onClick={() => removeTransaction(tx.id)}
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeView === 'KASA_DEFTERI' && (
          <div className="p-4">
            <KasaDefteriView onBackToDashboard={handleBackToDashboard} />
          </div>
        )}
        {activeView === 'ISLEM_LOGU' && (
          <div className="p-4">
            <IslemLoguReport
              banks={banks}
              currentUserEmail={currentUser.email}
              onBackToDashboard={handleBackToDashboard}
            />
          </div>
        )}
        {activeView === 'NAKIT_AKIS' && (
          <div className="p-4">
            <NakitAkisReport transactions={dailyTransactions} banks={banks} onBackToDashboard={handleBackToDashboard} />
          </div>
        )}
        {activeView === 'CEK_SENET' && (
          <div className="p-4">
            <CekSenetReport
              cheques={cheques}
              customers={customers}
              suppliers={suppliers}
              banks={banks}
              onBackToDashboard={handleBackToDashboard}
            />
          </div>
        )}
      </div>

      <NakitGiris
        isOpen={openForm === 'NAKIT_GIRIS'}
        onClose={() => setOpenForm(null)}
        onSaved={handleNakitGirisSaved}
        currentUserEmail={currentUser.email}
        customers={customers}
        banks={banks}
      />
      <NakitCikis
        isOpen={openForm === 'NAKIT_CIKIS'}
        onClose={() => setOpenForm(null)}
        onSaved={handleNakitCikisSaved}
        currentUserEmail={currentUser.email}
        suppliers={suppliers}
        banks={banks}
      />
      <BankaNakitGiris
        isOpen={openForm === 'BANKA_GIRIS'}
        onClose={() => setOpenForm(null)}
        onSaved={handleBankaNakitGirisSaved}
        currentUserEmail={currentUser.email}
        banks={banks}
        customers={customers}
        suppliers={suppliers}
      />
      <BankaNakitCikis
        isOpen={openForm === 'BANKA_CIKIS'}
        onClose={() => setOpenForm(null)}
        onSaved={handleBankaNakitCikisSaved}
        currentUserEmail={currentUser.email}
        banks={banks}
        cheques={cheques}
        creditCards={creditCards}
        suppliers={suppliers}
        loans={loans}
      />
      <PosTahsilat
        isOpen={openForm === 'POS_TAHSILAT'}
        onClose={() => setOpenForm(null)}
        onSaved={handlePosTahsilatSaved}
        currentUserEmail={currentUser.email}
        posTerminals={posTerminals}
        banks={banks}
        customers={customers}
      />
      <KrediKartiTedarikciOdeme
        isOpen={openForm === 'KK_TEDARIKCI'}
        onClose={() => setOpenForm(null)}
        onSaved={handleKrediKartiTedarikciSaved}
        currentUserEmail={currentUser.email}
        creditCards={creditCards}
        suppliers={suppliers}
      />
      <KrediKartiMasraf
        isOpen={openForm === 'KK_MASRAF'}
        onClose={() => setOpenForm(null)}
        onSaved={handleKrediKartiMasrafSaved}
        currentUserEmail={currentUser.email}
        creditCards={creditCards}
      />
      <CekIslemleriModal
        isOpen={openForm === 'CEK_ISLEM'}
        onClose={() => setOpenForm(null)}
        onSaved={handleCekIslemSaved}
        cheques={cheques}
        customers={customers}
        suppliers={suppliers}
        banks={banks}
        currentUserEmail={currentUser.email}
        initialTab={cekInitialTab}
      />
      <AyarlarModal
        isOpen={openForm === 'AYARLAR'}
        onClose={async () => {
          setOpenForm(null);
          // Reload banks and credit cards from backend after settings modal closes to ensure sync
          try {
            const [backendBanks, backendCreditCards] = await Promise.all([
              apiGet<Array<{
                id: string;
                name: string;
                accountNo: string | null;
                iban: string | null;
                isActive: boolean;
                currentBalance: number;
              }>>('/api/banks'),
              // BUG-1 FIX: Backend contract - must include sonEkstreBorcu and manualGuncelBorc
              apiGet<Array<{
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
              }>>('/api/credit-cards'),
            ]);
            
            // DEBUG: Log backend response on modal close
            console.log('[BUG-1 DEBUG] AyarlarModal onClose - Backend credit cards response:', JSON.stringify(backendCreditCards.map(c => ({
              id: c.id,
              name: c.name,
              sonEkstreBorcu: c.sonEkstreBorcu,
              manualGuncelBorc: c.manualGuncelBorc
            })), null, 2));
            
            // Fix: Load boolean flags from localStorage (they're not stored in backend)
            const bankFlagsKey = 'esca-webkasa-bank-flags';
            const savedFlags = localStorage.getItem(bankFlagsKey);
            const bankFlags: Record<string, { cekKarnesiVarMi: boolean; posVarMi: boolean; krediKartiVarMi: boolean }> = savedFlags ? JSON.parse(savedFlags) : {};
            
            const mappedBanks: BankMaster[] = backendBanks.map((bank) => {
              const flags = bankFlags[bank.id] || { cekKarnesiVarMi: false, posVarMi: false, krediKartiVarMi: false };
              return {
                id: bank.id,
                bankaAdi: bank.name,
                kodu: bank.accountNo ? bank.accountNo.substring(0, 4).toUpperCase() : 'BNK',
                hesapAdi: bank.name + (bank.accountNo ? ` - ${bank.accountNo}` : ''),
                iban: bank.iban || undefined,
                // BUG FIX: Use openingBalance (NOT currentBalance) for acilisBakiyesi
                acilisBakiyesi: (bank as any).openingBalance ?? 0,
                aktifMi: bank.isActive,
                cekKarnesiVarMi: flags.cekKarnesiVarMi,
                posVarMi: flags.posVarMi,
                krediKartiVarMi: flags.krediKartiVarMi,
              };
            });
            
            // BUG-1 FIX: localStorage ONLY for UI helpers, NOT for debt values
            const cardExtrasKey = 'esca-webkasa-card-extras';
            const savedExtras = localStorage.getItem(cardExtrasKey);
            const cardExtras: Record<string, { sonEkstreBorcu?: number; asgariOran: number; maskeliKartNo: string }> = savedExtras ? JSON.parse(savedExtras) : {};
            
            // BUG-1 FIX: Robust mapping with fallback - backend is authoritative source
            const mappedCreditCards: CreditCard[] = backendCreditCards.map((card) => {
              const limit = card.limit ?? null;
              const extras = cardExtras[card.id] || { asgariOran: 0.4, maskeliKartNo: '' };
              
              // BUG-1 FIX: Debt values from backend with fallback
              const sonEkstreBorcu = Number(card.sonEkstreBorcu ?? 0);
              const guncelBorc = card.manualGuncelBorc !== null && card.manualGuncelBorc !== undefined 
                ? Number(card.manualGuncelBorc) 
                : (card.currentDebt !== undefined ? Number(card.currentDebt) : null);
              
              // kullanilabilirLimit: calculate from limit and guncelBorc
              const kullanilabilirLimit = limit !== null && guncelBorc !== null 
                ? limit - guncelBorc 
                : (card.availableLimit ?? null);

              return {
                id: card.id,
                bankaId: card.bankId || '',
                kartAdi: card.name,
                kartLimit: limit,
                limit: limit,
                kullanilabilirLimit: kullanilabilirLimit,
                asgariOran: extras.asgariOran, // From localStorage (UI helper only)
                hesapKesimGunu: card.closingDay ?? 1,
                sonOdemeGunu: card.dueDay ?? 1,
                maskeliKartNo: extras.maskeliKartNo, // From localStorage (UI helper only)
                aktifMi: card.isActive,
                sonEkstreBorcu, // From backend (authoritative)
                guncelBorc, // From backend (authoritative)
              };
            });
            
            // BUG-2 FIX: Update state - buildUpcomingPayments useMemo will automatically recalculate
            setBanks(mappedBanks);
            setCreditCards(mappedCreditCards);
            
            // BUG FIX: Reload dashboard summary to update upcoming payments
            // This ensures that newly added credit cards/loans appear in upcoming payments immediately
            await loadDashboardSummary();
          } catch (error) {
            console.error('Failed to reload data after settings close:', error);
            // Don't show alert for connection errors - backend might be down
            // User will see the error in console, and data will reload when backend is back
          }
        }}
        activeTab={settingsTab}
        onChangeTab={setSettingsTab}
        banks={banks}
        setBanks={setBanks}
        posTerminals={posTerminals}
        setPosTerminals={setPosTerminals}
        customers={customers}
        setCustomers={setCustomers}
        suppliers={suppliers}
        setSuppliers={setSuppliers}
        creditCards={creditCards}
        setCreditCards={setCreditCards}
        loans={loans}
        setLoans={setLoans}
        globalSettings={globalSettings}
        setGlobalSettings={setGlobalSettings}
      />
      <EpostaLogsModal isOpen={openForm === 'EPOSTA_LOG'} onClose={() => setOpenForm(null)} />
      <KullaniciAyarlarModal isOpen={openForm === 'KULLANICI_AYAR'} onClose={() => setOpenForm(null)} />
      <KrediKartiIzlemeModal
        isOpen={openForm === 'KK_IZLEME'}
        onClose={() => setOpenForm(null)}
        creditCards={creditCards}
        banks={banks}
        globalSettings={globalSettings}
      />

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <h2 className="text-lg font-semibold text-gray-800">{previewTitle}</h2>
              <button
                className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full p-2 transition-colors"
                onClick={() => setPreviewImageUrl(null)}
                aria-label="Kapat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 rounded">
              <img 
                src={previewImageUrl} 
                alt={previewTitle} 
                className="max-w-full max-h-[calc(90vh-120px)] h-auto object-contain" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
