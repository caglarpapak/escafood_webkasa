import { useMemo } from 'react';
import { CreditCard } from '../models/card';
import { BankMaster } from '../models/bank';
import { GlobalSettings } from '../models/settings';
import { formatTl } from '../utils/money';
import { diffInDays, todayIso, isoToDisplay } from '../utils/date';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  creditCards: CreditCard[];
  banks: BankMaster[];
  globalSettings: GlobalSettings;
}

export default function KrediKartiIzlemeModal({ isOpen, onClose, creditCards, banks, globalSettings }: Props) {
  if (!isOpen) return null;

  const rows = useMemo(() => {
    return creditCards.map((card) => {
      const bank = banks.find((b) => b.id === card.bankaId);
      const dueIso = todayIso();
      const daysLeft = diffInDays(todayIso(), dueIso);
      return { card, bankName: bank?.bankaAdi || '-', daysLeft, dueDateDisplay: isoToDisplay(dueIso) };
    });
  }, [creditCards, banks]);

  return (
    <div className="modal-backdrop">
      <div className="modal max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Kredi Kartı İzleme</div>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="py-2 px-2 text-left">Kart Adı</th>
                <th className="py-2 px-2 text-left">Banka</th>
                <th className="py-2 px-2 text-left">Limit</th>
                <th className="py-2 px-2 text-left">Güncel Borç</th>
                <th className="py-2 px-2 text-left">Kullanılabilir Limit</th>
                <th className="py-2 px-2 text-left">Son Ekstre Borcu</th>
                <th className="py-2 px-2 text-left">Hesap Kesim Günü</th>
                <th className="py-2 px-2 text-left">Son Ödeme Günü</th>
                <th className="py-2 px-2 text-left">Kalan Gün</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-3 text-center text-slate-500">
                    Kayıt yok.
                  </td>
                </tr>
              )}
              {rows.map(({ card, bankName, daysLeft, dueDateDisplay }) => {
                let color = 'text-slate-700';
                if (daysLeft < 0) color = 'text-rose-600 font-semibold';
                else if (daysLeft <= globalSettings.yaklasanOdemeGun) color = 'text-amber-600 font-semibold';
                const kullanilabilir = card.kartLimit - card.guncelBorc;
                return (
                  <tr key={card.id} className="border-b last:border-0">
                    <td className="py-2 px-2">{card.kartAdi}</td>
                    <td className="py-2 px-2">{bankName}</td>
                    <td className="py-2 px-2">{formatTl(card.kartLimit)}</td>
                    <td className="py-2 px-2">{formatTl(card.guncelBorc)}</td>
                    <td className="py-2 px-2">{formatTl(kullanilabilir)}</td>
                    <td className="py-2 px-2">{formatTl(card.sonEkstreBorcu)}</td>
                    <td className="py-2 px-2">{card.hesapKesimGunu}</td>
                    <td className="py-2 px-2">{card.sonOdemeGunu}</td>
                    <td className={`py-2 px-2 ${color}`}>{daysLeft} ({dueDateDisplay})</td>
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
