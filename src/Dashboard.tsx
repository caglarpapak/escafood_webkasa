import { useEffect, useMemo, useState } from 'react';
import { AppUser } from './models/user';
import { BankMaster } from './models/bank';
import { PosTerminal } from './models/pos';
import { Customer } from './models/customer';
import { Supplier } from './models/supplier';
import { CreditCard } from './models/card';
import { GlobalSettings } from './models/settings';
import { Cheque } from './models/cheque';
import { DailyTransaction, DailyTransactionSource, DailyTransactionType } from './models/transaction';
import { UpcomingPayment } from './models/upcomingPayment';
import { isoToDisplay, todayIso, getWeekdayTr, diffInDays } from './utils/date';
import { formatTl } from './utils/money';
import { getNextBelgeNo } from './utils/documentNo';
import { generateId } from './utils/id';
import { getCreditCardNextDue } from './utils/creditCard';
import { apiGet, apiPost, apiDelete } from './utils/api';
import NakitGiris, { NakitGirisFormValues } from './forms/NakitGiris';
import NakitCikis, { NakitCikisFormValues } from './forms/NakitCikis';
import BankaNakitGiris, { BankaNakitGirisFormValues } from './forms/BankaNakitGiris';
import BankaNakitCikis, { BankaNakitCikisFormValues } from './forms/BankaNakitCikis';
import PosTahsilat, { PosTahsilatFormValues } from './forms/PosTahsilat';
import KrediKartiTedarikciOdeme, { KrediKartiTedarikciOdemeFormValues } from './forms/KrediKartiTedarikciOdeme';
import KrediKartiMasraf, { KrediKartiMasrafFormValues } from './forms/KrediKartiMasraf';
import CekIslemleriModal, { CekIslemPayload } from './forms/CekIslemleriModal';
import AyarlarModal, { SettingsTabKey } from './forms/AyarlarModal';
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
  // Sort by date and documentNo to maintain order
  const merged = [...existing, ...filtered].sort((a, b) => {
    if (a.isoDate === b.isoDate) return a.documentNo.localeCompare(b.documentNo);
    return a.isoDate.localeCompare(b.isoDate);
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

  // Start with empty banks array - will be loaded from backend
  const [banks, setBanks] = useState<BankMaster[]>([]);
  const [posTerminals, setPosTerminals] = useState<PosTerminal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    varsayilanAsgariOdemeOrani: 0.4,
    varsayilanBsmvOrani: 0.05,
    yaklasanOdemeGun: 7,
  });
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [dailyTransactions, setDailyTransactions] = useState<DailyTransaction[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [cekInitialTab, setCekInitialTab] = useState<'GIRIS' | 'CIKIS' | 'YENI' | 'RAPOR'>('GIRIS');

  // Fix Bug 6: Fetch credit cards from backend on mount
  useEffect(() => {
    const fetchCreditCards = async () => {
      try {
        console.log('Loading credit cards from backend...');
        const backendCreditCards = await apiGet<Array<{
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
        }>>('/api/credit-cards');

        console.log('Backend credit cards received:', backendCreditCards);

        // Fix: Load credit card extras (sonEkstreBorcu, asgariOran, maskeliKartNo) from localStorage
        const cardExtrasKey = 'esca-webkasa-card-extras';
        const savedExtras = localStorage.getItem(cardExtrasKey);
        const cardExtras: Record<string, { sonEkstreBorcu: number; asgariOran: number; maskeliKartNo: string }> = savedExtras ? JSON.parse(savedExtras) : {};
        
        const mappedCreditCards: CreditCard[] = backendCreditCards.map((card) => {
          // Fix Bug 6: Preserve null limits from backend (don't convert to 0)
          // If limit is null, it means it's not set, so keep it as null
          // If limit is set (e.g., 250000), use that value
          const limit = card.limit; // Preserve null if not set
          const availableLimit = card.availableLimit; // Preserve null if limit is not set
          const extras = cardExtras[card.id] || { sonEkstreBorcu: 0, asgariOran: 0.4, maskeliKartNo: '' };

          return {
            id: card.id,
            bankaId: card.bankId || '',
            kartAdi: card.name,
            kartLimit: limit, // Use backend limit (can be null)
            limit: limit, // Use backend limit (can be null)
            kullanilabilirLimit: availableLimit, // Use backend availableLimit (can be null)
            asgariOran: extras.asgariOran, // Load from localStorage
            hesapKesimGunu: card.closingDay ?? 1,
            sonOdemeGunu: card.dueDay ?? 1,
            maskeliKartNo: extras.maskeliKartNo, // Load from localStorage
            aktifMi: card.isActive,
            sonEkstreBorcu: extras.sonEkstreBorcu, // Load from localStorage
            guncelBorc: card.currentDebt, // Use backend currentDebt
          };
        });

        console.log('Mapped credit cards:', mappedCreditCards);
        setCreditCards(mappedCreditCards);
      } catch (error) {
        console.error('Failed to load credit cards from backend:', error);
        setCreditCards([]);
      }
    };

    fetchCreditCards();
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
            acilisBakiyesi: bank.currentBalance, // Use currentBalance from backend
            aktifMi: bank.isActive,
            // Fix Bug 2: Load boolean flags from localStorage
            cekKarnesiVarMi: flags.cekKarnesiVarMi,
            posVarMi: flags.posVarMi,
            krediKartiVarMi: flags.krediKartiVarMi,
          };
        });
        
        console.log('Mapped banks:', mappedBanks);
        setBanks(mappedBanks);
      } catch (error) {
        console.error('Failed to load banks from backend:', error);
        // Clear mock banks on error - user must create banks first
        setBanks([]);
      }
    };
    
    fetchBanks();
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
        const mapped = response.items.map((tx) => ({
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
        }));
        setDailyTransactions(mapped);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch today\'s transactions:', error);
        // Ensure empty array on error - no stale data
        setDailyTransactions([]);
      }
    };
    fetchTodaysTransactions();
  }, []);

  useEffect(() => {
    const fetchUpcomingPayments = async () => {
      const payments: UpcomingPayment[] = [];
      const today = todayIso();

      // Fix Bug 7: Show all credit cards with debt, not just those with krediKartiVarMi flag
      creditCards
        .filter((c) => c.sonEkstreBorcu > 0)
        .forEach((card) => {
          const { dueIso, dueDisplay, daysLeft } = getCreditCardNextDue(card);
          payments.push({
            id: `cc-${card.id}`,
            category: 'KREDI_KARTI',
            bankName: banks.find((b) => b.id === card.bankaId)?.bankaAdi || '-',
            name: card.kartAdi,
            dueDateIso: dueIso,
            dueDateDisplay: dueDisplay,
            amount: card.sonEkstreBorcu,
            daysLeft,
          });
        });

      cheques
        .filter((c) => c.direction === 'BORC') // Only our issued cheques (BORC) appear in upcoming payments
        .filter((c) => ['KASADA', 'BANKADA_TAHSILDE', 'ODEMEDE'].includes(c.status))
        .forEach((cek) => {
          payments.push({
            id: `cek-${cek.id}`,
            category: 'CEK',
            bankName: cek.bankaAdi || '-',
            name: cek.lehtar,
            dueDateIso: cek.vadeTarihi,
            dueDateDisplay: isoToDisplay(cek.vadeTarihi),
            amount: cek.tutar,
            daysLeft: diffInDays(today, cek.vadeTarihi),
          });
        });
      payments.sort((a, b) => a.daysLeft - b.daysLeft);
      setUpcomingPayments(payments);
    };

    fetchUpcomingPayments();
  }, [banks, creditCards, cheques, dailyTransactions.length]); // Refresh when transactions change

  const bankDeltasById = useMemo(() => {
    return dailyTransactions.reduce((map, tx) => {
      if (tx.bankId && tx.bankDelta) {
        map[tx.bankId] = (map[tx.bankId] || 0) + tx.bankDelta;
      }
      return map;
    }, {} as Record<string, number>);
  }, [dailyTransactions]);

  const totalBanksBalance = useMemo(
    () =>
      banks
        .filter((b) => b.aktifMi)
        .reduce((sum, b) => sum + (b.acilisBakiyesi || 0) + (bankDeltasById[b.id] || 0), 0),
    [banks, bankDeltasById]
  );

  // BUG 1 FIX: Calculate cash balance from backend balanceAfter values
  // Backend already calculates balanceAfter correctly starting from 0
  // Use the last KASA transaction's balanceAfter, or BASE_CASH_BALANCE if no transactions
  const cashBalance = useMemo(() => {
    const kasaTransactions = dailyTransactions.filter((tx) => tx.source === 'KASA');
    if (kasaTransactions.length === 0) return BASE_CASH_BALANCE;
    // BUG 1 FIX: Use balanceAfter from backend (already calculated correctly)
    // Sort by date to get the last transaction
    const sorted = [...kasaTransactions].sort((a, b) => {
      if (a.isoDate === b.isoDate) return a.documentNo.localeCompare(b.documentNo);
      return a.isoDate.localeCompare(b.isoDate);
    });
    const lastTx = sorted[sorted.length - 1];
    // BUG 1 FIX: Use balanceAfter from backend, not recalculated value
    // Test scenario: starting cash=0, Cash In 20.000 → balance 20.000, Cash Out 10.000 → balance 10.000, Cash In 50.000 → balance 60.000
    return lastTx.balanceAfter ?? BASE_CASH_BALANCE;
  }, [dailyTransactions]);

  const chequesInCash = cheques.filter((c) => c.status === 'KASADA');
  const chequesTotal = chequesInCash.reduce((sum, c) => sum + c.tutar, 0);

  const today = todayIso();
  const todaysTransactions = useMemo(
    () => dailyTransactions.filter((tx) => tx.isoDate === today),
    [dailyTransactions, today]
  );

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
      }>('/api/transactions', {
        isoDate: values.islemTarihiIso,
        documentNo,
        type: isBankToCash ? 'BANKA_KASA_TRANSFER' : 'NAKIT_TAHSILAT',
        source: isBankToCash ? 'BANKA' : 'KASA',
        counterparty,
        description: values.aciklama || null,
        incoming: values.tutar,
        outgoing: 0,
        bankDelta: isBankToCash ? -values.tutar : 0,
        bankId: isBankToCash && values.bankaId ? values.bankaId : null,
      });

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
      addTransactions([tx]);
      setOpenForm(null);
      
      // Refresh today's transactions from backend to ensure we have the latest data
      const today = todayIso();
      try {
        const refreshResponse = await apiGet<{ items: any[]; totalCount: number }>(
          `/api/transactions?from=${today}&to=${today}&sortKey=isoDate&sortDir=asc`
        );
        const refreshed = refreshResponse.items.map((tx) => ({
          id: tx.id,
          isoDate: tx.isoDate,
          displayDate: isoToDisplay(tx.isoDate),
          documentNo: tx.documentNo || '',
          type: tx.type,
          source: tx.source,
          counterparty: tx.counterparty || '',
          description: tx.description || '',
          incoming: tx.incoming,
          outgoing: tx.outgoing,
          balanceAfter: tx.balanceAfter,
          bankId: tx.bankId || undefined,
          bankDelta: tx.bankDelta || undefined,
          displayIncoming: tx.displayIncoming || undefined,
          displayOutgoing: tx.displayOutgoing || undefined,
          createdAtIso: tx.createdAt,
          createdBy: tx.createdBy,
        }));
        setDailyTransactions(refreshed);
      } catch (refreshError) {
        console.error('Failed to refresh transactions:', refreshError);
        // Continue anyway - the transaction was already added to state
      }
    } catch (error) {
      console.error('Failed to save nakit giris:', error);
      alert('İşlem kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleNakitCikisSaved = async (values: NakitCikisFormValues) => {
    try {
      const documentNo = getNextBelgeNo('NKT-CKS', values.islemTarihiIso, dailyTransactions);
      const foundSupplier = values.muhatapId ? suppliers.find((s) => s.id === values.muhatapId) : undefined;
      const counterparty =
        (foundSupplier && `${foundSupplier.kod} - ${foundSupplier.ad}`) || values.muhatap || 'Diğer';
      const isCashToBank = values.kaynak === 'KASA_TRANSFER_BANKAYA';
      
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
      }>('/api/transactions', {
        isoDate: values.islemTarihiIso,
        documentNo,
        type: isCashToBank ? 'KASA_BANKA_TRANSFER' : 'NAKIT_ODEME',
        source: isCashToBank ? 'BANKA' : 'KASA',
        counterparty,
        description: values.aciklama || null,
        incoming: 0,
        outgoing: values.tutar, // Fix: Set outgoing = amount for cash out
        bankDelta: isCashToBank ? values.tutar : 0,
        bankId: isCashToBank && values.bankaId ? values.bankaId : null,
      });

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
        outgoing: response.outgoing, // Fix: Use outgoing from backend
        balanceAfter: response.balanceAfter,
        bankId: response.bankId || undefined,
        bankDelta: response.bankDelta || undefined,
        createdAtIso: response.createdAt,
        createdBy: response.createdBy,
      };
      addTransactions([tx]);
      setOpenForm(null);
      
      // Refresh today's transactions from backend to ensure we have the latest data
      const today = todayIso();
      try {
        const refreshResponse = await apiGet<{ items: any[]; totalCount: number }>(
          `/api/transactions?from=${today}&to=${today}&sortKey=isoDate&sortDir=asc`
        );
        const refreshed = refreshResponse.items.map((tx) => ({
          id: tx.id,
          isoDate: tx.isoDate,
          displayDate: isoToDisplay(tx.isoDate),
          documentNo: tx.documentNo || '',
          type: tx.type,
          source: tx.source,
          counterparty: tx.counterparty || '',
          description: tx.description || '',
          incoming: tx.incoming,
          outgoing: tx.outgoing,
          balanceAfter: tx.balanceAfter,
          bankId: tx.bankId || undefined,
          bankDelta: tx.bankDelta || undefined,
          displayIncoming: tx.displayIncoming || undefined,
          displayOutgoing: tx.displayOutgoing || undefined,
          createdAtIso: tx.createdAt,
          createdBy: tx.createdBy,
        }));
        setDailyTransactions(refreshed);
      } catch (refreshError) {
        console.error('Failed to refresh transactions:', refreshError);
        // Continue anyway - the transaction was already added to state
      }
    } catch (error) {
      console.error('Failed to save nakit cikis:', error);
      alert('İşlem kaydedilemedi. Lütfen tekrar deneyin.');
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
                acilisBakiyesi: bank.currentBalance,
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
            incoming: values.tutar, // Backend will normalize to 0 for BANK CASH IN
            outgoing: 0,
            bankDelta: values.tutar, // Backend will use this for bankDelta
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

      addTransactions([tx]);
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
          incoming: 0,
          outgoing: values.tutar, // Fix Bug 8: Set outgoing = amount for bank cash out
          bankDelta: -values.tutar,
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
          createdAtIso: inResponse.createdAt,
          createdBy: inResponse.createdBy,
        };

        addTransactions([outTx, inTx]);
        setOpenForm(null);
        return;
      } else {
        const documentNo = getNextBelgeNo('BNK-CKS', values.islemTarihiIso, dailyTransactions);
        let tutar = values.tutar;
        let aciklama = values.aciklama || '';
        let counterparty = values.muhatap || 'Diğer';
        let description = aciklama;


        // BUG 7 FIX: Handle cheque payment - get cheque info and supplier
        let chequeToUpdate: { id: string; supplierId: string | null } | null = null;
        if (values.islemTuru === 'CEK_ODEME' && values.cekId) {
          const cheque = cheques.find((c) => c.id === values.cekId);
          if (cheque) {
            tutar = cheque.tutar;
            // BUG 7 FIX: Use supplierId from form if provided, otherwise from cheque
            const supplierId = values.supplierId || cheque.tedarikciId || null;
            const supplier = supplierId ? suppliers.find((s) => s.id === supplierId) : undefined;
            counterparty = supplier ? `${supplier.kod} - ${supplier.ad}` : cheque.lehtar || counterparty;
            description = `Çek No: ${cheque.cekNo}${values.aciklama ? ` – ${values.aciklama}` : ''}`;
            // BUG 7 FIX: Store cheque info to update status after transaction is created
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
            }>('/api/credit-cards/payment', {
              creditCardId: values.krediKartiId,
              isoDate: values.islemTarihiIso,
              amount: values.tutar,
              description: values.aciklama || null,
              paymentSource: 'BANKA', // Always from bank in this flow
              bankId: values.bankaId || null,
            });

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

            addTransactions([tx]);
            setOpenForm(null);
            return;
          } catch (error: any) {
            alert(`Hata: ${error.message || 'Kredi kartı ödemesi kaydedilemedi'}`);
            return;
          }
        }

        // Fix Bug 2: Get supplier for supplier payments
        const selectedSupplier = values.supplierId ? suppliers.find((s) => s.id === values.supplierId) : undefined;
        if (values.islemTuru === 'TEDARIKCI_ODEME' && selectedSupplier) {
          counterparty = `${selectedSupplier.kod} - ${selectedSupplier.ad}`;
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
          // Backend normalizes: incoming=0, outgoing=amount, bankDelta=-amount
          // But we need displayOutgoing=amount for UI display
          type: values.islemTuru === 'CEK_ODEME' ? 'CEK_ODENMESI' : 'NAKIT_ODEME',
          source: 'BANKA',
          counterparty: counterparty || 'Diğer',
          description: description || null,
          incoming: 0,
          outgoing: tutar, // BUG 3 FIX: Must be > 0 for bank cash out
          bankDelta: -tutar, // Backend will normalize correctly
          displayIncoming: null, // BUG 2 FIX: No incoming for bank cash out
          displayOutgoing: tutar, // BUG 2 FIX: Show amount in UI
          bankId: normalizedBankId,
          // BUG 3 FIX: Normalize supplierId and creditCardId - convert empty strings to null
          supplierId: (values.supplierId && values.supplierId.trim()) ? values.supplierId.trim() : null,
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

        addTransactions([tx]);
        
        // BUG 7 FIX: Update cheque status to ODEMEDE and set supplierId after transaction is created
        if (chequeToUpdate) {
          try {
            await apiPut<{
              id: string;
              status: string;
              supplierId: string | null;
            }>(`/api/cheques/${chequeToUpdate.id}/status`, {
              newStatus: 'ODEMEDE', // BUG 7 FIX: Status should be ODEMEDE when cheque is given to supplier
              isoDate: values.islemTarihiIso,
              supplierId: chequeToUpdate.supplierId, // BUG 7 FIX: Set supplierId when cheque is given to supplier
              description: description || null,
            });
            
            // Update local cheque state
            setCheques((prev) =>
              prev.map((c) => 
                c.id === chequeToUpdate.id 
                  ? { ...c, status: 'ODEMEDE', kasaMi: false, tedarikciId: chequeToUpdate.supplierId || undefined }
                  : c
              )
            );
          } catch (chequeError: any) {
            console.error('Failed to update cheque status:', chequeError);
            // Don't block the transaction - just log the error
          }
        }
        
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
        bankDelta: values.netTutar, // BUG 5 FIX: Net amount (brut - commission)
        bankId: values.bankaId,
        displayIncoming: values.brutTutar, // BUG 5 FIX: Brut amount for display
        displayOutgoing: null, // BUG 5 FIX: Must be null/0 for POS_TAHSILAT_BRUT validation
      });

      // Fix: POS commission transaction - outgoing=commissionAmount, bankDelta=-commissionAmount
      const komisyonResponse = await apiPost<{
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
      }>('/api/transactions', {
        isoDate: values.islemTarihiIso,
        documentNo: `${documentNo}-KOM`,
        type: 'POS_KOMISYONU',
        source: 'POS',
        counterparty,
        description: values.aciklama || 'POS Komisyonu',
        incoming: 0,
        outgoing: 0, // Backend will normalize based on transaction type
        bankDelta: -values.komisyonTutar, // Commission reduces bank balance
        bankId: values.bankaId,
        displayOutgoing: values.komisyonTutar,
      });

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
        displayIncoming: brutResponse.displayIncoming || undefined,
        createdAtIso: brutResponse.createdAt,
        createdBy: brutResponse.createdBy,
      };

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
        bankDelta: komisyonResponse.bankDelta || undefined,
        displayOutgoing: komisyonResponse.displayOutgoing || undefined,
        createdAtIso: komisyonResponse.createdAt,
        createdBy: komisyonResponse.createdBy,
      };

      addTransactions([brutTx, komisyonTx]);
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
        displayOutgoing: response.transaction.displayOutgoing || undefined,
        createdAtIso: new Date().toISOString(),
        createdBy: currentUser.email,
      };

      addTransactions([tx]);
      
      // BUG 6 FIX: Re-fetch credit cards to update currentDebt after expense
      try {
        const backendCreditCards = await apiGet<Array<{
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
        }>>('/api/credit-cards');
        
        const cardExtrasKey = 'esca-webkasa-card-extras';
        const savedExtras = localStorage.getItem(cardExtrasKey);
        const cardExtras: Record<string, { sonEkstreBorcu: number; asgariOran: number; maskeliKartNo: string }> = savedExtras ? JSON.parse(savedExtras) : {};
        
        const mappedCreditCards: CreditCard[] = backendCreditCards.map((card) => {
          const limit = card.limit;
          const availableLimit = card.availableLimit;
          const extras = cardExtras[card.id] || { sonEkstreBorcu: 0, asgariOran: 0.4, maskeliKartNo: '' };
          
          return {
            id: card.id,
            bankaId: card.bankId || '',
            kartAdi: card.name,
            kartLimit: limit,
            limit: limit,
            kullanilabilirLimit: availableLimit,
            asgariOran: extras.asgariOran,
            hesapKesimGunu: card.closingDay ?? 1,
            sonOdemeGunu: card.dueDay ?? 1,
            maskeliKartNo: extras.maskeliKartNo,
            aktifMi: card.isActive,
            sonEkstreBorcu: extras.sonEkstreBorcu,
            guncelBorc: card.currentDebt, // BUG 6 FIX: Use updated currentDebt from backend
          };
        });
        
        setCreditCards(mappedCreditCards);
      } catch (refreshError) {
        console.error('Failed to refresh credit cards after expense:', refreshError);
      }
      
      setOpenForm(null);
    } catch (error: any) {
      alert(`Hata: ${error.message || 'Kredi kartı harcaması kaydedilemedi'}`);
    }
  };

  const handleKrediKartiMasrafSaved = async (values: KrediKartiMasrafFormValues) => {
    try {
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
      }>('/api/credit-cards/expense', {
        creditCardId: values.cardId,
        isoDate: values.islemTarihiIso,
        amount: values.tutar,
        description: values.aciklama || null,
        counterparty: counterparty || 'Masraf' || null,
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
        displayOutgoing: response.transaction.displayOutgoing || undefined,
        createdAtIso: new Date().toISOString(),
        createdBy: currentUser.email,
      };

      addTransactions([tx]);
      
      // BUG 6 FIX: Re-fetch credit cards to update currentDebt after expense
      try {
        const backendCreditCards = await apiGet<Array<{
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
        }>>('/api/credit-cards');
        
        const cardExtrasKey = 'esca-webkasa-card-extras';
        const savedExtras = localStorage.getItem(cardExtrasKey);
        const cardExtras: Record<string, { sonEkstreBorcu: number; asgariOran: number; maskeliKartNo: string }> = savedExtras ? JSON.parse(savedExtras) : {};
        
        const mappedCreditCards: CreditCard[] = backendCreditCards.map((card) => {
          const limit = card.limit;
          const availableLimit = card.availableLimit;
          const extras = cardExtras[card.id] || { sonEkstreBorcu: 0, asgariOran: 0.4, maskeliKartNo: '' };
          
          return {
            id: card.id,
            bankaId: card.bankId || '',
            kartAdi: card.name,
            kartLimit: limit,
            limit: limit,
            kullanilabilirLimit: availableLimit,
            asgariOran: extras.asgariOran,
            hesapKesimGunu: card.closingDay ?? 1,
            sonOdemeGunu: card.dueDay ?? 1,
            maskeliKartNo: extras.maskeliKartNo,
            aktifMi: card.isActive,
            sonEkstreBorcu: extras.sonEkstreBorcu,
            guncelBorc: card.currentDebt, // BUG 6 FIX: Use updated currentDebt from backend
          };
        });
        
        setCreditCards(mappedCreditCards);
      } catch (refreshError) {
        console.error('Failed to refresh credit cards after expense:', refreshError);
      }
      
      setOpenForm(null);
    } catch (error: any) {
      alert(`Hata: ${error.message || 'Kredi kartı masrafı kaydedilemedi'}`);
    }
  };

  const handleCekIslemSaved = (payload: CekIslemPayload) => {
    setCheques(payload.updatedCheques);
    if (payload.transaction) {
      addTransactions([payload.transaction]);
    }
    setOpenForm(null);
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
        createdAtIso: tx.createdAt,
        createdBy: tx.createdBy,
      }));
      setDailyTransactions(mapped);
    } catch (error) {
      console.error('Failed to refresh transactions after delete:', error);
      // Fallback: just remove the transaction from local state
      setDailyTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const todayDisplay = isoToDisplay(today);
  const weekday = getWeekdayTr(today);

  return (
    <div className="flex min-h-screen bg-slate-100">
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

      <div className="flex-1 lg:ml-72 min-h-screen">
        <div className="no-print sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                ☰
              </button>
              <img
                src="https://esca-food.com/image/cache/catalog/esca%20food%20logosu%20tek_-700x800.png"
                alt="Esca Food"
                className="h-[120px] object-contain"
              />
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <img
                src="https://esca-food.com/image/cache/catalog/web%20kasa%20logosu%20tek_-700x800.png"
                alt="Web Kasa"
                className="h-[120px] object-contain"
              />
              <span>{currentUser.email}</span>
              <button
                className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-100"
                onClick={onLogout}
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>

        {activeView === 'DASHBOARD' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-600">Bankalar Toplamı</div>
                <div className="text-3xl font-bold mt-2">{formatTl(totalBanksBalance)}</div>
                <div className="mt-3 max-h-52 overflow-auto divide-y">
                  {banks.filter((b) => b.aktifMi).length === 0 && (
                    <div className="py-2 text-sm text-slate-500">Tanımlı banka hesabı yok.</div>
                  )}
                  {banks
                    .filter((b) => b.aktifMi)
                    .map((b) => (
                      <div key={b.id} className="flex justify-between py-2 text-sm">
                        <span>{b.hesapAdi}</span>
                        <span className="font-semibold">{formatTl((b.acilisBakiyesi || 0) + (bankDeltasById[b.id] || 0))}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-600">Ana Kasa Bakiyesi</div>
                <div className="text-3xl font-bold mt-2">{formatTl(cashBalance)}</div>
              </div>
              <div className="card p-4">
                <div className="text-sm font-semibold text-slate-600">Kasadaki Çekler</div>
                <div className="mt-2 text-lg font-semibold">{chequesInCash.length} Adet</div>
                <div className="text-2xl font-bold">{formatTl(chequesTotal)}</div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">Yaklaşan Ödemeler</div>
                  <div className="text-xs text-slate-500">Kredi kartı, kredi ve çek vadesi yaklaşan ödemeler</div>
                </div>
              </div>
              <div className="mt-3 overflow-auto">
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
                    {upcomingPayments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-3 text-center text-slate-500">
                          Kayıt yok.
                        </td>
                      </tr>
                    )}
                    {upcomingPayments.map((p) => {
                      let color = 'text-slate-700';
                      if (p.daysLeft < 0) color = 'text-rose-600 font-semibold';
                      else if (p.daysLeft <= globalSettings.yaklasanOdemeGun) color = 'text-amber-600 font-semibold';
                      return (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-2 px-2">{p.category}</td>
                          <td className="py-2 px-2">{p.bankName}</td>
                          <td className="py-2 px-2">{p.name}</td>
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
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">Gün İçi İşlemler</div>
                <div className="text-sm text-slate-600 flex items-center space-x-2">
                  <span>{todayDisplay}</span>
                  <span className="text-orange-500 capitalize">{weekday}</span>
                </div>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                    <tr>
                      <th className="py-2 px-2 text-left">Tarih</th>
                      <th className="py-2 px-2 text-left">Belge No</th>
                      <th className="py-2 px-2 text-left">Tür</th>
                      <th className="py-2 px-2 text-left">Kaynak</th>
                      <th className="py-2 px-2 text-left">Muhatap</th>
                      <th className="py-2 px-2 text-left">Açıklama</th>
                      <th className="py-2 px-2 text-right">Giriş</th>
                      <th className="py-2 px-2 text-right">Çıkış</th>
                      <th className="py-2 px-2 text-right">Bakiye</th>
                      <th className="py-2 px-2 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysTransactions.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-3 text-center text-slate-500">
                          Gün içi işlem yok.
                        </td>
                      </tr>
                    )}
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
                        <td className="py-2 px-2 text-right text-emerald-600">
                          {tx.displayIncoming !== undefined ? formatTl(tx.displayIncoming) : tx.incoming ? formatTl(tx.incoming) : '-'}
                        </td>
                        <td className="py-2 px-2 text-right text-rose-600">
                          {tx.displayOutgoing !== undefined 
                            ? formatTl(tx.displayOutgoing) 
                            : (tx.outgoing !== undefined && tx.outgoing !== null && tx.outgoing > 0) 
                              ? formatTl(tx.outgoing) 
                              : '-'}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold">{formatTl(tx.balanceAfter)}</td>
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
              transactions={dailyTransactions}
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
              apiGet<Array<{
                id: string;
                name: string;
                bankId: string | null;
                limit: number | null;
                closingDay: number | null;
                dueDay: number | null;
                isActive: boolean;
                currentDebt: number;
                availableLimit: number | null;
                bank?: { id: string; name: string } | null;
              }>>('/api/credit-cards'),
            ]);
            
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
                acilisBakiyesi: bank.currentBalance,
                aktifMi: bank.isActive,
                cekKarnesiVarMi: flags.cekKarnesiVarMi,
                posVarMi: flags.posVarMi,
                krediKartiVarMi: flags.krediKartiVarMi,
              };
            });
            
            // Fix: Load credit card extras from localStorage
            const cardExtrasKey = 'esca-webkasa-card-extras';
            const savedExtras = localStorage.getItem(cardExtrasKey);
            const cardExtras: Record<string, { sonEkstreBorcu: number; asgariOran: number; maskeliKartNo: string }> = savedExtras ? JSON.parse(savedExtras) : {};
            
            const mappedCreditCards: CreditCard[] = backendCreditCards.map((card) => {
              const limit = card.limit; // Preserve null if not set
              const availableLimit = card.availableLimit; // Preserve null if limit is not set
              const extras = cardExtras[card.id] || { sonEkstreBorcu: 0, asgariOran: 0.4, maskeliKartNo: '' };
              
              return {
                id: card.id,
                bankaId: card.bankId || '',
                kartAdi: card.name,
                kartLimit: limit, // Use backend limit (can be null)
                limit: limit, // Use backend limit (can be null)
                kullanilabilirLimit: availableLimit, // Use backend availableLimit (can be null)
                asgariOran: extras.asgariOran,
                hesapKesimGunu: card.closingDay ?? 1,
                sonOdemeGunu: card.dueDay ?? 1,
                maskeliKartNo: extras.maskeliKartNo,
                aktifMi: card.isActive,
                sonEkstreBorcu: extras.sonEkstreBorcu,
                guncelBorc: card.currentDebt,
              };
            });
            
            setBanks(mappedBanks);
            setCreditCards(mappedCreditCards);
          } catch (error) {
            console.error('Failed to reload data after settings close:', error);
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
    </div>
  );
}
