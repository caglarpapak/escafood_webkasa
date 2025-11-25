import { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function KullaniciAyarlarModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setDirty(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dirty && !window.confirm('Kaydedilmemiş bilgiler var. Kapatmak istiyor musunuz?')) return;
    onClose();
  };

  const handleInvite = () => {
    setDirty(false);
    alert(`Kullanıcı daveti gönderildi: ${email}`);
  };

  if (!isOpen) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Kullanıcı Ayarları</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="space-y-2">
            <label>Kullanıcı E-posta</label>
            <input value={email} onChange={(e) => { setEmail(e.target.value); setDirty(true); }} placeholder="user@example.com" />
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={handleInvite}>
            Davet Gönder
          </button>
          <button className="px-4 py-2 bg-slate-200 rounded" onClick={() => alert('Şifre sıfırlama linki gönderildi')}>
            Şifre Sıfırlama
          </button>
        </div>
      </div>
    </div>
  );
}
