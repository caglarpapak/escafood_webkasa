import { useMemo } from 'react';
import { CreditCard } from '../models/card';
import { BankMaster } from '../models/bank';
import { GlobalSettings } from '../models/settings';
import { formatTl } from '../utils/money';
import { getCreditCardNextDue } from '../utils/creditCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  creditCards: CreditCard[];
  banks: BankMaster[];
  globalSettings: GlobalSettings;
}

export default function KrediKartiIzlemeModal({ isOpen, onClose, creditCards, banks, globalSettings }: Props) {
  const rows = useMemo(() => {
    return creditCards
      .filter((card) => card.aktifMi)
      .map((card) => {
        const bank = banks.find((b) => b.id === card.bankaId);
        const { daysLeft, dueDisplay } = getCreditCardNextDue(card);
        // BUG 1 FIX: Use limit from card (from backend, correctly calculated)
        // card.limit is the primary field, kartLimit is fallback
        // Preserve null if limit is not set (don't convert to 0)
        // Test case: card with limit=250000 should show 250.000,00 TL
        const limit = card.limit !== null && card.limit !== undefined ? card.limit : (card.kartLimit ?? null);
        
        // BUG 1 FIX: Use guncelBorc from card (from backend currentDebt, calculated from operations)
        // Test case: card with currentDebt=25000 should show 25.000,00 TL
        // If guncelBorc is 0, it's a valid value (card has no debt), so use ?? instead of ||
        const guncelBorc = card.guncelBorc ?? 0;
        
        // BUG 1 FIX: Calculate available limit: limit - currentDebt (NOT currentDebt - limit)
        // If limit is null, availableLimit should also be null
        // Test case: limit=250000, currentDebt=25000 → available=225000
        const available = limit !== null ? limit - guncelBorc : null;
        return {
          card,
          bankName: bank?.bankaAdi || '-',
          daysLeft,
          dueDateDisplay: dueDisplay,
          limit,
          available,
        };
      });
  }, [banks, creditCards]);

  if (!isOpen) return null;

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
              {rows.map(({ card, bankName, daysLeft, dueDateDisplay, limit, available }) => {
                let color = 'text-slate-700';
                if (daysLeft < 0) color = 'text-rose-600 font-semibold';
                else if (daysLeft <= globalSettings.yaklasanOdemeGun) color = 'text-amber-600 font-semibold';
                return (
                  <tr key={card.id} className="border-b last:border-0">
                    <td className="py-2 px-2">{card.kartAdi}</td>
                    <td className="py-2 px-2">{bankName}</td>
                    <td className="py-2 px-2">{limit !== null ? formatTl(limit) : '-'}</td>
                    <td className="py-2 px-2">{formatTl(card.guncelBorc)}</td>
                    <td className="py-2 px-2">{available !== null ? formatTl(available) : '-'}</td>
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
