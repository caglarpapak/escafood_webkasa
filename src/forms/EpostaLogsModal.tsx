import { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EpostaLogsModal({ isOpen, onClose }: Props) {
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
      <div className="modal max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">E-posta Logs</div>
          <button onClick={handleClose}>✕</button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span>25.11.2025</span>
            <span className="text-slate-500">Ekstre Gönderimi</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>18.11.2025</span>
            <span className="text-slate-500">Tahsilat Hatırlatması</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>10.11.2025</span>
            <span className="text-slate-500">Kullanıcı Daveti</span>
          </div>
        </div>
      </div>
    </div>
  );
}
