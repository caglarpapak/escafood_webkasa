import { CreditCard } from '../models/card';
import { CreditCardApiResponse } from './api';
import { diffInDays, isoToDisplay, todayIso } from './date';

/**
 * İşlemin "son ekstre borcuna" dahil olup olmadığını hesaplar.
 *
 * KURAL:
 * - Güncel borç: her zaman +amount
 * - Son ekstre borcu: sadece txDate <= (yaklaşan ödemenin kesim tarihi) ise +amount
 *   Kesim tarihinde veya ÖNCE yapılan işlemler mevcut ekstreye dahil.
 *   Kesim tarihinden SONRA yapılan işlemler sonraki ekstreye gider.
 *
 * Örnekler:
 * - Enpara (cutoff=28): 31 Ocak işlemi → kesim 28 Ocak, 31>28 → son ekstre artmaz ✓
 * - World Card (cutoff=2): 31 Ocak işlemi → kesim 2 Şubat, 31.01<=02.02 → son ekstre artar ✓
 *
 * @param txDateIso İşlem tarihi (YYYY-MM-DD)
 * @param cutoffDay Hesap kesim günü (1-31)
 * @param dueDay Son ödeme günü (1-31)
 * @param referenceDateIso Referans (bugün), hangi yaklaşan ödemeden bahsettiğimiz
 */
export function isTransactionInCurrentStatement(
  txDateIso: string,
  cutoffDay: number,
  dueDay: number,
  referenceDateIso?: string
): boolean {
  const ref = referenceDateIso || todayIso();
  const closingIso = getStatementClosingDateForUpcomingPayment(ref, cutoffDay, dueDay);
  return txDateIso <= closingIso;
}

/** @deprecated use isTransactionInCurrentStatement */
export const isTransactionBeforeStatementCutoff = isTransactionInCurrentStatement;

/**
 * Yaklaşan ödemenin ekstre kesim tarihini döner (YYYY-MM-DD).
 * - cutoffDay < dueDay: kesim vade ayında (vade 7 Şubat, kesim 2 → 2 Şubat)
 * - cutoffDay >= dueDay: kesim önceki ayda (vade 7 Şubat, kesim 28 → 28 Ocak)
 */
function getStatementClosingDateForUpcomingPayment(
  referenceDateIso: string,
  cutoffDay: number,
  dueDay: number
): string {
  const ref = new Date(`${referenceDateIso}T00:00:00Z`);
  const year = ref.getUTCFullYear();
  const month = ref.getUTCMonth();

  const daysInMonthUtc = (y: number, m: number) =>
    new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

  const dayThisMonth = Math.min(dueDay, daysInMonthUtc(year, month));
  const dueThisMonth = new Date(Date.UTC(year, month, dayThisMonth));
  const nextMonthIndex = month + 1;
  const nextMonthYear = year + Math.floor(nextMonthIndex / 12);
  const nextMonth = nextMonthIndex % 12;
  const dayNextMonth = Math.min(dueDay, daysInMonthUtc(nextMonthYear, nextMonth));
  const dueNextMonth = new Date(Date.UTC(nextMonthYear, nextMonth, dayNextMonth));

  const dueDate = dueThisMonth >= ref ? dueThisMonth : dueNextMonth;
  const dueYear = dueDate.getUTCFullYear();
  const dueMonth = dueDate.getUTCMonth();

  let closingYear: number;
  let closingMonth: number;

  if (cutoffDay < dueDay) {
    // Kesim vade ayında (vade 7 Şubat, kesim 2 → 2 Şubat)
    closingYear = dueYear;
    closingMonth = dueMonth;
  } else {
    // Kesim önceki ayda (vade 7 Şubat, kesim 28 → 28 Ocak)
    closingMonth = dueMonth === 0 ? 11 : dueMonth - 1;
    closingYear = dueMonth === 0 ? dueYear - 1 : dueYear;
  }

  const closingDayClamped = Math.min(cutoffDay, daysInMonthUtc(closingYear, closingMonth));
  const closingDate = new Date(Date.UTC(closingYear, closingMonth, closingDayClamped));
  return closingDate.toISOString().slice(0, 10);
}

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
    bankaId: api.bankId || '',
    kartAdi: api.name,
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
