import { useEffect, useState } from 'react';
import { Cheque, ChequeStatus } from '../models/cheque';
import { generateId } from '../utils/id';
import { todayIso } from '../utils/date';
import { parseTl } from '../utils/money';

export interface CekIslemPayload {
  updatedCheques: Cheque[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (payload: CekIslemPayload) => void;
  cheques: Cheque[];
}

export default function CekIslemleriModal({ isOpen, onClose, onSaved, cheques }: Props) {
  const [activeTab, setActiveTab] = useState<'GIRIS' | 'CIKIS' | 'YENI'>('GIRIS');
  const [cekNo, setCekNo] = useState('');
  const [bankaAdi, setBankaAdi] = useState('');
  const [duzenleyici, setDuzenleyici] = useState('');
  const [lehdar, setLehdar] = useState('');
  const [tutarText, setTutarText] = useState('');
  const [vadeTarihi, setVadeTarihi] = useState(todayIso());
  const [status, setStatus] = useState<ChequeStatus>('KASADA');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('GIRIS');
      setCekNo('');
      setBankaAdi('');
      setDuzenleyici('');
      setLehdar('');
      setTutarText('');
      setVadeTarihi(todayIso());
      setStatus('KASADA');
      setDirty(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    const tutar = parseTl(tutarText || '0') || 0;
    if (!cekNo || !bankaAdi || !duzenleyici || !lehdar || tutar <= 0) return;
    if (!window.confirm('Bu işlemi kaydetmek istediğinize emin misiniz?')) return;
    let newStatus: ChequeStatus = status;
    if (activeTab === 'GIRIS') newStatus = 'KASADA';
    if (activeTab === 'CIKIS') newStatus = 'BANKADA_TAHSILDE';
    if (activeTab === 'YENI') newStatus = 'ODEMEDE';
    const newCheque: Cheque = {
      id: generateId(),
      cekNo,
      bankaAdi,
      duzenleyici,
      lehdar,
      tutar,
      vadeTarihi,
      status: newStatus,
      kasaMi: newStatus === 'KASADA',
    };
    onSaved({ updatedCheques: [...cheques, newCheque] });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Çek İşlemleri</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="flex space-x-2 mb-4 text-sm">
          <button className={`px-3 py-2 rounded ${activeTab === 'GIRIS' ? 'bg-orange-600 text-white' : 'bg-slate-200'}`} onClick={() => setActiveTab('GIRIS')}>
            Kasaya Çek Girişi
          </button>
          <button className={`px-3 py-2 rounded ${activeTab === 'CIKIS' ? 'bg-orange-600 text-white' : 'bg-slate-200'}`} onClick={() => setActiveTab('CIKIS')}>
            Kasadan Çek Çıkışı
          </button>
          <button className={`px-3 py-2 rounded ${activeTab === 'YENI' ? 'bg-orange-600 text-white' : 'bg-slate-200'}`} onClick={() => setActiveTab('YENI')}>
            Yeni Düzenlenen Çek
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label>Çek No</label>
            <input value={cekNo} onChange={(e) => { setCekNo(e.target.value); setDirty(true); }} />
          </div>
          <div className="space-y-2">
            <label>Banka Adı</label>
            <input value={bankaAdi} onChange={(e) => { setBankaAdi(e.target.value); setDirty(true); }} />
          </div>
          <div className="space-y-2">
            <label>Düzenleyici</label>
            <input value={duzenleyici} onChange={(e) => { setDuzenleyici(e.target.value); setDirty(true); }} />
          </div>
          <div className="space-y-2">
            <label>Lehdar</label>
            <input value={lehdar} onChange={(e) => { setLehdar(e.target.value); setDirty(true); }} />
          </div>
          <div className="space-y-2">
            <label>Tutar</label>
            <input value={tutarText} onChange={(e) => { setTutarText(e.target.value); setDirty(true); }} placeholder="0,00" />
          </div>
          <div className="space-y-2">
            <label>Vade Tarihi</label>
            <input type="date" value={vadeTarihi} onChange={(e) => { setVadeTarihi(e.target.value); setDirty(true); }} />
          </div>
          <div className="space-y-2">
            <label>Durum</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value as ChequeStatus); setDirty(true); }}>
              <option value="KASADA">Kasada</option>
              <option value="BANKADA_TAHSILDE">Bankada Tahsilde</option>
              <option value="ODEMEDE">Ödemede</option>
              <option value="TAHSIL_OLDU">Tahsil Oldu</option>
              <option value="ODEME_YAPILDI">Ödeme Yapıldı</option>
              <option value="KARŞILIKSIZ">Karşılıksız</option>
              <option value="IPTAL">İptal</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button className="px-4 py-2 bg-slate-200 rounded-lg" onClick={handleClose}>
            İptal
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg" onClick={handleSave}>
            Kaydet
          </button>
        </div>
        <div className="mt-6">
          <div className="text-sm font-semibold mb-2">Kayıtlı Çekler</div>
          <div className="max-h-48 overflow-auto text-sm divide-y">
            {cheques.length === 0 && <div className="py-2 text-slate-500">Kayıtlı çek yok.</div>}
            {cheques.map((c) => (
              <div key={c.id} className="py-2 flex justify-between">
                <span>{c.cekNo} - {c.lehdar}</span>
                <span className="text-slate-500">{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
