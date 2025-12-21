import { useMemo, useState } from 'react';
import { Cheque, ChequeStatus, normalizeLegacyChequeStatus } from '../models/cheque';
import { Customer } from '../models/customer';
import { Supplier } from '../models/supplier';
import { BankMaster } from '../models/bank';
import { diffInDays, isoToDisplay, todayIso } from '../utils/date';
import { formatTl } from '../utils/money';
import { HomepageIcon } from '../components/HomepageIcon';
import { printReport } from '../utils/pdfExport';

export interface CekSenetReportProps {
  cheques: Cheque[];
  customers: Customer[];
  suppliers: Supplier[];
  banks: BankMaster[];
  onBackToDashboard?: () => void;
}

type TurFilter = 'HEPSI' | 'BIZIM' | 'MUSTERI';
type QuickFilter = 'NONE' | 'TODAY' | 'NEXT7' | 'OVERDUE';

const statusLabels: Record<ChequeStatus, string> = {
  KASADA: 'Kasada',
  BANKADA_TAHSILDE: 'Bankada (Tahsilde)',
  ODEMEDE: 'Ödemede',
  TAHSIL_EDILDI: 'Tahsil Edildi',
  KARSILIKSIZ: 'Karşılıksız',
};

const allStatuses: ChequeStatus[] = ['KASADA', 'BANKADA_TAHSILDE', 'ODEMEDE', 'TAHSIL_EDILDI', 'KARSILIKSIZ'];

function isOurCheque(cek: Cheque): boolean {
  // Use direction if available (preferred method)
  if (cek.direction === 'BORC') return true;
  if (cek.direction === 'ALACAK') return false;
  
  // Fallback to legacy logic if direction not available
  if (typeof (cek as any).bizimCekimizMi === 'boolean') {
    return (cek as any).bizimCekimizMi;
  }
  if (cek.tedarikciId && !cek.musteriId) return true;
  if (cek.musteriId && !cek.tedarikciId) return false;
  return false;
}

export function CekSenetReport({ cheques, customers, suppliers, banks, onBackToDashboard }: CekSenetReportProps) {
  const today = todayIso();
  const [fromVadeIso, setFromVadeIso] = useState('');
  const [toVadeIso, setToVadeIso] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChequeStatus[]>(allStatuses);
  const [turFilter, setTurFilter] = useState<TurFilter>('HEPSI');
  const [musteriId, setMusteriId] = useState('');
  const [tedarikciId, setTedarikciId] = useState('');
  const [bankaId, setBankaId] = useState('');
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('NONE');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const normalizedCheques = useMemo(() => {
    return cheques.map((c) => ({ ...c, status: normalizeLegacyChequeStatus(c.status) }));
  }, [cheques]);

  const filteredCheques = useMemo(() => {
    return normalizedCheques
      .filter((c) => {
        if (quickFilter === 'TODAY' && c.vadeTarihi !== today) return false;
        if (quickFilter === 'NEXT7') {
          const d = diffInDays(today, c.vadeTarihi);
          if (d < 0 || d > 7) return false;
        }
        if (quickFilter === 'OVERDUE') {
          const d = diffInDays(today, c.vadeTarihi);
          if (!(d < 0) || c.status === 'TAHSIL_EDILDI') return false;
        }
        return true;
      })
      .filter((c) => (fromVadeIso ? c.vadeTarihi >= fromVadeIso : true))
      .filter((c) => (toVadeIso ? c.vadeTarihi <= toVadeIso : true))
      .filter((c) => statusFilter.includes(c.status))
      .filter((c) => {
        if (turFilter === 'HEPSI') return true;
        const ours = isOurCheque(c);
        return turFilter === 'BIZIM' ? ours : !ours;
      })
      .filter((c) => (musteriId ? c.musteriId === musteriId : true))
      .filter((c) => (tedarikciId ? c.tedarikciId === tedarikciId : true))
      .filter((c) => (bankaId ? c.bankaId === bankaId : true))
      .filter((c) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        const combined = `${c.cekNo} ${c.issuerBankName || ''} ${c.bankaAdi || ''} ${c.duzenleyen || ''} ${c.lehtar || ''} ${c.aciklama || ''}`.toLowerCase();
        return combined.includes(term);
      })
      .sort((a, b) => a.vadeTarihi.localeCompare(b.vadeTarihi));
  }, [
    bankaId,
    normalizedCheques,
    fromVadeIso,
    musteriId,
    quickFilter,
    search,
    statusFilter,
    tedarikciId,
    today,
    toVadeIso,
    turFilter,
  ]);

  const summary = useMemo(() => {
    const kasa = filteredCheques.filter((c) => c.status === 'KASADA' && c.kasaMi);
    const odemedeBizim = filteredCheques.filter(
      (c) => isOurCheque(c) && (c.status === 'ODEMEDE' || c.status === 'BANKADA_TAHSILDE')
    );
    const tahsilde = filteredCheques.filter((c) => c.status === 'BANKADA_TAHSILDE');
    const sorunlu = filteredCheques.filter((c) => c.status === 'KARSILIKSIZ');

    const sum = (list: Cheque[]) => list.reduce((acc, c) => acc + (c.tutar || 0), 0);
    const countAndSum = (list: Cheque[]) => ({ count: list.length, total: sum(list) });

    return {
      kasa: countAndSum(kasa),
      kasaBizim: countAndSum(kasa.filter((c) => isOurCheque(c))),
      kasaMusteri: countAndSum(kasa.filter((c) => !isOurCheque(c))),
      odemedeBizim: countAndSum(odemedeBizim),
      tahsilde: countAndSum(tahsilde),
      sorunlu: countAndSum(sorunlu),
    };
  }, [filteredCheques]);

  const toggleStatus = (status: ChequeStatus) => {
    setStatusFilter((prev) => {
      if (prev.includes(status)) return prev.filter((s) => s !== status);
      return [...prev, status];
    });
  };

  const statusCheckbox = (status: ChequeStatus) => (
    <label key={status} className="flex items-center space-x-2 text-sm text-slate-700">
      <input
        type="checkbox"
        className="rounded border-slate-300"
        checked={statusFilter.includes(status)}
        onChange={() => toggleStatus(status)}
      />
      <span>{statusLabels[status]}</span>
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h1 className="text-lg md:text-xl font-semibold text-slate-800">Çek/Senet Modülü</h1>
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
      <div className="card p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Vade Başlangıç</label>
            <input type="date" className="form-input" value={fromVadeIso} onChange={(e) => setFromVadeIso(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Vade Bitiş</label>
            <input type="date" className="form-input" value={toVadeIso} onChange={(e) => setToVadeIso(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Müşteri</label>
            <select className="form-input" value={musteriId} onChange={(e) => setMusteriId(e.target.value)}>
              <option value="">Hepsi</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.kod} - {c.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Tedarikçi</label>
            <select className="form-input" value={tedarikciId} onChange={(e) => setTedarikciId(e.target.value)}>
              <option value="">Hepsi</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.kod} - {s.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Banka</label>
            <select className="form-input" value={bankaId} onChange={(e) => setBankaId(e.target.value)}>
              <option value="">Hepsi</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bankaAdi}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Tür</label>
            <select className="form-input" value={turFilter} onChange={(e) => setTurFilter(e.target.value as TurFilter)}>
              <option value="HEPSI">Hepsi</option>
              <option value="BIZIM">Sadece Bizim Çekler</option>
              <option value="MUSTERI">Sadece Müşteri Çekleri</option>
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Durumlar</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">{allStatuses.map(statusCheckbox)}</div>
          </div>
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Serbest Arama</label>
            <input
              className="form-input"
              placeholder="Çek no, açıklama, lehtar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded border ${quickFilter === 'TODAY' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
            onClick={() => {
              setQuickFilter('TODAY');
              setFromVadeIso(today);
              setToVadeIso(today);
            }}
          >
            Bugün Vadesi Gelen
          </button>
          <button
            className={`px-3 py-1 rounded border ${quickFilter === 'NEXT7' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
            onClick={() => {
              setQuickFilter('NEXT7');
              setFromVadeIso(today);
              const d = new Date(`${today}T00:00:00Z`);
              d.setUTCDate(d.getUTCDate() + 7);
              setToVadeIso(d.toISOString().slice(0, 10));
            }}
          >
            Önümüzdeki 7 Gün
          </button>
          <button
            className={`px-3 py-1 rounded border ${quickFilter === 'OVERDUE' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
            onClick={() => {
              setQuickFilter('OVERDUE');
              setFromVadeIso('');
              setToVadeIso(today);
            }}
          >
            Gecikmiş
          </button>
          <button
            className={`px-3 py-1 rounded border ${quickFilter === 'NONE' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
            onClick={() => {
              setQuickFilter('NONE');
              setFromVadeIso('');
              setToVadeIso('');
            }}
          >
            Tümünü Göster
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 space-y-1">
          <div className="text-sm font-semibold text-slate-700">Kasadaki Çekler</div>
          <div className="text-sm text-slate-600">Adet: {summary.kasa.count}</div>
          <div className="text-sm text-slate-600">Toplam Tutar: {formatTl(summary.kasa.total)}</div>
          <div className="text-xs text-slate-500">
            Bizim: {summary.kasaBizim.count} / {formatTl(summary.kasaBizim.total)} — Müşteri: {summary.kasaMusteri.count} / {formatTl(summary.kasaMusteri.total)}
          </div>
        </div>
        <div className="card p-4 space-y-1">
          <div className="text-sm font-semibold text-slate-700">Ödemede Olan Bizim Çekler</div>
          <div className="text-sm text-slate-600">Adet: {summary.odemedeBizim.count}</div>
          <div className="text-sm text-slate-600">Toplam Tutar: {formatTl(summary.odemedeBizim.total)}</div>
        </div>
        <div className="card p-4 space-y-1">
          <div className="text-sm font-semibold text-slate-700">Tahsilde Olan Çekler</div>
          <div className="text-sm text-slate-600">Adet: {summary.tahsilde.count}</div>
          <div className="text-sm text-slate-600">Toplam Tutar: {formatTl(summary.tahsilde.total)}</div>
        </div>
        <div className="card p-4 space-y-1">
          <div className="text-sm font-semibold text-slate-700">Sorunlu Çekler</div>
          <div className="text-sm text-slate-600">Adet: {summary.sorunlu.count}</div>
          <div className="text-sm text-slate-600">Toplam Tutar: {formatTl(summary.sorunlu.total)}</div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-base font-semibold text-slate-800">Çek/Senet Kayıtları</div>
            <div className="text-sm text-slate-500">Filtrelenmiş kayıtlar listelenir.</div>
          </div>
          <div className="text-sm text-slate-600">Toplam: {filteredCheques.length}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-left">Çek No</th>
                <th className="px-2 py-2 text-left">Tür</th>
                <th className="px-2 py-2 text-left">Vade Tarihi</th>
                <th className="px-2 py-2 text-left">Gün Farkı</th>
                <th className="px-2 py-2 text-left">Çek Bankası</th>
                <th className="px-2 py-2 text-left">Tahsile Verilen Banka</th>
                <th className="px-2 py-2 text-left">Düzenleyen</th>
                <th className="px-2 py-2 text-left">Lehtar</th>
                <th className="px-2 py-2 text-left">Müşteri / Tedarikçi</th>
                <th className="px-2 py-2 text-right">Tutar</th>
                <th className="px-2 py-2 text-left">Durum</th>
                <th className="px-2 py-2 text-left">Konum</th>
                <th className="px-2 py-2 text-left">Görsel</th>
                <th className="px-2 py-2 text-left">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {filteredCheques.length === 0 && (
                <tr>
                  <td colSpan={14} className="text-center text-slate-500 py-4">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
              {filteredCheques.map((c) => {
                const daysLeft = diffInDays(today, c.vadeTarihi);
                // ÇEK / SENET KANONİK SÖZLEŞMESİ - 9.1 & 9.3: Banka gösterimi
                // "Banka" kolonu = issuerBankName (çeki düzenleyen banka adı)
                // "Tahsile Verilen Banka" = depositBankName (çeki tahsile verdiğimiz banka)
                const issuerBankName = c.issuerBankName || '-'; // Çeki düzenleyen banka (çekin üstündeki banka)
                const depositBankName = c.bankaAdi || banks.find((b) => b.id === c.bankaId)?.bankaAdi || '-'; // Çeki tahsile verdiğimiz banka (bizim bankamız)
                
                // ÇEK / SENET KANONİK SÖZLEŞMESİ - 9.1 & 9.2: Müşteri/Tedarikçi sütunu
                // Kasaya giren çek: BOŞ (musteriId = null, tedarikciId = null)
                // Kasadan tedarikçiye verilen çek: Tedarikçi adı görünür
                const musteri = c.musteriId ? customers.find((m) => m.id === c.musteriId) : undefined;
                const tedarikci = c.tedarikciId ? suppliers.find((s) => s.id === c.tedarikciId) : undefined;
                const muhatap = (() => {
                  // ÇEK / SENET KANONİK SÖZLEŞMESİ - 9.1: Kasaya giren çek - Müşteri/Tedarikçi sütunu: BOŞ
                  if (c.direction === 'ALACAK' && c.status === 'KASADA' && !c.musteriId && !c.tedarikciId) {
                    return '-';
                  }
                  // ÇEK / SENET KANONİK SÖZLEŞMESİ - 9.2: Kasadan tedarikçiye verilen çek - Tedarikçi adı görünür
                  if (tedarikci) {
                    return `${tedarikci.kod} - ${tedarikci.ad}`;
                  }
                  if (musteri) {
                    return `${musteri.kod} - ${musteri.ad}`;
                  }
                  return '-';
                })();
                
                const konum = c.kasaMi
                  ? 'Kasada'
                  : c.status === 'BANKADA_TAHSILDE'
                  ? 'Bankada'
                  : c.status === 'ODEMEDE'
                  ? 'Dolaşımda'
                  : 'Kapalı';

                return (
                  <tr key={c.id} className="border-t">
                    <td className="px-2 py-2 whitespace-nowrap">{c.cekNo}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          isOurCheque(c)
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isOurCheque(c) ? 'Bizim Çek' : 'Müşteri Çeki'}
                      </span>
                    </td>
                    <td className="px-2 py-2">{isoToDisplay(c.vadeTarihi)}</td>
                    <td
                      className={`px-2 py-2 ${
                        daysLeft < 0 ? 'text-rose-600' : daysLeft === 0 ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {daysLeft}
                    </td>
                    <td className="px-2 py-2 truncate" title={issuerBankName}>
                      {issuerBankName}
                    </td>
                    <td className="px-2 py-2 truncate" title={depositBankName}>
                      {depositBankName}
                    </td>
                    <td className="px-2 py-2">{c.duzenleyen || '-'}</td>
                    <td className="px-2 py-2">{c.lehtar || '-'}</td>
                    <td className="px-2 py-2 truncate" title={muhatap}>
                      {muhatap}
                    </td>
                    <td className="px-2 py-2 text-right">{formatTl(c.tutar)}</td>
                    <td className="px-2 py-2">{statusLabels[c.status]}</td>
                    <td className="px-2 py-2">{konum}</td>
                    <td className="px-2 py-2">
                      {/* ÇEK / SENET KANONİK SÖZLEŞMESİ - 9.5: Çek görseli zorunlu, yüklüyse UI'da asla 'Yok' yazamaz */}
                      {/* Görsel kontrolü: imageDataUrl veya imageUrl varsa göster */}
                      {c.imageDataUrl || c.imageUrl ? (
                        <button
                          className="text-xs text-blue-600 underline"
                          onClick={() => {
                            const imageUrl = c.imageDataUrl || c.imageUrl || null;
                            setPreviewImageUrl(imageUrl);
                            setPreviewTitle(c.imageFileName || `Çek No: ${c.cekNo}`);
                          }}
                        >
                          Göster
                        </button>
                      ) : (
                        // ÇEK / SENET KANONİK SÖZLEŞMESİ - 9.5: Görsel yoksa göster (ama zorunlu olduğu için bu durum olmamalı)
                        <span className="text-xs text-rose-600">Görsel yüklenmemiş</span>
                      )}
                    </td>
                    <td className="px-2 py-2 truncate" title={c.aciklama || ''}>
                      {c.aciklama || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {previewImageUrl && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl max-h-[90vh] p-4 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold">{previewTitle}</h2>
                <button
                  className="text-xs text-gray-500 hover:text-gray-800"
                  onClick={() => setPreviewImageUrl(null)}
                >
                  Kapat
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <img src={previewImageUrl} alt={previewTitle} className="max-w-full h-auto mx-auto" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
