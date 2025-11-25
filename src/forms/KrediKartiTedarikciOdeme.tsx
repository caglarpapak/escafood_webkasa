import { useEffect, useState } from 'react';
import { CreditCard } from '../models/card';
import { Supplier } from '../models/supplier';
import { parseTl } from '../utils/money';
import { todayIso } from '../utils/date';

export interface KrediKartiTedarikciOdemeFormValues {
  islemTarihiIso: string;
  cardId: string;
  supplierId?: string;
  muhatap?: string;
  aciklama?: string;
  tutar: number;
  kaydedenKullanici: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (values: KrediKartiTedarikciOdemeFormValues) => void;
  currentUserEmail: string;
  creditCards: CreditCard[];
  suppliers: Supplier[];
}

export default function KrediKartiTedarikciOdeme({ isOpen, onClose, onSaved, currentUserEmail, creditCards, suppliers }: Props) {
  const [islemTarihiIso, setIslemTarihiIso] = useState(todayIso());
  const [cardId, setCardId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [muhatap, setMuhatap] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [tutarText, setTutarText] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIslemTarihiIso(todayIso());
      setCardId('');
      setSupplierId('');
      setMuhatap('');
      setAciklama('');
      setTutarText('');
      setDirty(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleSave = () => {
    const tutar = parseTl(tutarText || '0') || 0;
    if (!islemTarihiIso || !cardId || tutar <= 0) return;
    if (!window.confirm('Bu işlemi kaydetmek istediğinize emin misiniz?')) return;
    onSaved({
      islemTarihiIso,
      cardId,
      supplierId: supplierId || undefined,
      muhatap: muhatap || undefined,
      aciklama: aciklama || undefined,
      tutar,
      kaydedenKullanici: currentUserEmail,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Kredi Kartı Tedarikçi Ödemesi</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label>İşlem Tarihi</label>
            <input type="date" value={islemTarihiIso} onChange={(e) => { setIslemTarihiIso(e.target.value); setDirty(true); }} />
          </div>
          <div className="space-y-2">
            <label>Kredi Kartı</label>
            <select value={cardId} onChange={(e) => { setCardId(e.target.value); setDirty(true); }}>
              <option value="">Seçiniz</option>
              {creditCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.kartAdi}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label>Tedarikçi</label>
            <select value={supplierId} onChange={(e) => { setSupplierId(e.target.value); setDirty(true); }}>
              <option value="">Seçiniz</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ad}
                </option>
              ))}
            </select>
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
            <label>Tutar</label>
            <input value={tutarText} onChange={(e) => { setTutarText(e.target.value); setDirty(true); }} placeholder="0,00" />
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
