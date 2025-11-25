import { useEffect, useState } from 'react';
import { BankMaster } from '../models/bank';
import { PosTerminal } from '../models/pos';
import { Customer } from '../models/customer';
import { Supplier } from '../models/supplier';
import { CreditCard } from '../models/card';
import { Loan } from '../models/loan';
import { GlobalSettings } from '../models/settings';
import { generateId } from '../utils/id';
import { parseTl } from '../utils/money';
import { todayIso } from '../utils/date';

export type SettingsTabKey =
  | 'BANKALAR'
  | 'POS'
  | 'MUSTERI'
  | 'TEDARIKCI'
  | 'KARTLAR'
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
  setPosTerminals: (pos: PosTerminal[]) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  suppliers: Supplier[];
  setSuppliers: (suppliers: Supplier[]) => void;
  creditCards: CreditCard[];
  setCreditCards: (cards: CreditCard[]) => void;
  loans: Loan[];
  setLoans: (loans: Loan[]) => void;
  globalSettings: GlobalSettings;
  setGlobalSettings: (gs: GlobalSettings) => void;
}

export default function AyarlarModal(props: Props) {
  const {
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
  } = props;

  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) setDirty(false);
  }, [isOpen]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Ayarlar</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="border-b mb-4 flex space-x-2 text-sm">
          {(
            [
              { key: 'BANKALAR', label: 'Bankalar' },
              { key: 'POS', label: 'POS Listesi' },
              { key: 'MUSTERI', label: 'Müşteriler' },
              { key: 'TEDARIKCI', label: 'Tedarikçiler' },
              { key: 'KARTLAR', label: 'Kredi Kartları' },
              { key: 'KREDILER', label: 'Krediler' },
              { key: 'GLOBAL', label: 'Global Ayarlar' },
            ] as { key: SettingsTabKey; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              className={`px-3 py-2 rounded-t ${activeTab === tab.key ? 'bg-white border border-b-white' : 'bg-slate-200'}`}
              onClick={() => onChangeTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'BANKALAR' && (
          <BankalarTab banks={banks} setBanks={setBanks} onDirty={() => setDirty(true)} />
        )}
        {activeTab === 'POS' && (
          <PosTab banks={banks} posTerminals={posTerminals} setPosTerminals={setPosTerminals} onDirty={() => setDirty(true)} />
        )}
        {activeTab === 'MUSTERI' && (
          <CustomerTab customers={customers} setCustomers={setCustomers} onDirty={() => setDirty(true)} />
        )}
        {activeTab === 'TEDARIKCI' && (
          <SupplierTab suppliers={suppliers} setSuppliers={setSuppliers} onDirty={() => setDirty(true)} />
        )}
        {activeTab === 'KARTLAR' && (
          <CardTab banks={banks} creditCards={creditCards} setCreditCards={setCreditCards} onDirty={() => setDirty(true)} />
        )}
        {activeTab === 'KREDILER' && (
          <LoanTab banks={banks} loans={loans} setLoans={setLoans} onDirty={() => setDirty(true)} />
        )}
        {activeTab === 'GLOBAL' && (
          <GlobalTab globalSettings={globalSettings} setGlobalSettings={setGlobalSettings} onDirty={() => setDirty(true)} />
        )}
      </div>
    </div>
  );
}

function BankalarTab({ banks, setBanks, onDirty }: { banks: BankMaster[]; setBanks: (b: BankMaster[]) => void; onDirty: () => void }) {
  const [form, setForm] = useState({ bankaAdi: '', kodu: '', hesapAdi: '', iban: '', acilisBakiyesi: '', aktifMi: true });

  const addBank = () => {
    const acilis = parseTl(form.acilisBakiyesi || '0') || 0;
    if (!form.bankaAdi || !form.kodu || !form.hesapAdi) return;
    setBanks([...banks, { id: generateId(), bankaAdi: form.bankaAdi, kodu: form.kodu, hesapAdi: form.hesapAdi, iban: form.iban, acilisBakiyesi: acilis, aktifMi: form.aktifMi }]);
    setForm({ bankaAdi: '', kodu: '', hesapAdi: '', iban: '', acilisBakiyesi: '', aktifMi: true });
    onDirty();
  };

  const remove = (id: string) => setBanks(banks.filter((b) => b.id !== id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label>Banka Adı</label>
        <input value={form.bankaAdi} onChange={(e) => setForm({ ...form, bankaAdi: e.target.value })} />
        <label>Kodu</label>
        <input value={form.kodu} onChange={(e) => setForm({ ...form, kodu: e.target.value })} />
        <label>Hesap Adı</label>
        <input value={form.hesapAdi} onChange={(e) => setForm({ ...form, hesapAdi: e.target.value })} />
        <label>IBAN</label>
        <input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} />
        <label>Açılış Bakiyesi</label>
        <input value={form.acilisBakiyesi} onChange={(e) => setForm({ ...form, acilisBakiyesi: e.target.value })} />
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={addBank}>Ekle</button>
      </div>
      <div className="max-h-72 overflow-auto text-sm divide-y">
        {banks.map((b) => (
          <div key={b.id} className="py-2 flex justify-between">
            <div>
              <div className="font-semibold">{b.hesapAdi}</div>
              <div className="text-slate-500">{b.kodu}</div>
            </div>
            <button className="text-rose-600" onClick={() => remove(b.id)}>
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PosTab({ banks, posTerminals, setPosTerminals, onDirty }: { banks: BankMaster[]; posTerminals: PosTerminal[]; setPosTerminals: (p: PosTerminal[]) => void; onDirty: () => void }) {
  const [form, setForm] = useState({ bankaId: '', posAdi: '', komisyonOrani: 0.02, aktifMi: true });

  const addPos = () => {
    if (!form.bankaId || !form.posAdi) return;
    setPosTerminals([...posTerminals, { id: generateId(), bankaId: form.bankaId, posAdi: form.posAdi, komisyonOrani: form.komisyonOrani, aktifMi: form.aktifMi }]);
    setForm({ bankaId: '', posAdi: '', komisyonOrani: 0.02, aktifMi: true });
    onDirty();
  };

  const remove = (id: string) => setPosTerminals(posTerminals.filter((p) => p.id !== id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label>Banka</label>
        <select value={form.bankaId} onChange={(e) => setForm({ ...form, bankaId: e.target.value })}>
          <option value="">Seçiniz</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.hesapAdi}
            </option>
          ))}
        </select>
        <label>POS Adı</label>
        <input value={form.posAdi} onChange={(e) => setForm({ ...form, posAdi: e.target.value })} />
        <label>Komisyon Oranı</label>
        <input
          type="number"
          step="0.001"
          value={form.komisyonOrani}
          onChange={(e) => setForm({ ...form, komisyonOrani: Number(e.target.value) })}
        />
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={addPos}>Ekle</button>
      </div>
      <div className="max-h-72 overflow-auto text-sm divide-y">
        {posTerminals.map((p) => (
          <div key={p.id} className="py-2 flex justify-between">
            <div>
              <div className="font-semibold">{p.posAdi}</div>
              <div className="text-slate-500">{banks.find((b) => b.id === p.bankaId)?.kodu || ''}</div>
            </div>
            <button className="text-rose-600" onClick={() => remove(p.id)}>
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerTab({ customers, setCustomers, onDirty }: { customers: Customer[]; setCustomers: (c: Customer[]) => void; onDirty: () => void }) {
  const [form, setForm] = useState({ kod: '', ad: '', aktifMi: true });
  const add = () => {
    if (!form.kod || !form.ad) return;
    setCustomers([...customers, { id: generateId(), kod: form.kod, ad: form.ad, aktifMi: form.aktifMi }]);
    setForm({ kod: '', ad: '', aktifMi: true });
    onDirty();
  };
  const remove = (id: string) => setCustomers(customers.filter((c) => c.id !== id));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label>Kod</label>
        <input value={form.kod} onChange={(e) => setForm({ ...form, kod: e.target.value })} />
        <label>Ad</label>
        <input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} />
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={add}>Ekle</button>
      </div>
      <div className="max-h-72 overflow-auto text-sm divide-y">
        {customers.map((c) => (
          <div key={c.id} className="py-2 flex justify-between">
            <span>{c.kod} - {c.ad}</span>
            <button className="text-rose-600" onClick={() => remove(c.id)}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupplierTab({ suppliers, setSuppliers, onDirty }: { suppliers: Supplier[]; setSuppliers: (s: Supplier[]) => void; onDirty: () => void }) {
  const [form, setForm] = useState({ kod: '', ad: '', aktifMi: true });
  const add = () => {
    if (!form.kod || !form.ad) return;
    setSuppliers([...suppliers, { id: generateId(), kod: form.kod, ad: form.ad, aktifMi: form.aktifMi }]);
    setForm({ kod: '', ad: '', aktifMi: true });
    onDirty();
  };
  const remove = (id: string) => setSuppliers(suppliers.filter((c) => c.id !== id));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label>Kod</label>
        <input value={form.kod} onChange={(e) => setForm({ ...form, kod: e.target.value })} />
        <label>Ad</label>
        <input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} />
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={add}>Ekle</button>
      </div>
      <div className="max-h-72 overflow-auto text-sm divide-y">
        {suppliers.map((c) => (
          <div key={c.id} className="py-2 flex justify-between">
            <span>{c.kod} - {c.ad}</span>
            <button className="text-rose-600" onClick={() => remove(c.id)}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardTab({ banks, creditCards, setCreditCards, onDirty }: { banks: BankMaster[]; creditCards: CreditCard[]; setCreditCards: (c: CreditCard[]) => void; onDirty: () => void }) {
  const [form, setForm] = useState({
    kartAdi: '',
    bankaId: '',
    kartLimit: '',
    asgariOran: '',
    hesapKesimGunu: '',
    sonOdemeGunu: '',
    maskeliKartNo: '',
    aktifMi: true,
    sonEkstreBorcu: '',
    guncelBorc: '',
  });

  const add = () => {
    const limit = parseTl(form.kartLimit || '0') || 0;
    const asgari = Number(form.asgariOran || '0') || 0;
    const sonEkstre = parseTl(form.sonEkstreBorcu || '0') || 0;
    const borc = parseTl(form.guncelBorc || '0') || 0;
    if (!form.kartAdi || !form.bankaId) return;
    setCreditCards([
      ...creditCards,
      {
        id: generateId(),
        kartAdi: form.kartAdi,
        bankaId: form.bankaId,
        kartLimit: limit,
        asgariOran: asgari,
        hesapKesimGunu: Number(form.hesapKesimGunu || '1'),
        sonOdemeGunu: Number(form.sonOdemeGunu || '1'),
        maskeliKartNo: form.maskeliKartNo,
        aktifMi: form.aktifMi,
        sonEkstreBorcu: sonEkstre,
        guncelBorc: borc,
      },
    ]);
    setForm({
      kartAdi: '',
      bankaId: '',
      kartLimit: '',
      asgariOran: '',
      hesapKesimGunu: '',
      sonOdemeGunu: '',
      maskeliKartNo: '',
      aktifMi: true,
      sonEkstreBorcu: '',
      guncelBorc: '',
    });
    onDirty();
  };

  const remove = (id: string) => setCreditCards(creditCards.filter((c) => c.id !== id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label>Kart Adı</label>
        <input value={form.kartAdi} onChange={(e) => setForm({ ...form, kartAdi: e.target.value })} />
        <label>Banka</label>
        <select value={form.bankaId} onChange={(e) => setForm({ ...form, bankaId: e.target.value })}>
          <option value="">Seçiniz</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.hesapAdi}
            </option>
          ))}
        </select>
        <label>Kart Limit</label>
        <input value={form.kartLimit} onChange={(e) => setForm({ ...form, kartLimit: e.target.value })} />
        <label>Asgari Oran</label>
        <input value={form.asgariOran} onChange={(e) => setForm({ ...form, asgariOran: e.target.value })} />
        <label>Hesap Kesim Günü</label>
        <input value={form.hesapKesimGunu} onChange={(e) => setForm({ ...form, hesapKesimGunu: e.target.value })} />
        <label>Son Ödeme Günü</label>
        <input value={form.sonOdemeGunu} onChange={(e) => setForm({ ...form, sonOdemeGunu: e.target.value })} />
        <label>Maskeli Kart No</label>
        <input value={form.maskeliKartNo} onChange={(e) => setForm({ ...form, maskeliKartNo: e.target.value })} />
        <label>Son Ekstre Borcu</label>
        <input value={form.sonEkstreBorcu} onChange={(e) => setForm({ ...form, sonEkstreBorcu: e.target.value })} />
        <label>Güncel Borç</label>
        <input value={form.guncelBorc} onChange={(e) => setForm({ ...form, guncelBorc: e.target.value })} />
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={add}>Ekle</button>
      </div>
      <div className="max-h-72 overflow-auto text-sm divide-y">
        {creditCards.map((c) => (
          <div key={c.id} className="py-2 flex justify-between">
            <div>
              <div className="font-semibold">{c.kartAdi}</div>
              <div className="text-slate-500">{banks.find((b) => b.id === c.bankaId)?.kodu || ''}</div>
            </div>
            <button className="text-rose-600" onClick={() => remove(c.id)}>
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoanTab({ banks, loans, setLoans, onDirty }: { banks: BankMaster[]; loans: Loan[]; setLoans: (l: Loan[]) => void; onDirty: () => void }) {
  const [form, setForm] = useState({
    krediAdi: '',
    bankaId: '',
    toplamKrediTutari: '',
    vadeSayisi: '',
    ilkTaksitTarihi: todayIso(),
    faizOraniYillik: '',
    bsmvOrani: '',
    aktifMi: true,
  });

  const add = () => {
    const toplam = parseTl(form.toplamKrediTutari || '0') || 0;
    const vade = Number(form.vadeSayisi || '0');
    const faiz = Number(form.faizOraniYillik || '0');
    const bsmv = Number(form.bsmvOrani || '0');
    if (!form.krediAdi || !form.bankaId || !form.ilkTaksitTarihi) return;
    setLoans([
      ...loans,
      {
        id: generateId(),
        krediAdi: form.krediAdi,
        bankaId: form.bankaId,
        toplamKrediTutari: toplam,
        vadeSayisi: vade,
        ilkTaksitTarihi: form.ilkTaksitTarihi,
        faizOraniYillik: faiz,
        bsmvOrani: bsmv,
        aktifMi: form.aktifMi,
      },
    ]);
    setForm({
      krediAdi: '',
      bankaId: '',
      toplamKrediTutari: '',
      vadeSayisi: '',
      ilkTaksitTarihi: todayIso(),
      faizOraniYillik: '',
      bsmvOrani: '',
      aktifMi: true,
    });
    onDirty();
  };

  const remove = (id: string) => setLoans(loans.filter((l) => l.id !== id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label>Kredi Adı</label>
        <input value={form.krediAdi} onChange={(e) => setForm({ ...form, krediAdi: e.target.value })} />
        <label>Banka</label>
        <select value={form.bankaId} onChange={(e) => setForm({ ...form, bankaId: e.target.value })}>
          <option value="">Seçiniz</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.hesapAdi}
            </option>
          ))}
        </select>
        <label>Toplam Kredi Tutarı</label>
        <input value={form.toplamKrediTutari} onChange={(e) => setForm({ ...form, toplamKrediTutari: e.target.value })} />
        <label>Vade Sayısı</label>
        <input value={form.vadeSayisi} onChange={(e) => setForm({ ...form, vadeSayisi: e.target.value })} />
        <label>İlk Taksit Tarihi</label>
        <input type="date" value={form.ilkTaksitTarihi} onChange={(e) => setForm({ ...form, ilkTaksitTarihi: e.target.value })} />
        <label>Faiz Oranı (Yıllık)</label>
        <input value={form.faizOraniYillik} onChange={(e) => setForm({ ...form, faizOraniYillik: e.target.value })} />
        <label>BSMV Oranı</label>
        <input value={form.bsmvOrani} onChange={(e) => setForm({ ...form, bsmvOrani: e.target.value })} />
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={add}>Ekle</button>
      </div>
      <div className="max-h-72 overflow-auto text-sm divide-y">
        {loans.map((l) => (
          <div key={l.id} className="py-2 flex justify-between">
            <div>
              <div className="font-semibold">{l.krediAdi}</div>
              <div className="text-slate-500">{banks.find((b) => b.id === l.bankaId)?.kodu || ''}</div>
            </div>
            <button className="text-rose-600" onClick={() => remove(l.id)}>
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlobalTab({ globalSettings, setGlobalSettings, onDirty }: { globalSettings: GlobalSettings; setGlobalSettings: (g: GlobalSettings) => void; onDirty: () => void }) {
  const [form, setForm] = useState(globalSettings);

  useEffect(() => {
    setForm(globalSettings);
  }, [globalSettings]);

  const save = () => {
    setGlobalSettings(form);
    onDirty();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label>Varsayılan Asgari Ödeme Oranı</label>
        <input
          type="number"
          step="0.01"
          value={form.varsayilanAsgariOdemeOrani}
          onChange={(e) => setForm({ ...form, varsayilanAsgariOdemeOrani: Number(e.target.value) })}
        />
        <label>Varsayılan BSMV Oranı</label>
        <input
          type="number"
          step="0.01"
          value={form.varsayilanBsmvOrani}
          onChange={(e) => setForm({ ...form, varsayilanBsmvOrani: Number(e.target.value) })}
        />
        <label>Yaklaşan Ödeme Gün</label>
        <input
          type="number"
          value={form.yaklasanOdemeGun}
          onChange={(e) => setForm({ ...form, yaklasanOdemeGun: Number(e.target.value) })}
        />
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={save}>Kaydet</button>
      </div>
    </div>
  );
}
