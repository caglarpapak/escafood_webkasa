import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import FormRow from '../components/FormRow';
import DateInput from '../components/DateInput';
import MoneyInput from '../components/MoneyInput';
import { BankMaster } from '../models/bank';
import { PosTerminal } from '../models/pos';
import { Customer } from '../models/customer';
import { Supplier } from '../models/supplier';
import { CreditCard } from '../models/card';
import { GlobalSettings } from '../models/settings';
import { generateId } from '../utils/id';
import { apiPost, apiPut, apiDelete, apiGet } from '../utils/api';

export type SettingsTabKey =
  | 'BANKALAR'
  | 'POS'
  | 'MUSTERI'
  | 'TEDARIKCI'
  | 'KARTLAR'
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
  globalSettings: GlobalSettings;
  setGlobalSettings: (gs: GlobalSettings) => void;
}

const tabs: { key: SettingsTabKey; label: string }[] = [
  { key: 'BANKALAR', label: 'Bankalar' },
  { key: 'POS', label: 'POS Listesi' },
  { key: 'MUSTERI', label: 'Müşteriler' },
  { key: 'TEDARIKCI', label: 'Tedarikçiler' },
  { key: 'KARTLAR', label: 'Kredi Kartları' },
  { key: 'GLOBAL', label: 'Global Ayarlar' },
];

const CSV_DELIMITER = ';';

function nextCode(items: { kod: string }[], prefix: string) {
  const max = items.reduce((acc, item) => {
    const num = parseInt(item.kod.replace(`${prefix}-`, ''), 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  const next = String(max + 1).padStart(4, '0');
  return `${prefix}-${next}`;
}

function parseBoolean(raw: string, defaultValue: boolean) {
  const val = (raw || '').trim().toLowerCase();
  if (['false', '0', 'hayır', 'hayir'].includes(val)) return false;
  if (['true', '1', 'evet'].includes(val)) return true;
  return defaultValue;
}

export default function AyarlarModal(props: Props) {
  const {
    isOpen,
    onClose,
    activeTab,
    onChangeTab,
    banks: propsBanks,
    setBanks,
    posTerminals,
    setPosTerminals,
    customers,
    setCustomers,
    suppliers,
    setSuppliers,
    creditCards: propsCreditCards,
    setCreditCards,
    globalSettings,
    setGlobalSettings,
  } = props;

  const [dirty, setDirty] = useState(false);
  const [globalForm, setGlobalForm] = useState<GlobalSettings>(globalSettings);
  // Fix Bug 1: Use local state for banks and credit cards - start empty, will be populated from backend
  const [localBanks, setLocalBanks] = useState<BankMaster[]>([]);
  const [localCreditCards, setLocalCreditCards] = useState<CreditCard[]>([]);

  // Fix Bug 1 & 2: Fetch fresh data from backend when modal opens
  useEffect(() => {
    if (isOpen) {
      setDirty(false);
      setGlobalForm(globalSettings);
      
      // Fetch fresh banks and credit cards from backend to ensure we show actual DB state
      const fetchFreshData = async () => {
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
            lastOperationDate: string | null;
            bank?: { id: string; name: string } | null;
          }>>('/api/credit-cards'),
        ]);

        // Fix Bug 1: Map backend banks - if DB is empty, banks array will be empty (no mock data)
        // Fix Bug 2: Load boolean flags from localStorage (they're not stored in backend)
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
            // Fix Bug 2: Load boolean flags from localStorage
            cekKarnesiVarMi: flags.cekKarnesiVarMi,
            posVarMi: flags.posVarMi,
            krediKartiVarMi: flags.krediKartiVarMi,
          };
        });

        // Fix Bug 1: Map backend credit cards - if DB is empty, cards array will be empty
        const mappedCreditCards: CreditCard[] = backendCreditCards.map((card) => {
          const limit = card.limit; // Preserve null if not set
          const availableLimit = card.availableLimit; // Preserve null if limit is not set

          return {
            id: card.id,
            bankaId: card.bankId || '',
            kartAdi: card.name,
            kartLimit: limit, // Can be null
            limit: limit, // Can be null
            kullanilabilirLimit: availableLimit, // Can be null
            asgariOran: 0.4, // Default
            hesapKesimGunu: card.closingDay || 1,
            sonOdemeGunu: card.dueDay || 1,
            maskeliKartNo: '', // Not stored in backend
            aktifMi: card.isActive,
            sonEkstreBorcu: 0, // Not calculated in backend yet
            guncelBorc: card.currentDebt,
          };
        });

        // Update local state immediately (for display in modal)
        setLocalBanks(mappedBanks);
        setLocalCreditCards(mappedCreditCards);
        
        // Also update parent state (for Dashboard)
        setBanks(mappedBanks);
        setCreditCards(mappedCreditCards);
      } catch (error) {
        console.error('Failed to fetch fresh data in Settings modal:', error);
        // On error, keep empty arrays (don't show stale props data)
        setLocalBanks([]);
        setLocalCreditCards([]);
      }
      };
      
      fetchFreshData();
    } else {
      // When modal closes, reset to empty arrays
      setLocalBanks([]);
      setLocalCreditCards([]);
    }
  }, [isOpen, globalSettings, setBanks, setCreditCards]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    
    // Fix Bug 3: Save boolean flags to localStorage before closing
    const bankFlagsKey = 'esca-webkasa-bank-flags';
    const bankFlags: Record<string, { cekKarnesiVarMi: boolean; posVarMi: boolean; krediKartiVarMi: boolean }> = {};
    localBanks.forEach((bank) => {
      bankFlags[bank.id] = {
        cekKarnesiVarMi: bank.cekKarnesiVarMi,
        posVarMi: bank.posVarMi,
        krediKartiVarMi: bank.krediKartiVarMi,
      };
    });
    localStorage.setItem(bankFlagsKey, JSON.stringify(bankFlags));
    
    // Fix Bug 3: Update parent state with latest data before closing
    setBanks(localBanks);
    setCreditCards(localCreditCards);
    
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
          {tabs.map((tab) => (
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
          <BankalarTab 
            banks={localBanks} 
            setBanks={(newBanks) => {
              setLocalBanks(newBanks);
              setBanks(newBanks);
              setDirty(true);
            }} 
            onDirty={() => setDirty(true)} 
          />
        )}
        {activeTab === 'POS' && (
          <PosTab banks={localBanks} posTerminals={posTerminals} setPosTerminals={setPosTerminals} onDirty={() => setDirty(true)} />
        )}
        {activeTab === 'MUSTERI' && (
          <CustomerTab customers={customers} setCustomers={setCustomers} onDirty={() => setDirty(true)} />
        )}
        {activeTab === 'TEDARIKCI' && (
          <SupplierTab suppliers={suppliers} setSuppliers={setSuppliers} onDirty={() => setDirty(true)} />
        )}
        {activeTab === 'KARTLAR' && (
          <CardTab
            banks={localBanks}
            creditCards={localCreditCards}
            setCreditCards={(newCards) => {
              setLocalCreditCards(newCards);
              setCreditCards(newCards);
              setDirty(true);
            }}
            onDirty={() => setDirty(true)}
          />
        )}
        {activeTab === 'GLOBAL' && (
          <GlobalTab
            form={globalForm}
            setForm={(f) => {
              setGlobalForm(f);
              setDirty(true);
            }}
            onSave={() => {
              setGlobalSettings(globalForm);
            }}
          />
        )}
      </div>
    </div>
  );
}

function BankalarTab({ banks, setBanks, onDirty }: { banks: BankMaster[]; setBanks: (b: BankMaster[]) => void; onDirty: () => void }) {
  const bankCsvInputRef = useRef<HTMLInputElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    bankaAdi: '',
    kodu: '',
    hesapAdi: '',
    iban: '',
    acilisBakiyesi: 0,
    aktifMi: true,
    cekKarnesiVarMi: false,
    posVarMi: false,
    krediKartiVarMi: false,
  });

  useEffect(() => {
    if (editingId) {
      const bank = banks.find((b) => b.id === editingId);
      if (bank) {
        setForm({
          bankaAdi: bank.bankaAdi,
          kodu: bank.kodu,
          hesapAdi: bank.hesapAdi,
          iban: bank.iban || '',
          acilisBakiyesi: bank.acilisBakiyesi,
          aktifMi: bank.aktifMi,
          cekKarnesiVarMi: bank.cekKarnesiVarMi ?? false,
          posVarMi: bank.posVarMi ?? false,
          krediKartiVarMi: bank.krediKartiVarMi ?? false,
        });
      }
    } else {
      setForm({
        bankaAdi: '',
        kodu: '',
        hesapAdi: '',
        iban: '',
        acilisBakiyesi: 0,
        aktifMi: true,
        cekKarnesiVarMi: false,
        posVarMi: false,
        krediKartiVarMi: false,
      });
    }
  }, [editingId, banks]);

  const handleSave = async () => {
    if (!form.bankaAdi || !form.kodu || !form.hesapAdi) return;
    
    try {
      if (editingId) {
        // Update existing bank - save to backend first
        const backendBank = await apiPut<{
          id: string;
          name: string;
          accountNo: string | null;
          iban: string | null;
          isActive: boolean;
        }>(`/api/banks/${editingId}`, {
          name: form.bankaAdi,
          accountNo: form.kodu,
          iban: form.iban || null,
          isActive: form.aktifMi,
        });
        
        // Find existing bank to preserve currentBalance
        const existingBank = banks.find((b) => b.id === editingId);
        const currentBalance = existingBank?.acilisBakiyesi ?? 0;
        
        // Update local state with backend response
        setBanks(
          banks.map((b) =>
            b.id === editingId
              ? {
                  id: backendBank.id, // Use real Bank.id from backend
                  bankaAdi: backendBank.name,
                  kodu: backendBank.accountNo ? backendBank.accountNo.substring(0, 4).toUpperCase() : 'BNK',
                  hesapAdi: backendBank.name + (backendBank.accountNo ? ` - ${backendBank.accountNo}` : ''),
                  iban: backendBank.iban || undefined,
                  acilisBakiyesi: currentBalance, // Preserve existing balance
                  aktifMi: backendBank.isActive,
                  cekKarnesiVarMi: form.cekKarnesiVarMi,
                  posVarMi: form.posVarMi,
                  krediKartiVarMi: form.krediKartiVarMi,
                }
              : b
          )
        );
      } else {
        // Create new bank - save to backend first to get real Bank.id
        // Include initialBalance so backend can create opening balance transaction
        const backendBank = await apiPost<{
          id: string;
          name: string;
          accountNo: string | null;
          iban: string | null;
          isActive: boolean;
          currentBalance: number;
        }>('/api/banks', {
          name: form.bankaAdi,
          accountNo: form.kodu,
          iban: form.iban || null,
          initialBalance: form.acilisBakiyesi || 0, // Send opening balance to backend
        });
        
        // Add to local state using the real Bank.id from backend
        // Use currentBalance from backend (includes opening balance transaction)
        const newBanks = [
          ...banks,
          {
            id: backendBank.id, // Use real Bank.id from backend, NOT generateId()
            bankaAdi: backendBank.name,
            kodu: backendBank.accountNo ? backendBank.accountNo.substring(0, 4).toUpperCase() : 'BNK',
            hesapAdi: backendBank.name + (backendBank.accountNo ? ` - ${backendBank.accountNo}` : ''),
            iban: backendBank.iban || undefined,
            acilisBakiyesi: backendBank.currentBalance, // Use balance from backend (includes opening transaction)
            aktifMi: backendBank.isActive,
            cekKarnesiVarMi: form.cekKarnesiVarMi,
            posVarMi: form.posVarMi,
            krediKartiVarMi: form.krediKartiVarMi,
          },
        ];
        setBanks(newBanks);
        
        // Fix Bug 4: Save boolean flags to localStorage immediately
        const bankFlagsKey = 'esca-webkasa-bank-flags';
        const bankFlags: Record<string, { cekKarnesiVarMi: boolean; posVarMi: boolean; krediKartiVarMi: boolean }> = {};
        newBanks.forEach((bank) => {
          bankFlags[bank.id] = {
            cekKarnesiVarMi: bank.cekKarnesiVarMi,
            posVarMi: bank.posVarMi,
            krediKartiVarMi: bank.krediKartiVarMi,
          };
        });
        localStorage.setItem(bankFlagsKey, JSON.stringify(bankFlags));
      }
      setEditingId(null);
      onDirty();
    } catch (error: any) {
      alert(`Banka kaydedilemedi: ${error.message || 'Bilinmeyen hata'}`);
      console.error('Failed to save bank:', error);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Bu bankayı silmek istediğinizden emin misiniz?')) return;
    
    try {
      // Delete from backend first
      await apiDelete(`/api/banks/${id}`);
      // Then remove from local state
      setBanks(banks.filter((b) => b.id !== id));
      onDirty();
    } catch (error: any) {
      alert(`Banka silinemedi: ${error.message || 'Bilinmeyen hata'}`);
      console.error('Failed to delete bank:', error);
    }
  };

  const downloadBankCsv = () => {
    const header = [
      'bankaAdi',
      'kodu',
      'hesapAdi',
      'iban',
      'acilisBakiyesi',
      'aktifMi',
      'cekKarnesiVarMi',
      'posVarMi',
      'krediKartiVarMi',
    ].join(CSV_DELIMITER);
    const lines = [
      header,
      ...banks.map((b) =>
        [
          b.bankaAdi,
          b.kodu,
          b.hesapAdi,
          b.iban || '',
          b.acilisBakiyesi,
          b.aktifMi ? 'true' : 'false',
          b.cekKarnesiVarMi ? 'true' : 'false',
          b.posVarMi ? 'true' : 'false',
          b.krediKartiVarMi ? 'true' : 'false',
        ].join(CSV_DELIMITER)
      ),
    ];
    const bom = '\uFEFF';
    const csvContent = bom + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bankalar.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBankCsvChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result as string;
      const text = raw.replace(/^\uFEFF/, '');
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length < 2) return;
      const headerCols = lines[0].split(CSV_DELIMITER).map((h) => h.trim().toLowerCase());
      const expected = [
        'bankaadi',
        'kodu',
        'hesapadi',
        'iban',
        'acilisbakiyesi',
        'aktifmi',
        'cekkarnesivarmi',
        'posvarmi',
        'kredikartivarmi',
      ];
      if (headerCols.length < expected.length || expected.some((h, idx) => headerCols[idx] !== h)) {
        alert(
          'Geçersiz CSV formatı. Başlıklar bankaAdi,kodu,hesapAdi,iban,acilisBakiyesi,aktifMi,cekKarnesiVarMi,posVarMi,krediKartiVarMi olmalıdır.'
        );
        return;
      }
      
      // Parse CSV rows
      const parsedRows = lines
        .slice(1)
        .map((line) => {
          const cols = line.split(CSV_DELIMITER);
          const bankaAdi = (cols[0] || '').trim();
          const kodu = (cols[1] || '').trim();
          const hesapAdi = (cols[2] || '').trim();
          if (!bankaAdi && !kodu && !hesapAdi) return null;
          const iban = (cols[3] || '').trim();
          const acilisBakiyesi = parseFloat(cols[4] || '0') || 0;
          const aktifMi = parseBoolean(cols[5] || '', true);
          const cekKarnesiVarMi = parseBoolean(cols[6] || '', false);
          const posVarMi = parseBoolean(cols[7] || '', false);
          const krediKartiVarMi = parseBoolean(cols[8] || '', false);
          return {
            bankaAdi,
            kodu,
            hesapAdi,
            iban,
            acilisBakiyesi,
            aktifMi,
            cekKarnesiVarMi,
            posVarMi,
            krediKartiVarMi,
          };
        })
        .filter(Boolean) as Array<{
          bankaAdi: string;
          kodu: string;
          hesapAdi: string;
          iban: string;
          acilisBakiyesi: number;
          aktifMi: boolean;
          cekKarnesiVarMi: boolean;
          posVarMi: boolean;
          krediKartiVarMi: boolean;
        }>;
      
      // Save each bank to backend with opening balance
      const createdBanks: BankMaster[] = [];
      let errorCount = 0;
      
      for (const row of parsedRows) {
        try {
          const backendBank = await apiPost<{
            id: string;
            name: string;
            accountNo: string | null;
            iban: string | null;
            isActive: boolean;
            currentBalance: number;
          }>('/api/banks', {
            name: row.bankaAdi,
            accountNo: row.kodu,
            iban: row.iban || null,
            initialBalance: row.acilisBakiyesi || 0, // Send opening balance to backend
          });
          
          // Map backend response to BankMaster format
          createdBanks.push({
            id: backendBank.id, // Real Bank.id from backend
            bankaAdi: backendBank.name,
            kodu: backendBank.accountNo ? backendBank.accountNo.substring(0, 4).toUpperCase() : 'BNK',
            hesapAdi: backendBank.name + (backendBank.accountNo ? ` - ${backendBank.accountNo}` : ''),
            iban: backendBank.iban || undefined,
            acilisBakiyesi: backendBank.currentBalance, // Use balance from backend (includes opening transaction)
            aktifMi: backendBank.isActive,
            cekKarnesiVarMi: row.cekKarnesiVarMi,
            posVarMi: row.posVarMi,
            krediKartiVarMi: row.krediKartiVarMi,
          });
        } catch (error: any) {
          console.error(`Failed to create bank ${row.bankaAdi}:`, error);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        alert(`${errorCount} banka kaydedilemedi. Lütfen konsolu kontrol edin.`);
      }
      
      if (createdBanks.length > 0) {
        // Add all created banks to local state
        setBanks([...banks, ...createdBanks]);
        onDirty();
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <button className="text-sm px-3 py-2 rounded border bg-white" onClick={downloadBankCsv}>
            CSV İndir
          </button>
          <button
            className="text-sm px-3 py-2 rounded border bg-white"
            onClick={() => bankCsvInputRef.current?.click()}
          >
            CSV Yükle
          </button>
          <input
            ref={bankCsvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleBankCsvChange}
          />
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-2 py-1">Adı</th>
                <th className="text-left px-2 py-1">Kodu</th>
              <th className="text-left px-2 py-1">Hesap</th>
              <th className="text-left px-2 py-1">Açılış</th>
              <th className="px-2 py-1" />
            </tr>
            </thead>
            <tbody>
              {banks.map((b) => (
                <tr key={b.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setEditingId(b.id)}>
                  <td className="px-2 py-1">{b.bankaAdi}</td>
                <td className="px-2 py-1">{b.kodu}</td>
                <td className="px-2 py-1">{b.hesapAdi}</td>
                <td className="px-2 py-1 text-right">{b.acilisBakiyesi.toFixed(2)}</td>
                <td className="px-2 py-1 text-right">
                  <button className="text-rose-600" onClick={() => handleRemove(b.id)}>
                    Sil
                  </button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="font-semibold">{editingId ? 'Banka Düzenle' : 'Yeni Banka'}</div>
          <button className="text-sm text-indigo-600" onClick={() => setEditingId(null)}>
            Yeni
          </button>
        </div>
        <FormRow label="Banka Adı" required>
          <input className="input" value={form.bankaAdi} onChange={(e) => setForm({ ...form, bankaAdi: e.target.value })} />
        </FormRow>
        <FormRow label="Kodu" required>
          <input className="input" value={form.kodu} onChange={(e) => setForm({ ...form, kodu: e.target.value })} />
        </FormRow>
        <FormRow label="Hesap Adı" required>
          <input className="input" value={form.hesapAdi} onChange={(e) => setForm({ ...form, hesapAdi: e.target.value })} />
        </FormRow>
        <FormRow label="IBAN">
          <input className="input" value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} />
        </FormRow>
        <FormRow label="Açılış Bakiyesi">
          <MoneyInput className="input" value={form.acilisBakiyesi} onChange={(val) => setForm({ ...form, acilisBakiyesi: val || 0 })} />
        </FormRow>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.cekKarnesiVarMi}
              onChange={(e) => setForm({ ...form, cekKarnesiVarMi: e.target.checked })}
            />
            <span>Çek Karnesi Var</span>
          </label>
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.posVarMi}
              onChange={(e) => setForm({ ...form, posVarMi: e.target.checked })}
            />
            <span>POS Var</span>
          </label>
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.krediKartiVarMi}
              onChange={(e) => setForm({ ...form, krediKartiVarMi: e.target.checked })}
            />
            <span>Kredi Kartı Var</span>
          </label>
        </div>
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={handleSave}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function PosTab({ banks, posTerminals, setPosTerminals, onDirty }: { banks: BankMaster[]; posTerminals: PosTerminal[]; setPosTerminals: (p: PosTerminal[]) => void; onDirty: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ bankaId: '', posAdi: '', komisyonOrani: 0.02, aktifMi: true });

  useEffect(() => {
    if (editingId) {
      const p = posTerminals.find((x) => x.id === editingId);
      if (p) setForm({ bankaId: p.bankaId, posAdi: p.posAdi, komisyonOrani: p.komisyonOrani, aktifMi: p.aktifMi });
    } else {
      setForm({ bankaId: '', posAdi: '', komisyonOrani: 0.02, aktifMi: true });
    }
  }, [editingId, posTerminals]);

  const save = () => {
    if (!form.bankaId || !form.posAdi) return;
    if (editingId) {
      setPosTerminals(posTerminals.map((p) => (p.id === editingId ? { ...p, ...form } : p)));
    } else {
      setPosTerminals([...posTerminals, { id: generateId(), ...form }]);
    }
    setEditingId(null);
    onDirty();
  };

  const remove = (id: string) => setPosTerminals(posTerminals.filter((p) => p.id !== id));

  const posBanks = banks.filter((b) => b.posVarMi || b.id === form.bankaId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-2 py-1">POS</th>
              <th className="text-left px-2 py-1">Banka</th>
              <th className="text-left px-2 py-1">Komisyon</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {posTerminals.map((p) => (
              <tr key={p.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setEditingId(p.id)}>
                <td className="px-2 py-1">{p.posAdi}</td>
                <td className="px-2 py-1">{banks.find((b) => b.id === p.bankaId)?.bankaAdi || '-'}</td>
                <td className="px-2 py-1">{(p.komisyonOrani * 100).toFixed(2)}%</td>
                <td className="px-2 py-1 text-right">
                  <button className="text-rose-600" onClick={() => remove(p.id)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="font-semibold">{editingId ? 'POS Düzenle' : 'Yeni POS'}</div>
          <button className="text-sm text-indigo-600" onClick={() => setEditingId(null)}>
            Yeni
          </button>
        </div>
        <FormRow label="Banka" required>
          <select className="input" value={form.bankaId} onChange={(e) => setForm({ ...form, bankaId: e.target.value })}>
            <option value="">Seçiniz</option>
            {posBanks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.hesapAdi}
              </option>
            ))}
          </select>
        </FormRow>
        <FormRow label="POS Adı" required>
          <input className="input" value={form.posAdi} onChange={(e) => setForm({ ...form, posAdi: e.target.value })} />
        </FormRow>
        <FormRow label="Komisyon Oranı" required>
          <input
            className="input"
            type="number"
            step="0.001"
            value={form.komisyonOrani}
            onChange={(e) => setForm({ ...form, komisyonOrani: Number(e.target.value) })}
          />
        </FormRow>
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={save}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerTab({ customers, setCustomers, onDirty }: { customers: Customer[]; setCustomers: (c: Customer[]) => void; onDirty: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ kod: string; ad: string; aktifMi: boolean }>({ kod: '', ad: '', aktifMi: true });

  useEffect(() => {
    if (editingId) {
      const cust = customers.find((c) => c.id === editingId);
      if (cust) setForm({ kod: cust.kod, ad: cust.ad, aktifMi: cust.aktifMi });
    } else {
      setForm({ kod: nextCode(customers, 'MUST'), ad: '', aktifMi: true });
    }
  }, [editingId, customers]);

  const save = () => {
    if (!form.ad) return;
    if (editingId) {
      setCustomers(customers.map((c) => (c.id === editingId ? { ...c, ad: form.ad, aktifMi: form.aktifMi } : c)));
    } else {
      setCustomers([...customers, { id: generateId(), kod: form.kod, ad: form.ad, aktifMi: form.aktifMi }]);
    }
    setEditingId(null);
    onDirty();
  };

  const remove = (id: string) => setCustomers(customers.filter((c) => c.id !== id));

  const downloadCsv = () => {
    const lines = [
      ['kod', 'ad', 'aktifMi'].join(CSV_DELIMITER),
      ...customers.map((c) => [c.kod, c.ad, c.aktifMi ? 'true' : 'false'].join(CSV_DELIMITER)),
    ];
    const bom = '\uFEFF';
    const csvContent = bom + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const uploadCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawText = (reader.result as string) || '';
      const cleanText = rawText.replace(/^\uFEFF/, '');
      const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (!lines.length) return;

      const header = lines[0].split(/[;,]/).map((h) => h.trim().toLowerCase());
      if (header.length < 3 || header[0] !== 'kod' || header[1] !== 'ad' || header[2] !== 'aktifmi') {
        alert('Geçersiz CSV formatı. Başlıklar kod,ad,aktifMi olmalıdır.');
        return;
      }

      const parsed: Customer[] = [];
      const getNext = () => nextCode([...customers, ...parsed], 'MUST');

      lines.slice(1).forEach((line) => {
        const cols = line.split(/[;,]/);
        const kodRaw = cols[0]?.trim() ?? '';
        const adRaw = cols[1]?.trim() ?? '';
        const aktifMiRaw = cols[2]?.trim() ?? '';

        if (!kodRaw && !adRaw) return;
        if (!adRaw) return;

        const raw = aktifMiRaw.toLowerCase();
        let aktifMi: boolean;
        if (raw === 'false' || raw === '0' || raw === 'hayır' || raw === 'hayir') {
          aktifMi = false;
        } else if (raw === 'true' || raw === '1' || raw === 'evet') {
          aktifMi = true;
        } else {
          aktifMi = true;
        }

        const kod = kodRaw || getNext();
        parsed.push({ id: generateId(), kod, ad: adRaw, aktifMi });
      });

      setCustomers(parsed);
      onDirty();
    };
    reader.readAsText(file, 'UTF-8');
  };

  const triggerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) uploadCsv(target.files[0]);
    };
    input.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="max-h-96 overflow-auto">
        <div className="flex justify-between mb-2 text-sm">
          <button className="text-indigo-600" onClick={downloadCsv}>
            CSV Şablonu İndir
          </button>
          <button className="text-indigo-600" onClick={triggerUpload}>
            CSV Yükle
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-2 py-1">Kod</th>
              <th className="text-left px-2 py-1">Ad</th>
              <th className="text-left px-2 py-1">Aktif</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setEditingId(c.id)}>
                <td className="px-2 py-1">{c.kod}</td>
                <td className="px-2 py-1">{c.ad}</td>
                <td className="px-2 py-1">{c.aktifMi ? 'Evet' : 'Hayır'}</td>
                <td className="px-2 py-1 text-right">
                  <button className="text-rose-600" onClick={() => remove(c.id)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="font-semibold">{editingId ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</div>
          <button className="text-sm text-indigo-600" onClick={() => setEditingId(null)}>
            Yeni
          </button>
        </div>
        <FormRow label="Kod">
          <input className="input" value={form.kod} readOnly />
        </FormRow>
        <FormRow label="Ad" required>
          <input className="input" value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} />
        </FormRow>
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={save}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function SupplierTab({ suppliers, setSuppliers, onDirty }: { suppliers: Supplier[]; setSuppliers: (s: Supplier[]) => void; onDirty: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ kod: string; ad: string; aktifMi: boolean }>({ kod: '', ad: '', aktifMi: true });

  useEffect(() => {
    if (editingId) {
      const sup = suppliers.find((s) => s.id === editingId);
      if (sup) setForm({ kod: sup.kod, ad: sup.ad, aktifMi: sup.aktifMi });
    } else {
      setForm({ kod: nextCode(suppliers, 'TDRK'), ad: '', aktifMi: true });
    }
  }, [editingId, suppliers]);

  const save = () => {
    if (!form.ad) return;
    if (editingId) {
      setSuppliers(suppliers.map((s) => (s.id === editingId ? { ...s, ad: form.ad, aktifMi: form.aktifMi } : s)));
    } else {
      setSuppliers([...suppliers, { id: generateId(), kod: form.kod, ad: form.ad, aktifMi: form.aktifMi }]);
    }
    setEditingId(null);
    onDirty();
  };

  const remove = (id: string) => setSuppliers(suppliers.filter((s) => s.id !== id));

  const downloadCsv = () => {
    const lines = [
      ['kod', 'ad', 'aktifMi'].join(CSV_DELIMITER),
      ...suppliers.map((s) => [s.kod, s.ad, s.aktifMi ? 'true' : 'false'].join(CSV_DELIMITER)),
    ];
    const bom = '\uFEFF';
    const csvContent = bom + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'suppliers-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const uploadCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawText = (reader.result as string) || '';
      const cleanText = rawText.replace(/^\uFEFF/, '');
      const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (!lines.length) return;
      const header = lines[0].split(/[;,]/).map((h) => h.trim().toLowerCase());
      if (header.length < 3 || header[0] !== 'kod' || header[1] !== 'ad' || header[2] !== 'aktifmi') {
        alert('Geçersiz CSV formatı. Başlıklar kod,ad,aktifMi olmalıdır.');
        return;
      }

      const parsed: Supplier[] = [];
      const getNext = () => nextCode([...suppliers, ...parsed], 'TDRK');

      lines.slice(1).forEach((line) => {
        const cols = line.split(/[;,]/);
        const kodRaw = cols[0]?.trim() ?? '';
        const adRaw = cols[1]?.trim() ?? '';
        const aktifMiRaw = cols[2]?.trim() ?? '';

        if (!kodRaw && !adRaw) return;
        if (!adRaw) return;

        const raw = aktifMiRaw.toLowerCase();
        let aktifMi: boolean;
        if (raw === 'false' || raw === '0' || raw === 'hayır' || raw === 'hayir') {
          aktifMi = false;
        } else if (raw === 'true' || raw === '1' || raw === 'evet') {
          aktifMi = true;
        } else {
          aktifMi = true;
        }

        const kod = kodRaw || getNext();
        parsed.push({ id: generateId(), kod, ad: adRaw, aktifMi });
      });

      setSuppliers(parsed);
      onDirty();
    };
    reader.readAsText(file, 'UTF-8');
  };

  const triggerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) uploadCsv(target.files[0]);
    };
    input.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="max-h-96 overflow-auto">
        <div className="flex justify-between mb-2 text-sm">
          <button className="text-indigo-600" onClick={downloadCsv}>
            CSV Şablonu İndir
          </button>
          <button className="text-indigo-600" onClick={triggerUpload}>
            CSV Yükle
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-2 py-1">Kod</th>
              <th className="text-left px-2 py-1">Ad</th>
              <th className="text-left px-2 py-1">Aktif</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setEditingId(s.id)}>
                <td className="px-2 py-1">{s.kod}</td>
                <td className="px-2 py-1">{s.ad}</td>
                <td className="px-2 py-1">{s.aktifMi ? 'Evet' : 'Hayır'}</td>
                <td className="px-2 py-1 text-right">
                  <button className="text-rose-600" onClick={() => remove(s.id)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="font-semibold">{editingId ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}</div>
          <button className="text-sm text-indigo-600" onClick={() => setEditingId(null)}>
            Yeni
          </button>
        </div>
        <FormRow label="Kod">
          <input className="input" value={form.kod} readOnly />
        </FormRow>
        <FormRow label="Ad" required>
          <input className="input" value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} />
        </FormRow>
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={save}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function CardTab({ banks, creditCards, setCreditCards, onDirty }: { banks: BankMaster[]; creditCards: CreditCard[]; setCreditCards: (c: CreditCard[]) => void; onDirty: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreditCard>({
    id: '',
    kartAdi: '',
    bankaId: '',
    kartLimit: 0,
    limit: 0,
    kullanilabilirLimit: 0,
    asgariOran: 0.4,
    hesapKesimGunu: 1,
    sonOdemeGunu: 1,
    maskeliKartNo: '',
    aktifMi: true,
    sonEkstreBorcu: 0,
    guncelBorc: 0,
  });

  useEffect(() => {
    if (editingId) {
      const card = creditCards.find((c) => c.id === editingId);
      if (card)
        setForm({
          ...card,
          kartLimit: card.kartLimit ?? card.limit ?? 0,
          limit: card.limit ?? card.kartLimit ?? 0,
          kullanilabilirLimit:
            card.kullanilabilirLimit ?? (card.limit ?? card.kartLimit ?? 0) - (card.guncelBorc || 0),
        });
    } else {
      setForm({
        id: '',
        kartAdi: '',
        bankaId: '',
        kartLimit: 0,
        limit: 0,
        kullanilabilirLimit: 0,
        asgariOran: 0.4,
        hesapKesimGunu: 1,
        sonOdemeGunu: 1,
        maskeliKartNo: '',
        aktifMi: true,
        sonEkstreBorcu: 0,
        guncelBorc: 0,
      });
    }
  }, [editingId, creditCards]);

  const save = async () => {
    if (!form.kartAdi || !form.bankaId) return;
    
    try {
      // Get limit from form - use limit if set, otherwise kartLimit
      // Send the actual value if it's > 0, otherwise send null (no limit set)
      // Note: A limit of 0 doesn't make sense for credit cards, so we treat 0 as "no limit"
      const limitValue = form.limit ?? form.kartLimit ?? null;
      const limitToSend = limitValue !== null && limitValue !== undefined && limitValue > 0 ? limitValue : null;
      
      if (editingId) {
        // Update existing card - save to backend first
        const backendCard = await apiPut<{
          id: string;
          name: string;
          bankId: string | null;
          limit: number | null;
          closingDay: number | null;
          dueDay: number | null;
          isActive: boolean;
          currentDebt: number;
          availableLimit: number | null;
        }>(`/api/credit-cards/${editingId}`, {
          name: form.kartAdi,
          bankId: form.bankaId || null,
          limit: limitToSend,
          closingDay: form.hesapKesimGunu || null,
          dueDay: form.sonOdemeGunu || null,
          isActive: form.aktifMi,
        });
        
        // Find existing card to preserve some frontend-only fields
        const existingCard = creditCards.find((c) => c.id === editingId);
        
        // Update local state with backend response
        setCreditCards(creditCards.map((c) => 
          c.id === editingId ? {
            id: backendCard.id,
            bankaId: backendCard.bankId || '',
            kartAdi: backendCard.name,
            kartLimit: backendCard.limit, // Preserve null if not set
            limit: backendCard.limit, // Preserve null if not set
            kullanilabilirLimit: backendCard.availableLimit, // Preserve null if limit is not set
            asgariOran: existingCard?.asgariOran ?? 0.4,
            hesapKesimGunu: backendCard.closingDay || 1,
            sonOdemeGunu: backendCard.dueDay || 1,
            maskeliKartNo: existingCard?.maskeliKartNo ?? '',
            aktifMi: backendCard.isActive,
            sonEkstreBorcu: existingCard?.sonEkstreBorcu ?? 0,
            guncelBorc: backendCard.currentDebt,
          } : c
        ));
      } else {
        // Create new card - save to backend first to get real CreditCard.id
        const backendCard = await apiPost<{
          id: string;
          name: string;
          bankId: string | null;
          limit: number | null;
          closingDay: number | null;
          dueDay: number | null;
          isActive: boolean;
          currentDebt: number;
          availableLimit: number | null;
        }>('/api/credit-cards', {
          name: form.kartAdi,
          bankId: form.bankaId || null,
          limit: limitToSend,
          closingDay: form.hesapKesimGunu || null,
          dueDay: form.sonOdemeGunu || null,
          isActive: form.aktifMi,
        });
        
        // Add to local state using the real CreditCard.id from backend
        setCreditCards([...creditCards, {
          id: backendCard.id, // Use real CreditCard.id from backend, NOT generateId()
          bankaId: backendCard.bankId || '',
          kartAdi: backendCard.name,
          kartLimit: backendCard.limit ?? 0,
          limit: backendCard.limit ?? 0,
          kullanilabilirLimit: backendCard.availableLimit ?? (backendCard.limit !== null ? backendCard.limit - backendCard.currentDebt : 0),
          asgariOran: form.asgariOran ?? 0.4,
          hesapKesimGunu: backendCard.closingDay || 1,
          sonOdemeGunu: backendCard.dueDay || 1,
          maskeliKartNo: form.maskeliKartNo || '',
          aktifMi: backendCard.isActive,
          sonEkstreBorcu: form.sonEkstreBorcu || 0,
          guncelBorc: backendCard.currentDebt,
        }]);
      }
      setEditingId(null);
      onDirty();
    } catch (error: any) {
      alert(`Kredi kartı kaydedilemedi: ${error.message || 'Bilinmeyen hata'}`);
      console.error('Failed to save credit card:', error);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Bu kredi kartını silmek istediğinizden emin misiniz?')) return;
    
    try {
      // Delete from backend first (soft delete via update)
      await apiPut(`/api/credit-cards/${id}`, { isActive: false });
      // Then remove from local state
      setCreditCards(creditCards.filter((c) => c.id !== id));
      onDirty();
    } catch (error: any) {
      alert(`Kredi kartı silinemedi: ${error.message || 'Bilinmeyen hata'}`);
      console.error('Failed to delete credit card:', error);
    }
  };

  const cardBanks = banks.filter((b) => b.krediKartiVarMi || b.id === form.bankaId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-2 py-1">Kart</th>
              <th className="text-left px-2 py-1">Banka</th>
              <th className="text-left px-2 py-1">Limit</th>
              <th className="text-left px-2 py-1">Güncel Borç</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {creditCards.map((c) => (
              <tr key={c.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setEditingId(c.id)}>
                <td className="px-2 py-1">{c.kartAdi}</td>
                <td className="px-2 py-1">{banks.find((b) => b.id === c.bankaId)?.bankaAdi || '-'}</td>
                <td className="px-2 py-1 text-right">{c.kartLimit !== null ? c.kartLimit.toFixed(2) : '-'}</td>
                <td className="px-2 py-1 text-right">{c.guncelBorc.toFixed(2)}</td>
                <td className="px-2 py-1 text-right">
                  <button className="text-rose-600" onClick={() => remove(c.id)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="font-semibold">{editingId ? 'Kart Düzenle' : 'Yeni Kart'}</div>
          <button className="text-sm text-indigo-600" onClick={() => setEditingId(null)}>
            Yeni
          </button>
        </div>
        <FormRow label="Kart Adı" required>
          <input className="input" value={form.kartAdi} onChange={(e) => setForm({ ...form, kartAdi: e.target.value })} />
        </FormRow>
        <FormRow label="Banka" required>
          <select className="input" value={form.bankaId} onChange={(e) => setForm({ ...form, bankaId: e.target.value })}>
            <option value="">Seçiniz</option>
            {cardBanks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.hesapAdi}
              </option>
            ))}
          </select>
        </FormRow>
        <FormRow label="Kart Limit" required>
          <MoneyInput className="input" value={form.kartLimit} onChange={(val) => setForm({ ...form, kartLimit: val || 0 })} />
        </FormRow>
        <FormRow label="Güncel Borç" required>
          <MoneyInput className="input" value={form.guncelBorc} onChange={(val) => setForm({ ...form, guncelBorc: val || 0 })} />
        </FormRow>
        <FormRow label="Asgari Oran">
          <input
            className="input"
            type="number"
            step="0.01"
            value={form.asgariOran}
            onChange={(e) => setForm({ ...form, asgariOran: Number(e.target.value) })}
          />
        </FormRow>
        <FormRow label="Hesap Kesim Günü">
          <input
            className="input"
            type="number"
            min={1}
            max={31}
            value={form.hesapKesimGunu}
            onChange={(e) => setForm({ ...form, hesapKesimGunu: Number(e.target.value) })}
          />
        </FormRow>
        <FormRow label="Son Ödeme Günü">
          <input
            className="input"
            type="number"
            min={1}
            max={31}
            value={form.sonOdemeGunu}
            onChange={(e) => setForm({ ...form, sonOdemeGunu: Number(e.target.value) })}
          />
        </FormRow>
        <FormRow label="Maskeli Kart No">
          <input className="input" value={form.maskeliKartNo} onChange={(e) => setForm({ ...form, maskeliKartNo: e.target.value })} />
        </FormRow>
        <FormRow label="Son Ekstre Borcu">
          <MoneyInput className="input" value={form.sonEkstreBorcu} onChange={(val) => setForm({ ...form, sonEkstreBorcu: val || 0 })} />
        </FormRow>
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={save}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function LoanTab({ banks, loans, setLoans, onDirty }: { banks: BankMaster[]; loans: Loan[]; setLoans: (l: Loan[]) => void; onDirty: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Loan>({
    id: '',
    krediAdi: '',
    bankaId: '',
    toplamKrediTutari: 0,
    vadeSayisi: 1,
    ilkTaksitTarihi: '',
    faizOraniYillik: 0.3,
    bsmvOrani: 0.05,
    aktifMi: true,
  });

  useEffect(() => {
    if (editingId) {
      const loan = loans.find((l) => l.id === editingId);
      if (loan) setForm(loan);
    } else {
      setForm({
        id: '',
        krediAdi: '',
        bankaId: '',
        toplamKrediTutari: 0,
        vadeSayisi: 1,
        ilkTaksitTarihi: '',
        faizOraniYillik: 0.3,
        bsmvOrani: 0.05,
        aktifMi: true,
      });
    }
  }, [editingId, loans]);

  const save = () => {
    if (!form.krediAdi || !form.bankaId || !form.ilkTaksitTarihi) return;
    if (editingId) {
      setLoans(loans.map((l) => (l.id === editingId ? { ...form, id: editingId } : l)));
    } else {
      setLoans([...loans, { ...form, id: generateId() }]);
    }
    setEditingId(null);
    onDirty();
  };

  const remove = (id: string) => setLoans(loans.filter((l) => l.id !== id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-2 py-1">Kredi</th>
              <th className="text-left px-2 py-1">Banka</th>
              <th className="text-left px-2 py-1">Tutar</th>
              <th className="text-left px-2 py-1">Vade</th>
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setEditingId(l.id)}>
                <td className="px-2 py-1">{l.krediAdi}</td>
                <td className="px-2 py-1">{banks.find((b) => b.id === l.bankaId)?.bankaAdi || '-'}</td>
                <td className="px-2 py-1 text-right">{l.toplamKrediTutari.toFixed(2)}</td>
                <td className="px-2 py-1">{l.vadeSayisi}</td>
                <td className="px-2 py-1 text-right">
                  <button className="text-rose-600" onClick={() => remove(l.id)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="font-semibold">{editingId ? 'Kredi Düzenle' : 'Yeni Kredi'}</div>
          <button className="text-sm text-indigo-600" onClick={() => setEditingId(null)}>
            Yeni
          </button>
        </div>
        <FormRow label="Kredi Adı" required>
          <input className="input" value={form.krediAdi} onChange={(e) => setForm({ ...form, krediAdi: e.target.value })} />
        </FormRow>
        <FormRow label="Banka" required>
          <select className="input" value={form.bankaId} onChange={(e) => setForm({ ...form, bankaId: e.target.value })}>
            <option value="">Seçiniz</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.hesapAdi}
              </option>
            ))}
          </select>
        </FormRow>
        <FormRow label="Toplam Kredi Tutarı" required>
          <MoneyInput className="input" value={form.toplamKrediTutari} onChange={(val) => setForm({ ...form, toplamKrediTutari: val || 0 })} />
        </FormRow>
        <FormRow label="Vade Sayısı" required>
          <input
            className="input"
            type="number"
            min={1}
            value={form.vadeSayisi}
            onChange={(e) => setForm({ ...form, vadeSayisi: Number(e.target.value) })}
          />
        </FormRow>
        <FormRow label="İlk Taksit Tarihi" required>
          <DateInput value={form.ilkTaksitTarihi} onChange={(val) => setForm({ ...form, ilkTaksitTarihi: val })} />
        </FormRow>
        <FormRow label="Yıllık Faiz Oranı">
          <input
            className="input"
            type="number"
            step="0.001"
            value={form.faizOraniYillik}
            onChange={(e) => setForm({ ...form, faizOraniYillik: Number(e.target.value) })}
          />
        </FormRow>
        <FormRow label="BSMV Oranı">
          <input
            className="input"
            type="number"
            step="0.001"
            value={form.bsmvOrani}
            onChange={(e) => setForm({ ...form, bsmvOrani: Number(e.target.value) })}
          />
        </FormRow>
        <label className="inline-flex items-center space-x-2 text-sm">
          <input type="checkbox" checked={form.aktifMi} onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })} />
          <span>Aktif</span>
        </label>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={save}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function GlobalTab({ form, setForm, onSave }: { form: GlobalSettings; setForm: (f: GlobalSettings) => void; onSave: () => void }) {
  return (
    <div className="space-y-4">
      <FormRow label="Varsayılan Asgari Ödeme Oranı">
        <input
          className="input"
          type="number"
          step="0.01"
          value={form.varsayilanAsgariOdemeOrani}
          onChange={(e) => setForm({ ...form, varsayilanAsgariOdemeOrani: Number(e.target.value) })}
        />
      </FormRow>
      <FormRow label="Varsayılan BSMV Oranı">
        <input
          className="input"
          type="number"
          step="0.01"
          value={form.varsayilanBsmvOrani}
          onChange={(e) => setForm({ ...form, varsayilanBsmvOrani: Number(e.target.value) })}
        />
      </FormRow>
      <FormRow label="Yaklaşan Ödeme Gün Sayısı">
        <input
          className="input"
          type="number"
          min={0}
          value={form.yaklasanOdemeGun}
          onChange={(e) => setForm({ ...form, yaklasanOdemeGun: Number(e.target.value) })}
        />
      </FormRow>
      <div className="flex justify-end">
        <button className="btn-primary" onClick={onSave}>
          Kaydet
        </button>
      </div>
    </div>
  );
}
