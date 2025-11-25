import { useEffect, useMemo, useState } from 'react';
import { PosTerminal } from '../models/pos';
import { BankMaster } from '../models/bank';
import { parseTl } from '../utils/money';
import { todayIso } from '../utils/date';

export interface PosTahsilatFormValues {
  islemTarihiIso: string;
  posId: string;
  bankaId: string;
  brutTutar: number;
  komisyonOrani: number;
  komisyonTutar: number;
  netTutar: number;
  hesabaGecisTarihiIso: string;
  muhatap?: string;
  aciklama?: string;
  kaydedenKullanici: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: PosTahsilatFormValues) => void;
  currentUserEmail: string;
  posTerminals: PosTerminal[];
  banks: BankMaster[];
}

export default function PosTahsilat({ isOpen, onClose, onSaved, currentUserEmail, posTerminals, banks }: Props) {
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [posId, setPosId] = useState('');
  const [bankaId, setBankaId] = useState('');
  const [komisyonOrani, setKomisyonOrani] = useState(0.02);
  const [brutText, setBrutText] = useState('');
  const [hesabaGecisTarihiIso, setHesabaGecisTarihiIso] = useState(todayIso());
  const [muhatap, setMuhatap] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setPosId('');
      setBankaId('');
      setKomisyonOrani(0.02);
      setBrutText('');
      setHesabaGecisTarihiIso(todayIso());
      setMuhatap('');
      setAciklama('');
      setDirty(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const pos = posTerminals.find((p) => p.id === posId);
    if (pos) setKomisyonOrani(pos.komisyonOrani);
  }, [posId, posTerminals]);

  const brut = useMemo(() => parseTl(brutText || '0') || 0, [brutText]);
  const komisyonTutar = useMemo(() => brut * komisyonOrani, [brut, komisyonOrani]);
  const netTutar = useMemo(() => brut - komisyonTutar, [brut, komisyonTutar]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    if (!islemTarihiIso || !posId || !bankaId || brut <= 0) return;
    if (!window.confirm('Bu işlemi kaydetmek istediğinize emin misiniz?')) return;
    onSaved({
      islemTarihiIso,
      posId,
      bankaId,
      brutTutar: brut,
      komisyonOrani,
      komisyonTutar,
      netTutar,
      hesabaGecisTarihiIso,
      muhatap: muhatap || undefined,
      aciklama: aciklama || undefined,
      kaydedenKullanici: currentUserEmail,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">POS Tahsilat</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label>İşlem Tarihi</label>
            <input type="date" value={islemTarihiIso} onChange={(e) => { setIslemTarihiIso(e.target.value); setDirty(true); }} />
          </div>
          <div className="space-y-2">
            <label>POS</label>
            <select value={posId} onChange={(e) => { setPosId(e.target.value); setDirty(true); }}>
              <option value="">Seçiniz</option>
              {posTerminals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.posAdi}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label>Banka</label>
            <select value={bankaId} onChange={(e) => { setBankaId(e.target.value); setDirty(true); }}>
              <option value="">Seçiniz</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.hesapAdi}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label>Brüt Tutar</label>
            <input value={brutText} onChange={(e) => { setBrutText(e.target.value); setDirty(true); }} placeholder="0,00" />
          </div>
          <div className="space-y-2">
            <label>Komisyon Oranı</label>
            <input
              value={komisyonOrani}
              onChange={(e) => { setKomisyonOrani(Number(e.target.value)); setDirty(true); }}
              type="number"
              step="0.001"
            />
          </div>
          <div className="space-y-2">
            <label>Komisyon Tutarı</label>
            <input value={komisyonTutar.toFixed(2)} readOnly />
          </div>
          <div className="space-y-2">
            <label>Net Tutar</label>
            <input value={netTutar.toFixed(2)} readOnly />
          </div>
          <div className="space-y-2">
            <label>Hesaba Geçiş Tarihi</label>
            <input
              type="date"
              value={hesabaGecisTarihiIso}
              onChange={(e) => {
                setHesabaGecisTarihiIso(e.target.value);
                setDirty(true);
              }}
            />
          </div>
          <div className="space-y-2">
            <label>Muhatap</label>
            <input value={muhatap} onChange={(e) => { setMuhatap(e.target.value); setDirty(true); }} placeholder="Muhatap" />
          </div>
          <div className="space-y-2">
            <label>Açıklama</label>
            <input value={aciklama} onChange={(e) => { setAciklama(e.target.value); setDirty(true); }} placeholder="Açıklama" />
          </div>
          <div className="space-y-2">
            <label>Kayıt Eden</label>
            <input value={currentUserEmail} readOnly />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button className="px-4 py-2 bg-slate-200 rounded-lg" onClick={handleClose}>
            İptal
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg" onClick={handleSave}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
