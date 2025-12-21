import { useMemo, useState, useEffect } from 'react';
import {
  DailyTransaction,
  getTransactionSourceLabel,
  getTransactionTypeLabel,
} from '../models/transaction';
import { BankMaster } from '../models/bank';
import { isoToDisplay, todayIso } from '../utils/date';
import { formatTl } from '../utils/money';
import { HomepageIcon } from '../components/HomepageIcon';
import { printReport } from '../utils/pdfExport';
import { resolveDisplayAmounts } from '../utils/transactionDisplay';
import { apiGet } from '../utils/api';

interface Props {
  banks: BankMaster[];
  currentUserEmail: string;
  onBackToDashboard?: () => void;
}

type SourceGroup = 'HEPSI' | 'NAKIT' | 'BANKA' | 'KART' | 'CEK' | 'POS';

type Summary = {
  totalRecords: number;
  totalCashIn: number;
  totalCashOut: number;
  totalBankIn: number;
  totalBankOut: number;
};

// Backend TransactionDto interface
interface TransactionDto {
  id: string;
  isoDate: string;
  documentNo: string | null;
  type: string;
  source: string;
  counterparty: string | null;
  description: string | null;
  category?: string | null;
  incoming: number;
  outgoing: number;
  bankDelta: number;
  displayIncoming: number | null;
  displayOutgoing: number | null;
  balanceAfter: number;
  cashAccountId: string | null;
  bankId: string | null;
  creditCardId: string | null;
  chequeId: string | null;
  customerId: string | null;
  supplierId: string | null;
  attachmentId: string | null;
  loanInstallmentId: string | null;
  transferGroupId: string | null;
  createdAt: string;
  createdBy: string;
  createdByEmail: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}

interface TransactionListResponse {
  items: TransactionDto[];
  totalCount: number;
  totalIncoming: number;
  totalOutgoing: number;
}

function mapTransactionDtoToDailyTransaction(dto: TransactionDto): DailyTransaction {
  return {
    id: dto.id,
    isoDate: dto.isoDate,
    displayDate: isoToDisplay(dto.isoDate),
    documentNo: dto.documentNo || '',
    type: dto.type as any,
    source: dto.source as any,
    counterparty: dto.counterparty || '',
    description: dto.description || '',
    category: dto.category || undefined,
    incoming: dto.incoming,
    outgoing: dto.outgoing,
    balanceAfter: dto.balanceAfter,
    bankId: dto.bankId || undefined,
    bankDelta: dto.bankDelta || undefined,
    displayIncoming: dto.displayIncoming || undefined,
    displayOutgoing: dto.displayOutgoing || undefined,
    createdAtIso: dto.createdAt,
    createdBy: dto.createdBy,
    createdByEmail: dto.createdByEmail,
  };
}

function mapSourceGroup(tx: DailyTransaction): SourceGroup {
  switch (tx.source) {
    case 'KASA':
      return 'NAKIT';
    case 'BANKA':
      return 'BANKA';
    case 'KREDI_KARTI':
      return 'KART';
    case 'CEK':
      return 'CEK';
    case 'POS':
      return 'POS';
    default:
      return 'HEPSI';
  }
}

function formatTime(iso?: string) {
  if (!iso) return '-';
  return iso.slice(11, 16) || '-';
}

export function IslemLoguReport({ banks, currentUserEmail, onBackToDashboard }: Props) {
  const today = todayIso();
  
  // İşlem Logu: Tüm zamanları kapsamalı - varsayılan olarak tüm işlemler gösterilir
  const [fromDate, setFromDate] = useState('2000-01-01'); // Çok eski bir tarih - tüm işlemleri kapsar
  const [toDate, setToDate] = useState(today);
  const [userFilter, setUserFilter] = useState<string>('HEPSI');
  const [typeFilter, setTypeFilter] = useState<string>('HEPSI');
  const [sourceFilter, setSourceFilter] = useState<SourceGroup>('HEPSI');
  const [bankFilter, setBankFilter] = useState<string>('HEPSI');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [searchText, setSearchText] = useState('');

  // Data fetching states
  const [transactions, setTransactions] = useState<DailyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch transactions from backend
  useEffect(() => {
    let cancelled = false;
    
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.set('from', fromDate);
        params.set('to', toDate);
        params.set('page', '1');
        params.set('pageSize', '500'); // Large page size for report
        
        // Apply filters
        if (typeFilter !== 'HEPSI') {
          params.set('type', typeFilter);
        }
        if (sourceFilter !== 'HEPSI') {
          // Map SourceGroup to backend source values
          const sourceMap: Record<SourceGroup, string> = {
            HEPSI: '',
            NAKIT: 'KASA',
            BANKA: 'BANKA',
            KART: 'KREDI_KARTI',
            CEK: 'CEK',
            POS: 'POS',
          };
          if (sourceMap[sourceFilter]) {
            params.set('source', sourceMap[sourceFilter]);
          }
        }
        if (bankFilter !== 'HEPSI') {
          params.set('bankId', bankFilter);
        }
        if (userFilter !== 'HEPSI') {
          params.set('createdByEmail', userFilter);
        }
        if (searchText.trim()) {
          params.set('search', searchText.trim());
        }
        
        // Sort by date descending (newest first)
        params.set('sortKey', 'isoDate');
        params.set('sortDir', 'desc');
        
        const response = await apiGet<TransactionListResponse>(`/api/transactions?${params.toString()}`);
        
        if (!cancelled) {
          const mappedTransactions = response.items.map(mapTransactionDtoToDailyTransaction);
          setTransactions(mappedTransactions);
          setTotalCount(response.totalCount);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching transactions:', err);
          setError(err instanceof Error ? err.message : 'İşlemler yüklenirken bir hata oluştu');
          setLoading(false);
        }
      }
    };
    
    fetchTransactions();
    
    return () => {
      cancelled = true;
    };
  }, [fromDate, toDate, typeFilter, sourceFilter, bankFilter, userFilter, searchText]);

  // Get distinct users and types from fetched transactions
  const distinctUsers = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.createdByEmail || t.createdBy).filter(Boolean))) as string[];
  }, [transactions]);

  const distinctTypes = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.type).filter(Boolean))) as string[];
  }, [transactions]);

  // Client-side filtering for min/max amount (not supported by backend query params)
  const filtered = useMemo(() => {
    const min = minAmount ? parseFloat(minAmount.replace(',', '.')) : null;
    const max = maxAmount ? parseFloat(maxAmount.replace(',', '.')) : null;

    return transactions.filter((tx) => {
      const amount = Math.max(tx.incoming || 0, tx.outgoing || 0, Math.abs(tx.bankDelta || 0));
      if (min != null && amount < min) return false;
      if (max != null && amount > max) return false;
      return true;
    });
  }, [transactions, minAmount, maxAmount]);

  const summary: Summary = useMemo(() => {
    return filtered.reduce(
      (acc, tx) => {
        acc.totalRecords += 1;
        acc.totalCashIn += tx.incoming || 0;
        acc.totalCashOut += tx.outgoing || 0;
        if (tx.bankDelta && tx.bankDelta > 0) acc.totalBankIn += tx.bankDelta;
        if (tx.bankDelta && tx.bankDelta < 0) acc.totalBankOut += Math.abs(tx.bankDelta);
        return acc;
      },
      { totalRecords: 0, totalCashIn: 0, totalCashOut: 0, totalBankIn: 0, totalBankOut: 0 }
    );
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h1 className="text-lg md:text-xl font-semibold text-slate-800">İşlem Logu</h1>
        {onBackToDashboard && (
          <div className="no-print flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-sm"
              onClick={onBackToDashboard}
            >
              <HomepageIcon className="w-4 h-4" />
              <span>Ana Sayfaya Dön</span>
            </button>
            <button
              className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
              onClick={() => printReport()}
            >
              📄 PDF / Döküm Al
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="card p-4 bg-rose-50 border border-rose-200">
          <p className="text-rose-800 text-sm">{error}</p>
        </div>
      )}

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Başlangıç</label>
            <input
              type="date"
              className="form-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Bitiş</label>
            <input
              type="date"
              className="form-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Kullanıcı</label>
            <select className="form-input" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
              <option value="HEPSI">Hepsi</option>
              {distinctUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">İşlem Türü</label>
            <select className="form-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="HEPSI">Hepsi</option>
              {distinctTypes.map((t) => (
                <option key={t} value={t}>
                  {getTransactionTypeLabel(t as Parameters<typeof getTransactionTypeLabel>[0])}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Kaynak</label>
            <select className="form-input" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as SourceGroup)}>
              <option value="HEPSI">Hepsi</option>
              <option value="NAKIT">Nakit</option>
              <option value="BANKA">Banka</option>
              <option value="KART">Kart</option>
              <option value="CEK">Çek</option>
              <option value="POS">POS</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Banka</label>
            <select className="form-input" value={bankFilter} onChange={(e) => setBankFilter(e.target.value)}>
              <option value="HEPSI">Hepsi</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bankaAdi}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Min Tutar</label>
            <input
              type="number"
              className="form-input"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Max Tutar</label>
            <input
              type="number"
              className="form-input"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
            <label className="block text-sm font-medium text-slate-700">Serbest Arama</label>
            <input
              className="form-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tür, kaynak, muhatap veya açıklama"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-3 text-sm">
          <div className="text-slate-500">Toplam Kayıt</div>
          <div className="text-lg font-semibold text-slate-800">
            {loading ? '...' : summary.totalRecords} {totalCount > 500 && <span className="text-xs text-slate-500">(Toplam: {totalCount})</span>}
          </div>
        </div>
        <div className="card p-3 text-sm">
          <div className="text-slate-500">Toplam Nakit Giriş</div>
          <div className="text-lg font-semibold text-emerald-700">{formatTl(summary.totalCashIn)}</div>
        </div>
        <div className="card p-3 text-sm">
          <div className="text-slate-500">Toplam Nakit Çıkış</div>
          <div className="text-lg font-semibold text-rose-700">{formatTl(summary.totalCashOut)}</div>
        </div>
        <div className="card p-3 text-sm">
          <div className="text-slate-500">Banka Net Giriş/Çıkış</div>
          <div className="text-lg font-semibold text-slate-800">
            {formatTl(summary.totalBankIn - summary.totalBankOut)}
          </div>
        </div>
      </div>

      {loading && (
        <div className="card p-4 text-center">
          <p className="text-slate-600">İşlemler yükleniyor...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="card p-4 overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">Tarih</th>
                <th className="px-3 py-2 text-left">Saat</th>
                <th className="px-3 py-2 text-left">İşlem Türü</th>
                <th className="px-3 py-2 text-left">Kaynak</th>
                <th className="px-3 py-2 text-left">Muhatap</th>
                <th className="px-3 py-2 text-left">Açıklama</th>
                <th className="px-3 py-2 text-right">Nakit Giriş</th>
                <th className="px-3 py-2 text-right">Nakit Çıkış</th>
                <th className="px-3 py-2 text-right">Banka Giriş</th>
                <th className="px-3 py-2 text-right">Banka Çıkış</th>
                <th className="px-3 py-2 text-left">Kullanıcı</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-3 py-3 text-center text-slate-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
              {filtered.map((tx) => {
                const { giris, cikis } = resolveDisplayAmounts(tx);
                const bankIn = tx.bankDelta && tx.bankDelta > 0 ? tx.bankDelta : 0;
                const bankOut = tx.bankDelta && tx.bankDelta < 0 ? Math.abs(tx.bankDelta) : 0;
                // Fix Bug 5: Show bank name for bank transactions
                let sourceLabel = getTransactionSourceLabel(tx.source);
                if (tx.bankId) {
                  const bank = banks.find((b) => b.id === tx.bankId);
                  if (bank) {
                    sourceLabel = `${sourceLabel} (${bank.bankaAdi})`;
                  }
                }
                // Fix Bug 5: Show credit card name if available
                const creditCardName = (tx as any).creditCardName;
                if (creditCardName) {
                  sourceLabel = `${sourceLabel} - ${creditCardName}`;
                }
                return (
                  <tr key={tx.id} className="border-t">
                    <td className="px-3 py-2">{isoToDisplay(tx.isoDate)}</td>
                    <td className="px-3 py-2">{formatTime(tx.createdAtIso)}</td>
                    <td className="px-3 py-2">{getTransactionTypeLabel(tx.type)}</td>
                    <td className="px-3 py-2">{sourceLabel}</td>
                    <td className="px-3 py-2">{tx.counterparty}</td>
                    <td className="px-3 py-2 truncate max-w-[160px]" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-700">{formatTl(giris || 0)}</td>
                    <td className="px-3 py-2 text-right text-rose-700">{formatTl(cikis || 0)}</td>
                    <td className="px-3 py-2 text-right text-emerald-700">{formatTl(bankIn)}</td>
                    <td className="px-3 py-2 text-right text-rose-700">{formatTl(bankOut)}</td>
                    {/* KULLANICI / AUTH / AUDIT - 7.1: UI'da email gösterilir, x-user-id ASLA gösterilmez */}
                    <td className="px-3 py-2">{tx.createdByEmail || tx.createdBy || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
