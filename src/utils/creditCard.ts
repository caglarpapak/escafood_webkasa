import { CreditCard } from '../models/card';
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
