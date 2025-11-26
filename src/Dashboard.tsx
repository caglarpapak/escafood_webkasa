import { useEffect, useMemo, useState } from 'react';
import { AppUser } from './models/user';
import { BankMaster } from './models/bank';
import { PosTerminal } from './models/pos';
import { Customer } from './models/customer';
import { Supplier } from './models/supplier';
import { CreditCard } from './models/card';
import { Loan } from './models/loan';
import { GlobalSettings } from './models/settings';
import { Cheque } from './models/cheque';
import { DailyTransaction } from './models/transaction';
import { UpcomingPayment } from './models/upcomingPayment';
import { isoToDisplay, todayIso, getWeekdayTr, diffInDays } from './utils/date';
import { formatTl } from './utils/money';
import { getNextBelgeNo } from './utils/documentNo';
import { generateId } from './utils/id';
import { buildLoanSchedule } from './utils/loan';
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

function recalcBalances(transactions: DailyTransaction[]): DailyTransaction[] {
  const sorted = [...transactions].sort((a, b) => {
    if (a.isoDate === b.isoDate) return a.documentNo.localeCompare(b.documentNo);
    return a.isoDate.localeCompare(b.isoDate);
  });
  let balance = BASE_CASH_BALANCE;
  return sorted.map((tx) => {
    balance += (tx.incoming || 0) - (tx.outgoing || 0);
    return { ...tx, balanceAfter: balance };
  });
}

function mergeTransactions(
  existing: DailyTransaction[],
  additions: DailyTransaction[]
): DailyTransaction[] {
  const duplicates = new Set(
    existing.map(
      (t) => `${t.isoDate}|${t.documentNo}|${t.type}|${t.incoming}|${t.outgoing}|${t.counterparty}`
    )
  );
  const filtered = additions.filter(
    (t) => !duplicates.has(`${t.isoDate}|${t.documentNo}|${t.type}|${t.incoming}|${t.outgoing}|${t.counterparty}`)
  );
  return recalcBalances([...existing, ...filtered]);
}

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [openForm, setOpenForm] = useState<OpenFormKey>(null);
  const [settingsTab, setSettingsTab] = useState<SettingsTabKey>('BANKALAR');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<Record<string, boolean>>({});

  const [banks, setBanks] = useState<BankMaster[]>([
    { id: generateId(), bankaAdi: 'Yapı Kredi', kodu: 'YKB', hesapAdi: 'YKB-Vadesiz TL', acilisBakiyesi: 0, aktifMi: true },
    { id: generateId(), bankaAdi: 'Enpara', kodu: 'ENPR', hesapAdi: 'ENPR-Vadesiz TL', acilisBakiyesi: 0, aktifMi: true },
    { id: generateId(), bankaAdi: 'Halkbank', kodu: 'HALK', hesapAdi: 'HALK-Vadesiz TL', acilisBakiyesi: 0, aktifMi: true },
  ]);
  const [posTerminals, setPosTerminals] = useState<PosTerminal[]>([]);
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

  useEffect(() => {
    const payments: UpcomingPayment[] = [];
    const today = todayIso();

    creditCards
      .filter((c) => c.sonEkstreBorcu > 0)
      .forEach((card) => {
        const todayDate = new Date(`${today}T00:00:00Z`);
        const year = todayDate.getUTCFullYear();
        const month = todayDate.getUTCMonth();
        const dueThisMonth = new Date(Date.UTC(year, month, card.sonOdemeGunu));
        const dueDate = dueThisMonth >= todayDate ? dueThisMonth : new Date(Date.UTC(year, month + 1, card.sonOdemeGunu));
        const dueIso = dueDate.toISOString().slice(0, 10);
        payments.push({
          id: `cc-${card.id}`,
          category: 'KREDI_KARTI',
          bankName: banks.find((b) => b.id === card.bankaId)?.bankaAdi || '-',
          name: card.kartAdi,
          dueDateIso: dueIso,
          dueDateDisplay: isoToDisplay(dueIso),
          amount: card.sonEkstreBorcu,
          daysLeft: diffInDays(today, dueIso),
        });
      });

    loans
      .filter((l) => l.aktifMi)
      .forEach((loan) => {
        const schedule = buildLoanSchedule(loan);
        const nextInstallment = schedule.find((inst) => inst.dateIso >= today) || schedule[schedule.length - 1];
        if (!nextInstallment) return;
        payments.push({
          id: `loan-${loan.id}`,
          category: 'KREDI',
          bankName: banks.find((b) => b.id === loan.bankaId)?.bankaAdi || '-',
          name: loan.krediAdi,
          dueDateIso: nextInstallment.dateIso,
          dueDateDisplay: isoToDisplay(nextInstallment.dateIso),
          amount: nextInstallment.totalPayment,
          daysLeft: diffInDays(today, nextInstallment.dateIso),
        });
      });

    cheques
      .filter((c) => ['KASADA', 'BANKADA_TAHSILDE', 'ODEMEDE'].includes(c.status))
      .forEach((cek) => {
        payments.push({
          id: `cek-${cek.id}`,
          category: 'CEK',
          bankName: cek.bankaAdi,
          name: cek.lehdar,
          dueDateIso: cek.vadeTarihi,
          dueDateDisplay: isoToDisplay(cek.vadeTarihi),
          amount: cek.tutar,
          daysLeft: diffInDays(today, cek.vadeTarihi),
        });
      });
    setUpcomingPayments(payments);
  }, [banks, creditCards, loans, cheques]);

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

  const cashBalance = useMemo(() => {
    const sorted = recalcBalances(dailyTransactions);
    return sorted.length ? sorted[sorted.length - 1].balanceAfter : BASE_CASH_BALANCE;
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

  const addTransactions = (newOnes: DailyTransaction[]) => {
    setDailyTransactions((prev) => mergeTransactions(prev, newOnes));
  };

  const handleNakitGirisSaved = (values: NakitGirisFormValues) => {
    const documentNo = getNextBelgeNo('NKT-GRS', values.islemTarihiIso, dailyTransactions);
    const nowIso = new Date().toISOString();
    const tx: DailyTransaction = {
      id: generateId(),
      isoDate: values.islemTarihiIso,
      displayDate: isoToDisplay(values.islemTarihiIso),
      documentNo,
      type: 'Nakit Giriş',
      source: values.kaynak,
      counterparty: values.muhatap || 'Diğer',
      description: values.aciklama || '',
      incoming: values.tutar,
      outgoing: 0,
      balanceAfter: 0,
      bankId: values.kaynak === 'KASA_TRANSFER_BANKADAN' ? values.bankaId : undefined,
      bankDelta: values.kaynak === 'KASA_TRANSFER_BANKADAN' ? -values.tutar : undefined,
      displayIncoming: values.tutar,
      createdAtIso: nowIso,
      createdBy: currentUser.email,
    };
    addTransactions([tx]);
    setOpenForm(null);
  };

  const handleNakitCikisSaved = (values: NakitCikisFormValues) => {
    const documentNo = getNextBelgeNo('NKT-CKS', values.islemTarihiIso, dailyTransactions);
    const nowIso = new Date().toISOString();
    const supplierName =
      values.muhatapId && suppliers.find((s) => s.id === values.muhatapId)
        ? (() => {
            const s = suppliers.find((sup) => sup.id === values.muhatapId)!;
            return `${s.kod} - ${s.ad}`;
          })()
        : undefined;
    const counterparty = supplierName || values.muhatap || 'Diğer';
    const tx: DailyTransaction = {
      id: generateId(),
      isoDate: values.islemTarihiIso,
      displayDate: isoToDisplay(values.islemTarihiIso),
      documentNo,
      type: 'Nakit Çıkış',
      source: values.kaynak,
      counterparty,
      description: values.aciklama || '',
      incoming: 0,
      outgoing: values.tutar,
      balanceAfter: 0,
      bankId: values.kaynak === 'KASA_TRANSFER_BANKAYA' ? values.bankaId : undefined,
      bankDelta: values.kaynak === 'KASA_TRANSFER_BANKAYA' ? values.tutar : undefined,
      displayOutgoing: values.tutar,
      createdAtIso: nowIso,
      createdBy: currentUser.email,
    };
    addTransactions([tx]);
    setOpenForm(null);
  };

  const handleBankaNakitGirisSaved = (values: BankaNakitGirisFormValues) => {
    const documentNo = getNextBelgeNo('BNK-GRS', values.islemTarihiIso, dailyTransactions);
    const nowIso = new Date().toISOString();
    const foundCustomer = values.muhatapId ? customers.find((c) => c.id === values.muhatapId) : undefined;
    const foundSupplier = values.muhatapId ? suppliers.find((s) => s.id === values.muhatapId) : undefined;
    const counterparty =
      (foundCustomer && `${foundCustomer.kod} - ${foundCustomer.ad}`) ||
      (foundSupplier && `${foundSupplier.kod} - ${foundSupplier.ad}`) ||
      values.muhatap ||
      'Diğer';
    const tx: DailyTransaction = {
      id: generateId(),
      isoDate: values.islemTarihiIso,
      displayDate: isoToDisplay(values.islemTarihiIso),
      documentNo,
      type: values.islemTuru === 'CEK_TAHSILATI' ? 'Banka Giriş - Çek Tahsilatı' : 'Banka Giriş',
      source: values.islemTuru,
      counterparty,
      description: values.aciklama || '',
      incoming: 0,
      outgoing: 0,
      balanceAfter: 0,
      bankId: values.bankaId,
      bankDelta: values.tutar,
      displayIncoming: values.tutar,
      createdAtIso: nowIso,
      createdBy: currentUser.email,
    };
    if (values.islemTuru === 'CEK_TAHSILATI' && values.cekId) {
      setCheques((prev) => prev.map((c) => (c.id === values.cekId ? { ...c, status: 'TAHSIL_OLDU' } : c)));
    }
    addTransactions([tx]);
    setOpenForm(null);
  };

  const handleBankaNakitCikisSaved = (values: BankaNakitCikisFormValues) => {
    if (values.islemTuru === 'VIRMAN' && values.hedefBankaId) {
      const documentNoCks = getNextBelgeNo('BNK-CKS', values.islemTarihiIso, dailyTransactions);
      const documentNoGrs = getNextBelgeNo('BNK-GRS', values.islemTarihiIso, [
        ...dailyTransactions,
        { documentNo: documentNoCks } as DailyTransaction,
      ]);
      const nowIso = new Date().toISOString();
      const outTx: DailyTransaction = {
        id: generateId(),
        isoDate: values.islemTarihiIso,
        displayDate: isoToDisplay(values.islemTarihiIso),
        documentNo: documentNoCks,
        type: 'Banka Çıkış - Virman',
        source: values.islemTuru,
        counterparty: values.muhatap || 'Virman',
        description: values.aciklama || '',
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0,
        bankId: values.bankaId,
        bankDelta: -values.tutar,
        displayOutgoing: values.tutar,
        createdAtIso: nowIso,
        createdBy: currentUser.email,
      };
      const inTx: DailyTransaction = {
        id: generateId(),
        isoDate: values.islemTarihiIso,
        displayDate: isoToDisplay(values.islemTarihiIso),
        documentNo: documentNoGrs,
        type: 'Banka Giriş - Virman',
        source: values.islemTuru,
        counterparty: values.muhatap || 'Virman',
        description: `Virman - Kaynak İşlem: ${documentNoCks}`,
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0,
        bankId: values.hedefBankaId,
        bankDelta: values.tutar,
        displayIncoming: values.tutar,
        createdAtIso: nowIso,
        createdBy: currentUser.email,
      };
      addTransactions([outTx, inTx]);
    } else {
      const documentNo = getNextBelgeNo('BNK-CKS', values.islemTarihiIso, dailyTransactions);
      const nowIso = new Date().toISOString();
      let tutar = values.tutar;
      let aciklama = values.aciklama || '';

      if (values.islemTuru === 'KREDI_TAKSIDI' && values.krediId) {
        const loan = loans.find((l) => l.id === values.krediId);
        if (loan) {
          const schedule = buildLoanSchedule(loan);
          const today = values.islemTarihiIso || todayIso();
          const nextInstallment = schedule.find((inst) => inst.dateIso >= today) || schedule[schedule.length - 1];
          if (nextInstallment) {
            tutar = nextInstallment.totalPayment;
            if (!aciklama) {
              aciklama = `${loan.krediAdi} - ${nextInstallment.index}. taksit`;
            }
          }
        }
      }
      const tx: DailyTransaction = {
        id: generateId(),
        isoDate: values.islemTarihiIso,
        displayDate: isoToDisplay(values.islemTarihiIso),
        documentNo,
        type: 'Banka Çıkış',
        source: values.islemTuru,
        counterparty: values.muhatap || 'Diğer',
        description: aciklama,
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0,
        bankId: values.bankaId,
        bankDelta: -tutar,
        displayOutgoing: tutar,
        createdAtIso: nowIso,
        createdBy: currentUser.email,
      };
      if (values.islemTuru === 'CEK_ODEME' && values.cekId) {
        setCheques((prev) => prev.map((c) => (c.id === values.cekId ? { ...c, status: 'ODEME_YAPILDI' } : c)));
      }
      addTransactions([tx]);
    }
    setOpenForm(null);
  };

  const handlePosTahsilatSaved = (values: PosTahsilatFormValues) => {
    const documentNo = getNextBelgeNo('BNK-GRS', values.islemTarihiIso, dailyTransactions);
    const nowIso = new Date().toISOString();
    const tx: DailyTransaction = {
      id: generateId(),
      isoDate: values.islemTarihiIso,
      displayDate: isoToDisplay(values.islemTarihiIso),
      documentNo,
      type: 'POS Tahsilat',
      source: 'POS',
      counterparty: values.muhatap || 'POS',
      description: values.aciklama || '',
      incoming: 0,
      outgoing: 0,
      balanceAfter: 0,
      bankId: values.bankaId,
      bankDelta: values.netTutar,
      displayIncoming: values.netTutar,
      createdAtIso: nowIso,
      createdBy: currentUser.email,
    };
    addTransactions([tx]);
    setOpenForm(null);
  };

  const handleKrediKartiTedarikciSaved = (values: KrediKartiTedarikciOdemeFormValues) => {
    setCreditCards((prev) =>
      prev.map((c) => (c.id === values.cardId ? { ...c, guncelBorc: c.guncelBorc + values.tutar, sonEkstreBorcu: c.sonEkstreBorcu + values.tutar } : c))
    );
    setOpenForm(null);
  };

  const handleKrediKartiMasrafSaved = (values: KrediKartiMasrafFormValues) => {
    setCreditCards((prev) =>
      prev.map((c) => (c.id === values.cardId ? { ...c, guncelBorc: c.guncelBorc + values.tutar, sonEkstreBorcu: c.sonEkstreBorcu + values.tutar } : c))
    );
    setOpenForm(null);
  };

  const handleCekIslemSaved = (payload: CekIslemPayload) => {
    setCheques(payload.updatedCheques);
    setOpenForm(null);
  };

  const removeTransaction = (id: string) => {
    if (!window.confirm('Bu satırı silmek istediğinize emin misiniz?')) return;
    setDailyTransactions((prev) => recalcBalances(prev.filter((t) => t.id !== id)));
  };

  const todayDisplay = isoToDisplay(today);
  const weekday = getWeekdayTr(today);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-[#111827] text-white transform transition-transform duration-200 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-4 flex items-center justify-between lg:hidden">
          <span className="font-semibold">Menü</span>
          <button className="text-white" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>
        <div className="space-y-2 p-4 text-sm">
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
                { label: 'POS Tahsilat', form: 'POS_TAHSILAT' },
                { label: 'Kredi Kartı Tedarikçi Ödemesi', form: 'KK_TEDARIKCI' },
                { label: 'Kredi Kartı Masraf Ödemesi', form: 'KK_MASRAF' },
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
              color: 'bg-slate-700',
              key: 'rapor',
              items: [
                { label: 'Kasa Defteri', form: null },
                { label: 'Çek/Senet Modülü', form: null },
                { label: 'Diğer Raporlar', form: null },
              ],
            },
            {
              title: 'Ayarlar',
              color: 'bg-zinc-700',
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
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                ☰
              </button>
              <img
                src="https://esca-food.com/image/cache/catalog/web%20kasa%20logosu%20tek_-700x800.png"
                alt="Web Kasa"
                className="h-14 object-contain"
              />
              <img
                src="https://esca-food.com/image/cache/catalog/esca%20food%20logosu%20tek_-700x800.png"
                alt="Esca Food"
                className="h-14 object-contain"
              />
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
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
                  {todaysTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-2 px-2">{tx.displayDate}</td>
                      <td className="py-2 px-2">{tx.documentNo}</td>
                      <td className="py-2 px-2">{tx.type}</td>
                      <td className="py-2 px-2">{tx.source}</td>
                      <td className="py-2 px-2">{tx.counterparty}</td>
                      <td className="py-2 px-2">{tx.description}</td>
                      <td className="py-2 px-2 text-right text-emerald-600">
                        {tx.displayIncoming !== undefined ? formatTl(tx.displayIncoming) : tx.incoming ? formatTl(tx.incoming) : '-'}
                      </td>
                      <td className="py-2 px-2 text-right text-rose-600">
                        {tx.displayOutgoing !== undefined ? formatTl(tx.displayOutgoing) : tx.outgoing ? formatTl(tx.outgoing) : '-'}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
      />
      <PosTahsilat
        isOpen={openForm === 'POS_TAHSILAT'}
        onClose={() => setOpenForm(null)}
        onSaved={handlePosTahsilatSaved}
        currentUserEmail={currentUser.email}
        posTerminals={posTerminals}
        banks={banks}
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
      />
      <AyarlarModal
        isOpen={openForm === 'AYARLAR'}
        onClose={() => setOpenForm(null)}
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
    </div>
  );
}
