import { useMemo, useState } from 'react';
import { DailyTransaction } from '../models/transaction';
import { BankMaster } from '../models/bank';
import { isoToDisplay, todayIso } from '../utils/date';
import { formatTl } from '../utils/money';

interface Props {
  transactions: DailyTransaction[];
  banks: BankMaster[];
}

type Scope = 'HEPSI' | 'NAKIT' | 'BANKA';

function getMonthRange() {
  const today = new Date(`${todayIso()}T00:00:00Z`);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const first = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  const last = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
  return { first, last };
}

export function NakitAkisReport({ transactions, banks }: Props) {
  const monthRange = getMonthRange();
  const [fromDate, setFromDate] = useState(monthRange.first);
  const [toDate, setToDate] = useState(monthRange.last);
  const [scope, setScope] = useState<Scope>('HEPSI');
  const [userFilter, setUserFilter] = useState<string>('HEPSI');
  const [searchText, setSearchText] = useState('');

  const distinctUsers = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.createdBy).filter(Boolean))) as string[];
  }, [transactions]);

  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (!fromDate || !toDate) return false;
      if (tx.isoDate < fromDate || tx.isoDate > toDate) return false;

      if (userFilter !== 'HEPSI') {
        if (!tx.createdBy || tx.createdBy !== userFilter) return false;
      }

      if (scope === 'NAKIT') {
        const cashMovement = (tx.incoming || 0) !== 0 || (tx.outgoing || 0) !== 0;
        const bankMovement = !!tx.bankDelta && tx.bankDelta !== 0;
        if (!cashMovement || bankMovement) return false;
      } else if (scope === 'BANKA') {
        if (!tx.bankDelta || tx.bankDelta === 0) return false;
      }

      if (term) {
        const combined = `${tx.type || ''} ${tx.source || ''} ${tx.counterparty || ''} ${tx.description || ''}`.toLowerCase();
        if (!combined.includes(term)) return false;
      }
      return true;
    });
  }, [fromDate, scope, searchText, toDate, transactions, userFilter]);

  // Toplamlar: POS komisyonu gider olarak sayılıyor ama kasa/banka bakiyelerini bozmuyor.
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, tx) => {
        const bankDelta = tx.bankDelta || 0;

        const cashIn =
          (tx.displayIncoming && tx.displayIncoming > 0 && tx.displayIncoming) ||
          (tx.incoming && tx.incoming > 0 && tx.incoming) ||
          (bankDelta > 0 ? bankDelta : 0);

        const komisyon = tx.type === 'POS Komisyonu' ? tx.displayOutgoing || tx.outgoing || 0 : 0;

        const cashOut =
          komisyon ||
          (tx.displayOutgoing && tx.displayOutgoing > 0 && tx.displayOutgoing) ||
          (tx.outgoing && tx.outgoing > 0 && tx.outgoing) ||
          (bankDelta < 0 ? Math.abs(bankDelta) : 0);

        acc.totalIn += cashIn;
        acc.totalOut += cashOut;
        return acc;
      },
      { totalIn: 0, totalOut: 0 }
    );
  }, [filtered]);

  const net = totals.totalIn - totals.totalOut;

  // Girişler: nakit/banka girişleri – POS komisyonu burada görünmez.
  const girisler = useMemo(() => {
    return filtered.filter(
      (tx) =>
        (tx.displayIncoming || 0) > 0 ||
        (tx.incoming || 0) > 0 ||
        (tx.bankDelta || 0) > 0
    );
  }, [filtered]);

  // Çıkışlar: normal çıkışlar + POS Komisyonu satırları
  const cikislar = useMemo(() => {
    return filtered.filter(
      (tx) =>
        tx.type === 'POS Komisyonu' ||
        (tx.displayOutgoing && tx.displayOutgoing > 0) ||
        (tx.outgoing && tx.outgoing > 0) ||
        (tx.bankDelta && tx.bankDelta < 0)
    );
  }, [filtered]);

  const resolveBankName = (bankId?: string) =>
    banks.find((b) => b.id === bankId)?.bankaAdi || 'Banka';

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
            <label className="block text-sm font-medium text-slate-700">Kapsam</label>
            <select
              className="form-input"
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
            >
              <option value="HEPSI">Hepsi</option>
              <option value="NAKIT">Sadece Nakit</option>
              <option value="BANKA">Sadece Banka</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Kullanıcı</label>
            <select
              className="form-input"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="HEPSI">Hepsi</option>
              {distinctUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-3 text-sm">
          <div className="text-slate-500">Toplam Giriş</div>
          <div className="text-lg font-semibold text-emerald-700">
            {formatTl(totals.totalIn)}
          </div>
        </div>
        <div className="card p-3 text-sm">
          <div className="text-slate-500">Toplam Çıkış</div>
          <div className="text-lg font-semibold text-rose-700">
            {formatTl(totals.totalOut)}
          </div>
        </div>
        <div className="card p-3 text-sm">
          <div className="text-slate-500">Net</div>
          <div className="text-lg font-semibold text-slate-800">
            {formatTl(net)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Girişler */}
        <div className="card p-4 overflow-x-auto">
          <div className="text-base font-semibold text-slate-800 mb-2">Girişler</div>
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Tarih</th>
                <th className="px-3 py-2 text-left">Tür</th>
                <th className="px-3 py-2 text-left">Kaynak</th>
                <th className="px-3 py-2 text-left">Muhatap</th>
                <th className="px-3 py-2 text-left">Açıklama</th>
                <th className="px-3 py-2 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {girisler.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-3 text-center text-slate-500">
                    Kayıt yok.
                  </td>
                </tr>
              )}
              {girisler.map((tx) => {
                const bankDelta = tx.bankDelta || 0;
                const amount =
                  (tx.displayIncoming && tx.displayIncoming > 0 && tx.displayIncoming) ||
                  (tx.incoming && tx.incoming > 0 && tx.incoming) ||
                  (bankDelta > 0 ? bankDelta : 0);
                const kaynak = bankDelta > 0 ? resolveBankName(tx.bankId) : 'Kasa';
                return (
                  <tr key={tx.id} className="border-t">
                    <td className="px-3 py-2">{isoToDisplay(tx.isoDate)}</td>
                    <td className="px-3 py-2">{tx.type}</td>
                    <td className="px-3 py-2">{kaynak}</td>
                    <td className="px-3 py-2">{tx.counterparty}</td>
                    <td
                      className="px-3 py-2 truncate max-w-[160px]"
                      title={tx.description}
                    >
                      {tx.description}
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-700">
                      {formatTl(amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Çıkışlar */}
        <div className="card p-4 overflow-x-auto">
          <div className="text-base font-semibold text-slate-800 mb-2">Çıkışlar</div>
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Tarih</th>
                <th className="px-3 py-2 text-left">Tür</th>
                <th className="px-3 py-2 text-left">Kaynak</th>
                <th className="px-3 py-2 text-left">Muhatap</th>
                <th className="px-3 py-2 text-left">Açıklama</th>
                <th className="px-3 py-2 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {cikislar.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-3 text-center text-slate-500">
                    Kayıt yok.
                  </td>
                </tr>
              )}
              {cikislar.map((tx) => {
                const bankDelta = tx.bankDelta || 0;
                const komisyon =
                  tx.type === 'POS Komisyonu'
                    ? tx.displayOutgoing || tx.outgoing || 0
                    : 0;
                const amount =
                  komisyon ||
                  (tx.displayOutgoing && tx.displayOutgoing > 0 && tx.displayOutgoing) ||
                  (tx.outgoing && tx.outgoing > 0 && tx.outgoing) ||
                  (bankDelta < 0 ? Math.abs(bankDelta) : 0);

                const kaynak =
                  tx.type === 'POS Komisyonu'
                    ? 'POS'
                    : bankDelta < 0
                    ? resolveBankName(tx.bankId)
                    : 'Kasa';

                return (
                  <tr key={tx.id} className="border-t">
                    <td className="px-3 py-2">{isoToDisplay(tx.isoDate)}</td>
                    <td className="px-3 py-2">{tx.type}</td>
                    <td className="px-3 py-2">{kaynak}</td>
                    <td className="px-3 py-2">{tx.counterparty}</td>
                    <td
                      className="px-3 py-2 truncate max-w-[160px]"
                      title={tx.description}
                    >
                      {tx.description}
                    </td>
                    <td className="px-3 py-2 text-right text-rose-700">
                      {formatTl(amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
