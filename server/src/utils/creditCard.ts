import { getTodayTurkeyDate } from './timezone';

/**
 * İşlemin "son ekstre borcuna" dahil olup olmadığını hesaplar.
 * Kesim tarihinde/öncesi (txDate <= closing) → son ekstreye dahil.
 * Kesim tarihinden sonra (txDate > closing) → sonraki ekstreye gider.
 */
export function isTransactionInCurrentStatement(
  txDateIso: string,
  cutoffDay: number,
  dueDay: number,
  referenceDateIso?: string
): boolean {
  const ref = referenceDateIso || getTodayTurkeyDate();
  const closingIso = getStatementClosingDateForUpcomingPayment(ref, cutoffDay, dueDay);
  return txDateIso <= closingIso;
}

/** @deprecated use isTransactionInCurrentStatement */
export const isTransactionBeforeStatementCutoff = isTransactionInCurrentStatement;

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
    closingYear = dueYear;
    closingMonth = dueMonth;
  } else {
    closingMonth = dueMonth === 0 ? 11 : dueMonth - 1;
    closingYear = dueMonth === 0 ? dueYear - 1 : dueYear;
  }

  const closingDayClamped = Math.min(cutoffDay, daysInMonthUtc(closingYear, closingMonth));
  const closingDate = new Date(Date.UTC(closingYear, closingMonth, closingDayClamped));
  return closingDate.toISOString().slice(0, 10);
}
