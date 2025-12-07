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
import { apiGet } from '../utils/api';

interface Props {
  transactions: DailyTransaction[];
  banks: BankMaster[];
  onBackToDashboard?: () => void;
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

export function NakitAkisReport({ transactions, banks, onBackToDashboard }: Props) {
  const monthRange = getMonthRange();
  const [fromDate, setFromDate] = useState(monthRange.first);
  const [toDate, setToDate] = useState(monthRange.last);
  const [scope, setScope] = useState<Scope>('HEPSI');
  const [userFilter, setUserFilter] = useState<string>('HEPSI');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    totalIn: number;
    totalOut: number;
    net: number;
    bankInTotal: number;
    bankOutTotal: number;
    bankNet: number;
    cashInTotal: number;
    cashOutTotal: number;
    cashNet: number;
    girisler: any[];
    cikislar: any[];
  } | null>(null);

  // Safeguard: ensure transactions is always an array
  const safeTransactions = transactions ?? [];

  // Fetch report data from backend when filters change
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (fromDate) params.append('from', fromDate);
        if (toDate) params.append('to', toDate);
        if (scope !== 'HEPSI') params.append('scope', scope);
        if (userFilter !== 'HEPSI') params.append('user', userFilter);
        if (searchText.trim()) params.append('search', searchText.trim());

        const response = await apiGet<{
          totalIn: number;
          totalOut: number;
          net: number;
          bankInTotal: number;
          bankOutTotal: number;
          bankNet: number;
          cashInTotal: number;
          cashOutTotal: number;
          cashNet: number;
          girisler: any[];
          cikislar: any[];
        }>(`/api/reports/nakit-akis?${params.toString()}`);

        setReportData(response);
      } catch (error) {
        console.error('Failed to fetch nakit akis report:', error);
        // Fallback to client-side calculation if backend fails
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [fromDate, toDate, scope, userFilter, searchText]);

  const distinctUsers = useMemo(() => {
    return Array.from(new Set(safeTransactions.map((t) => t.createdBy).filter(Boolean))) as string[];
  }, [safeTransactions]);

  const resolveIncomingAmount = (tx: DailyTransaction) => {
    const bankDelta = tx.bankDelta || 0;
    return Math.max(tx.displayIncoming || 0, tx.incoming || 0, bankDelta > 0 ? bankDelta : 0);
  };

  const resolveOutgoingAmount = (tx: DailyTransaction) => {
    const bankDelta = tx.bankDelta || 0;
    if (tx.type === 'POS_KOMISYONU') {
      return tx.displayOutgoing || 0;
    }
    return Math.max(tx.displayOutgoing || 0, tx.outgoing || 0, bankDelta < 0 ? Math.abs(bankDelta) : 0);
  };

  // Use backend data if available, otherwise fallback to client-side calculation
  const totals = reportData
    ? {
        totalIn: reportData.totalIn,
        totalOut: reportData.totalOut,
      }
    : useMemo(() => {
        const filtered = safeTransactions.filter((tx) => {
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
          const term = searchText.trim().toLowerCase();
          if (term) {
            const combined = `${getTransactionTypeLabel(tx.type)} ${getTransactionSourceLabel(tx.source)} ${tx.counterparty || ''} ${
              tx.description || ''
            }`.toLowerCase();
            if (!combined.includes(term)) return false;
          }
          return true;
        });
        return filtered.reduce(
          (acc, tx) => {
            const incoming = resolveIncomingAmount(tx);
            const outgoing = resolveOutgoingAmount(tx);
            acc.totalIn += incoming;
            acc.totalOut += outgoing;
            return acc;
          },
          { totalIn: 0, totalOut: 0 }
        );
      }, [fromDate, scope, searchText, toDate, safeTransactions, userFilter]);

  const net = totals.totalIn - totals.totalOut;
  const girisler = reportData?.girisler || [];
  const cikislar = reportData?.cikislar || [];

  const resolveBankName = (bankId?: string) => banks.find((b) => b.id === bankId)?.bankaAdi || 'Banka';

  const getScopeLabel = (s: Scope) => {
    switch (s) {
      case 'HEPSI':
        return 'Hepsi';
      case 'NAKIT':
        return 'Sadece Nakit';
      case 'BANKA':
        return 'Sadece Banka';
      default:
        return 'Hepsi';
    }
  };

  const getUserLabel = (u: string) => {
    return u === 'HEPSI' ? 'Hepsi' : u;
  };

  const generateNakitAkisPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up engelleyici nedeniyle yazdırma penceresi açılamadı. Lütfen pop-up engelleyiciyi devre dışı bırakın.');
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Nakit Akış Raporu</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1.5cm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                font-size: 11px;
                color: #000;
              }
              .no-print {
                display: none !important;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 8px 0;
                page-break-inside: auto;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 5px;
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
                font-weight: bold;
              }
              .summary-box {
                border: 1px solid #ddd;
                padding: 8px;
                margin: 5px;
                page-break-inside: avoid;
                display: inline-block;
                width: calc(33.333% - 10px);
                vertical-align: top;
              }
              .summary-group {
                margin: 10px 0;
                page-break-inside: avoid;
              }
              h1, h2, h3 {
                page-break-after: avoid;
              }
              tr {
                page-break-inside: avoid;
              }
              thead {
                display: table-header-group;
              }
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              font-size: 11px;
              color: #000;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header img {
              height: 50px;
            }
            .title-section {
              text-align: center;
              margin: 15px 0;
            }
            .title-section h1 {
              font-size: 20px;
              font-weight: bold;
              margin: 5px 0;
            }
            .title-section .meta {
              font-size: 10px;
              color: #666;
              margin: 3px 0;
            }
            .summary-box {
              border: 1px solid #ddd;
              padding: 8px;
              margin: 5px;
              display: inline-block;
              width: calc(33.333% - 10px);
              vertical-align: top;
              box-sizing: border-box;
            }
            .summary-box .label {
              font-size: 9px;
              color: #666;
              margin-bottom: 3px;
            }
            .summary-box .value {
              font-size: 14px;
              font-weight: bold;
            }
            .summary-group-title {
              font-size: 10px;
              font-weight: bold;
              color: #333;
              margin: 10px 0 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 5px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
            .text-emerald {
              color: #059669;
            }
            .text-rose {
              color: #e11d48;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://esca-food.com/image/cache/catalog/esca%20food%20logosu%20tek_-700x800.png" alt="Esca Food" />
            <img src="https://esca-food.com/image/cache/catalog/web%20kasa%20logosu%20tek_-700x800.png" alt="Web Kasa" />
          </div>
          <div class="title-section">
            <h1>Nakit Akış Raporu</h1>
            <div class="meta">Dönem: ${isoToDisplay(fromDate)} – ${isoToDisplay(toDate)}</div>
            <div class="meta">Kapsam: ${getScopeLabel(scope)}</div>
            <div class="meta">Kullanıcı: ${getUserLabel(userFilter)}</div>
          </div>
          
          <div class="summary-group">
            <div class="summary-group-title">Genel Toplamlar</div>
            <div class="summary-box">
              <div class="label">Toplam Giriş</div>
              <div class="value text-emerald">${formatTl(totals.totalIn)}</div>
            </div>
            <div class="summary-box">
              <div class="label">Toplam Çıkış</div>
              <div class="value text-rose">${formatTl(totals.totalOut)}</div>
            </div>
            <div class="summary-box">
              <div class="label">Net</div>
              <div class="value">${formatTl(net)}</div>
            </div>
          </div>

          <div class="summary-group">
            <div class="summary-group-title">Banka Hareketleri</div>
            <div class="summary-box">
              <div class="label">Banka Toplam Giriş</div>
              <div class="value text-emerald">${formatTl(reportData?.bankInTotal || 0)}</div>
            </div>
            <div class="summary-box">
              <div class="label">Banka Toplam Çıkış</div>
              <div class="value text-rose">${formatTl(reportData?.bankOutTotal || 0)}</div>
            </div>
            <div class="summary-box">
              <div class="label">Banka Net</div>
              <div class="value">${formatTl(reportData?.bankNet || 0)}</div>
            </div>
          </div>

          <div class="summary-group">
            <div class="summary-group-title">Nakit Hareketleri</div>
            <div class="summary-box">
              <div class="label">Nakit Toplam Giriş</div>
              <div class="value text-emerald">${formatTl(reportData?.cashInTotal || 0)}</div>
            </div>
            <div class="summary-box">
              <div class="label">Nakit Toplam Çıkış</div>
              <div class="value text-rose">${formatTl(reportData?.cashOutTotal || 0)}</div>
            </div>
            <div class="summary-box">
              <div class="label">Nakit Net</div>
              <div class="value">${formatTl(reportData?.cashNet || 0)}</div>
            </div>
          </div>

          <div style="margin-top: 20px;">
            <div style="font-weight: bold; margin-bottom: 10px;">Girişler</div>
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Tür</th>
                  <th>Kaynak</th>
                  <th>Muhatap</th>
                  <th>Açıklama</th>
                  <th class="text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                ${girisler.length === 0
                  ? '<tr><td colspan="6" style="text-align: center; color: #666;">Kayıt yok.</td></tr>'
                  : girisler
                      .map(
                        (giris: any) => `
                  <tr>
                    <td>${isoToDisplay(giris.isoDate)}</td>
                    <td>${getTransactionTypeLabel(giris.type)}</td>
                    <td>${giris.bankName || giris.creditCardName || getTransactionSourceLabel(giris.source)}</td>
                    <td>${giris.counterparty || ''}</td>
                    <td>${giris.description || ''}</td>
                    <td class="text-right text-emerald">${formatTl(giris.amount)}</td>
                  </tr>
                `
                      )
                      .join('')}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 20px;">
            <div style="font-weight: bold; margin-bottom: 10px;">Çıkışlar</div>
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Tür</th>
                  <th>Kaynak</th>
                  <th>Muhatap</th>
                  <th>Açıklama</th>
                  <th class="text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                ${cikislar.length === 0
                  ? '<tr><td colspan="6" style="text-align: center; color: #666;">Kayıt yok.</td></tr>'
                  : cikislar
                      .map(
                        (cikis: any) => `
                  <tr>
                    <td>${isoToDisplay(cikis.isoDate)}</td>
                    <td>${getTransactionTypeLabel(cikis.type)}</td>
                    <td>${cikis.bankName || cikis.creditCardName || getTransactionSourceLabel(cikis.source)}</td>
                    <td>${cikis.counterparty || ''}</td>
                    <td>${cikis.description || ''}</td>
                    <td class="text-right text-rose">${formatTl(cikis.amount)}</td>
                  </tr>
                `
                      )
                      .join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h1 className="text-lg md:text-xl font-semibold text-slate-800">Nakit Akış Raporu</h1>
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
              onClick={() => generateNakitAkisPDF()}
            >
              📄 PDF / Döküm Al
            </button>
          </div>
        )}
      </div>
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
            <select className="form-input" value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
              <option value="HEPSI">Hepsi</option>
              <option value="NAKIT">Sadece Nakit</option>
              <option value="BANKA">Sadece Banka</option>
            </select>
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

      {/* Main Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-3 text-sm">
          <div className="text-slate-500">Toplam Giriş</div>
          <div className="text-lg font-semibold text-emerald-700">
            {loading ? '...' : formatTl(totals.totalIn)}
          </div>
        </div>
        <div className="card p-3 text-sm">
          <div className="text-slate-500">Toplam Çıkış</div>
          <div className="text-lg font-semibold text-rose-700">
            {loading ? '...' : formatTl(totals.totalOut)}
          </div>
        </div>
        <div className="card p-3 text-sm">
          <div className="text-slate-500">Net</div>
          <div className="text-lg font-semibold text-slate-800">
            {loading ? '...' : formatTl(net)}
          </div>
        </div>
      </div>

      {/* Bank Movement Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-3 text-sm border-l-4 border-l-blue-500">
          <div className="text-slate-500 text-xs">Banka Hareketleri</div>
          <div className="text-xs text-slate-400 mb-1">Banka Toplam Giriş</div>
          <div className="text-base font-semibold text-emerald-700">
            {loading ? '...' : formatTl(reportData?.bankInTotal || 0)}
          </div>
        </div>
        <div className="card p-3 text-sm border-l-4 border-l-blue-500">
          <div className="text-slate-500 text-xs opacity-0">Banka Hareketleri</div>
          <div className="text-xs text-slate-400 mb-1">Banka Toplam Çıkış</div>
          <div className="text-base font-semibold text-rose-700">
            {loading ? '...' : formatTl(reportData?.bankOutTotal || 0)}
          </div>
        </div>
        <div className="card p-3 text-sm border-l-4 border-l-blue-500">
          <div className="text-slate-500 text-xs opacity-0">Banka Hareketleri</div>
          <div className="text-xs text-slate-400 mb-1">Banka Net</div>
          <div className="text-base font-semibold text-slate-800">
            {loading ? '...' : formatTl(reportData?.bankNet || 0)}
          </div>
        </div>
      </div>

      {/* Cash Movement Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-3 text-sm border-l-4 border-l-green-500">
          <div className="text-slate-500 text-xs">Nakit Hareketleri</div>
          <div className="text-xs text-slate-400 mb-1">Nakit Toplam Giriş</div>
          <div className="text-base font-semibold text-emerald-700">
            {loading ? '...' : formatTl(reportData?.cashInTotal || 0)}
          </div>
        </div>
        <div className="card p-3 text-sm border-l-4 border-l-green-500">
          <div className="text-slate-500 text-xs opacity-0">Nakit Hareketleri</div>
          <div className="text-xs text-slate-400 mb-1">Nakit Toplam Çıkış</div>
          <div className="text-base font-semibold text-rose-700">
            {loading ? '...' : formatTl(reportData?.cashOutTotal || 0)}
          </div>
        </div>
        <div className="card p-3 text-sm border-l-4 border-l-green-500">
          <div className="text-slate-500 text-xs opacity-0">Nakit Hareketleri</div>
          <div className="text-xs text-slate-400 mb-1">Nakit Net</div>
          <div className="text-base font-semibold text-slate-800">
            {loading ? '...' : formatTl(reportData?.cashNet || 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
              {girisler.map((giris: any, index: number) => {
                // Backend returns girisler/cikislar with different structure
                const kaynak = giris.bankName
                  ? giris.bankName
                  : giris.creditCardName
                  ? `${getTransactionSourceLabel(giris.source)} - ${giris.creditCardName}`
                  : getTransactionSourceLabel(giris.source);
                return (
                  <tr key={giris.isoDate + index} className="border-t">
                    <td className="px-3 py-2">{isoToDisplay(giris.isoDate)}</td>
                    <td className="px-3 py-2">{getTransactionTypeLabel(giris.type)}</td>
                    <td className="px-3 py-2">{kaynak}</td>
                    <td className="px-3 py-2">{giris.counterparty || ''}</td>
                    <td className="px-3 py-2 truncate max-w-[160px]" title={giris.description || ''}>
                      {giris.description || ''}
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-700">{formatTl(giris.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
              {cikislar.map((cikis: any, index: number) => {
                // Backend returns girisler/cikislar with different structure
                let kaynak = getTransactionSourceLabel(cikis.source);
                if (cikis.type === 'POS_KOMISYONU' && cikis.bankName) {
                  kaynak = `POS (${cikis.bankName})`;
                } else if (cikis.bankName) {
                  kaynak = cikis.bankName;
                }
                if (cikis.creditCardName) {
                  kaynak = `${kaynak} - ${cikis.creditCardName}`;
                }
                return (
                  <tr key={cikis.isoDate + index} className="border-t">
                    <td className="px-3 py-2">{isoToDisplay(cikis.isoDate)}</td>
                    <td className="px-3 py-2">{getTransactionTypeLabel(cikis.type)}</td>
                    <td className="px-3 py-2">{kaynak}</td>
                    <td className="px-3 py-2">{cikis.counterparty || ''}</td>
                    <td className="px-3 py-2 truncate max-w-[160px]" title={cikis.description || ''}>
                      {cikis.description || ''}
                    </td>
                    <td className="px-3 py-2 text-right text-rose-700">{formatTl(cikis.amount)}</td>
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
