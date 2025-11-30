import { useMemo, useState } from 'react';
import { DailyTransaction } from '../models/transaction';
import { BankMaster } from '../models/bank';
import { isoToDisplay, todayIso } from '../utils/date';
import { formatTl } from '../utils/money';

interface Props {
  transactions: DailyTransaction[];
  banks: BankMaster[];
  currentUserEmail: string;
}

type SourceGroup = 'HEPSI' | 'NAKIT' | 'BANKA' | 'KART' | 'CEK' | 'POS';

type Summary = {
  totalRecords: number;
  totalCashIn: number;
  totalCashOut: number;
  totalBankIn: number;
  totalBankOut: number;
};

function mapSourceGroup(tx: DailyTransaction): SourceGroup {
  if (tx.source?.startsWith('NAKIT')) return 'NAKIT';
  if (tx.source?.startsWith('BNK') || tx.bankId) return 'BANKA';
  if (tx.source?.includes('KK')) return 'KART';
  if (tx.source?.includes('CEK')) return 'CEK';
  if (tx.source === 'POS') return 'POS';
  return 'HEPSI';
}

function formatTime(iso?: string) {
  if (!iso) return '-';
  return iso.slice(11, 16) || '-';
}

export function IslemLoguReport({ transactions, banks, currentUserEmail }: Props) {
  const today = todayIso();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [userFilter, setUserFilter] = useState<string>('HEPSI');
  const [typeFilter, setTypeFilter] = useState<string>('HEPSI');
  const [sourceFilter, setSourceFilter] = useState<SourceGroup>('HEPSI');
  const [bankFilter, setBankFilter] = useState<string>('HEPSI');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [searchText, setSearchText] = useState('');

  const distinctUsers = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.createdBy).filter(Boolean))) as string[];
  }, [transactions]);

  const distinctTypes = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.type).filter(Boolean))) as string[];
  }, [transactions]);

  const filtered = useMemo(() => {
    const min = minAmount ? parseFloat(minAmount.replace(',', '.')) : null;
    const max = maxAmount ? parseFloat(maxAmount.replace(',', '.')) : null;
    const term = searchText.trim().toLowerCase();

    return transactions.filter((tx) => {
      if (fromDate && tx.isoDate < fromDate) return false;
      if (toDate && tx.isoDate > toDate) return false;

      if (userFilter !== 'HEPSI') {
        if (!tx.createdBy || tx.createdBy !== userFilter) return false;
      }

      if (typeFilter !== 'HEPSI') {
        if (tx.type !== typeFilter) return false;
      }

      const group = mapSourceGroup(tx);
      if (sourceFilter !== 'HEPSI' && group !== sourceFilter) return false;

      if (bankFilter !== 'HEPSI') {
        if (!tx.bankId || tx.bankId !== bankFilter) return false;
      }

      const amount = Math.max(tx.incoming || 0, tx.outgoing || 0, Math.abs(tx.bankDelta || 0));
      if (min != null && amount < min) return false;
      if (max != null && amount > max) return false;

      if (term) {
        const combined = `${tx.type || ''} ${tx.source || ''} ${tx.counterparty || ''} ${tx.description || ''}`
          .toLowerCase();
        if (!combined.includes(term)) return false;
      }
      return true;
    });
  }, [bankFilter, fromDate, maxAmount, minAmount, searchText, sourceFilter, toDate, transactions, typeFilter, userFilter]);

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
                  {t}
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
          <div className="text-lg font-semibold text-slate-800">{summary.totalRecords}</div>
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
              const bankIn = tx.bankDelta && tx.bankDelta > 0 ? tx.bankDelta : 0;
              const bankOut = tx.bankDelta && tx.bankDelta < 0 ? Math.abs(tx.bankDelta) : 0;
              return (
                <tr key={tx.id} className="border-t">
                  <td className="px-3 py-2">{isoToDisplay(tx.isoDate)}</td>
                  <td className="px-3 py-2">{formatTime(tx.createdAtIso)}</td>
                  <td className="px-3 py-2">{tx.type}</td>
                  <td className="px-3 py-2">{tx.source}</td>
                  <td className="px-3 py-2">{tx.counterparty}</td>
                  <td className="px-3 py-2 truncate max-w-[160px]" title={tx.description}>
                    {tx.description}
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-700">{formatTl(tx.incoming || 0)}</td>
                  <td className="px-3 py-2 text-right text-rose-700">{formatTl(tx.outgoing || 0)}</td>
                  <td className="px-3 py-2 text-right text-emerald-700">{formatTl(bankIn)}</td>
                  <td className="px-3 py-2 text-right text-rose-700">{formatTl(bankOut)}</td>
                  <td className="px-3 py-2">{tx.createdBy || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
