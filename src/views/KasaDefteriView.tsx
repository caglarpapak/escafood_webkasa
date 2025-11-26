import { useMemo, useState } from 'react';
import { DailyTransaction } from '../models/transaction';
import { isoToDisplay } from '../utils/date';
import { formatTl } from '../utils/money';

interface KasaDefteriViewProps {
  transactions: DailyTransaction[];
  onBackToDashboard: () => void;
}

type SortKey = 'isoDate' | 'documentNo' | 'type' | 'counterparty' | 'incoming' | 'outgoing' | 'balanceAfter';
type SortDir = 'asc' | 'desc';

const sorters: Record<SortKey, (a: DailyTransaction, b: DailyTransaction) => number> = {
  isoDate: (a, b) => a.isoDate.localeCompare(b.isoDate),
  documentNo: (a, b) => a.documentNo.localeCompare(b.documentNo),
  type: (a, b) => a.type.localeCompare(b.type),
  counterparty: (a, b) => a.counterparty.localeCompare(b.counterparty),
  incoming: (a, b) => (a.displayIncoming ?? a.incoming) - (b.displayIncoming ?? b.incoming),
  outgoing: (a, b) => (a.displayOutgoing ?? a.outgoing) - (b.displayOutgoing ?? b.outgoing),
  balanceAfter: (a, b) => a.balanceAfter - b.balanceAfter,
};

export default function KasaDefteriView({ transactions, onBackToDashboard }: KasaDefteriViewProps) {
  const [filterStartIso, setFilterStartIso] = useState('');
  const [filterEndIso, setFilterEndIso] = useState('');
  const [filterDocumentNo, setFilterDocumentNo] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCounterparty, setFilterCounterparty] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('isoDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterStartIso && tx.isoDate < filterStartIso) return false;
      if (filterEndIso && tx.isoDate > filterEndIso) return false;
      if (filterDocumentNo && !tx.documentNo.toLowerCase().includes(filterDocumentNo.toLowerCase())) return false;
      if (filterType && !tx.type.toLowerCase().includes(filterType.toLowerCase())) return false;
      if (filterCounterparty && !tx.counterparty.toLowerCase().includes(filterCounterparty.toLowerCase())) return false;
      if (filterDescription && !tx.description.toLowerCase().includes(filterDescription.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filterStartIso, filterEndIso, filterDocumentNo, filterType, filterCounterparty, filterDescription]);

  const sortedTransactions = useMemo(() => {
    const arr = [...filteredTransactions];
    const sorter = sorters[sortKey];
    arr.sort((a, b) => {
      const cmp = sorter(a, b);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredTransactions, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const renderMoney = (value?: number) => {
    if (value === undefined || value === 0) return '-';
    return formatTl(value);
  };

  const renderCreated = (tx: DailyTransaction) => {
    if (tx.createdAtIso && tx.createdBy) {
      const datePart = isoToDisplay(tx.createdAtIso.slice(0, 10));
      const timePart = tx.createdAtIso.slice(11, 19);
      return `${datePart} ${timePart} – ${tx.createdBy}`;
    }
    return '-';
  };

  return (
    <div className="print-area space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Kasa Defteri</h1>
          <p className="text-sm text-slate-600">Tüm tarih aralığındaki kasa ve banka işlemleri</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100"
            onClick={onBackToDashboard}
          >
            Dashboard’a Dön
          </button>
          <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => window.print()}>
            PDF'e Aktar / Yazdır
          </button>
        </div>
      </div>

      <div className="card p-4 space-y-3 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label>Başlangıç Tarihi</label>
            <input type="date" value={filterStartIso} onChange={(e) => setFilterStartIso(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label>Bitiş Tarihi</label>
            <input type="date" value={filterEndIso} onChange={(e) => setFilterEndIso(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label>Belge No</label>
            <input value={filterDocumentNo} onChange={(e) => setFilterDocumentNo(e.target.value)} placeholder="Belge no" />
          </div>
          <div className="space-y-1">
            <label>Tür</label>
            <input value={filterType} onChange={(e) => setFilterType(e.target.value)} placeholder="Tür" />
          </div>
          <div className="space-y-1">
            <label>Muhatap</label>
            <input value={filterCounterparty} onChange={(e) => setFilterCounterparty(e.target.value)} placeholder="Muhatap" />
          </div>
          <div className="space-y-1">
            <label>Açıklama</label>
            <input value={filterDescription} onChange={(e) => setFilterDescription(e.target.value)} placeholder="Açıklama" />
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 sticky top-0">
            <tr>
              <th className="py-2 px-2 text-left cursor-pointer" onClick={() => toggleSort('isoDate')}>
                Tarih
              </th>
              <th className="py-2 px-2 text-left cursor-pointer" onClick={() => toggleSort('documentNo')}>
                Belge No
              </th>
              <th className="py-2 px-2 text-left cursor-pointer" onClick={() => toggleSort('type')}>
                Tür
              </th>
              <th className="py-2 px-2 text-left">Kaynak</th>
              <th className="py-2 px-2 text-left cursor-pointer" onClick={() => toggleSort('counterparty')}>
                Muhatap
              </th>
              <th className="py-2 px-2 text-left">Açıklama</th>
              <th className="py-2 px-2 text-right cursor-pointer" onClick={() => toggleSort('incoming')}>
                Giriş
              </th>
              <th className="py-2 px-2 text-right cursor-pointer" onClick={() => toggleSort('outgoing')}>
                Çıkış
              </th>
              <th className="py-2 px-2 text-right cursor-pointer" onClick={() => toggleSort('balanceAfter')}>
                Bakiye
              </th>
              <th className="py-2 px-2 text-left">Kaydedildi</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.length === 0 && (
              <tr>
                <td colSpan={10} className="py-4 text-center text-slate-500">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
            {sortedTransactions.map((tx) => {
              const incomingVal = tx.displayIncoming ?? tx.incoming;
              const outgoingVal = tx.displayOutgoing ?? tx.outgoing;
              return (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="py-2 px-2">{tx.displayDate}</td>
                  <td className="py-2 px-2">{tx.documentNo}</td>
                  <td className="py-2 px-2">{tx.type}</td>
                  <td className="py-2 px-2">{tx.source}</td>
                  <td className="py-2 px-2">{tx.counterparty}</td>
                  <td className="py-2 px-2">{tx.description}</td>
                  <td className="py-2 px-2 text-right text-emerald-600">{renderMoney(incomingVal)}</td>
                  <td className="py-2 px-2 text-right text-rose-600">{renderMoney(outgoingVal)}</td>
                  <td className="py-2 px-2 text-right font-semibold">{renderMoney(tx.balanceAfter)}</td>
                  <td className="py-2 px-2 text-left">{renderCreated(tx)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
