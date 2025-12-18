import { CreditCard } from '../models/card';
import { CreditCardApiResponse } from './api';
import { diffInDays, isoToDisplay, todayIso } from './date';

export function getCreditCardNextDue(card: CreditCard) {
  const today = todayIso();
  const todayDate = new Date(`${today}T00:00:00Z`);
  const year = todayDate.getUTCFullYear();
  const month = todayDate.getUTCMonth();

  const daysInMonthUtc = (y: number, m: number) =>
    new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

  const dayThisMonth = Math.min(card.sonOdemeGunu, daysInMonthUtc(year, month));
  const dueThisMonth = new Date(Date.UTC(year, month, dayThisMonth));

  const nextMonthIndex = month + 1;
  const nextMonthYear = year + Math.floor(nextMonthIndex / 12);
  const nextMonth = nextMonthIndex % 12;
  const dayNextMonth = Math.min(
    card.sonOdemeGunu,
    daysInMonthUtc(nextMonthYear, nextMonth)
  );
  const dueNextMonth = new Date(Date.UTC(nextMonthYear, nextMonth, dayNextMonth));

  const dueDate = dueThisMonth >= todayDate ? dueThisMonth : dueNextMonth;

  const dueIso = dueDate.toISOString().slice(0, 10);

  return {
    dueIso,
    dueDisplay: isoToDisplay(dueIso),
    daysLeft: diffInDays(today, dueIso),
  };
}

export function mapCreditCardApiToModel(api: CreditCardApiResponse): CreditCard {
  const limit = api.limit ?? 0;
  const manualDebt = api.manualGuncelBorc ?? 0;
  return {
    id: api.id,
    kartAdi: api.name,
    bankaId: api.bankId || '',
    kartLimit: limit,
    limit,
    kullanilabilirLimit: limit - manualDebt,
    asgariOran: 0.4,
    hesapKesimGunu: api.closingDay ?? 1,
    sonOdemeGunu: api.dueDay ?? 1,
    maskeliKartNo: '',
    aktifMi: api.isActive,
    sonEkstreBorcu: api.sonEkstreBorcu ?? 0,
    guncelBorc: manualDebt,
  };
}
