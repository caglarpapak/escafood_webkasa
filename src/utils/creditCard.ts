import { CreditCard } from '../models/card';
import { diffInDays, isoToDisplay, todayIso } from './date';

export function getCreditCardNextDue(card: CreditCard) {
  const today = todayIso();
  const todayDate = new Date(`${today}T00:00:00Z`);
  const year = todayDate.getUTCFullYear();
  const month = todayDate.getUTCMonth();

  const dueThisMonth = new Date(Date.UTC(year, month, card.sonOdemeGunu));
  const dueDate =
    dueThisMonth >= todayDate
      ? dueThisMonth
      : new Date(Date.UTC(year, month + 1, card.sonOdemeGunu));

  const dueIso = dueDate.toISOString().slice(0, 10);

  return {
    dueIso,
    dueDisplay: isoToDisplay(dueIso),
    daysLeft: diffInDays(today, dueIso),
  };
}
