const weekdays = ['pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi'];

export function todayIso(): string {
  // TIMEZONE FIX: Use local date instead of UTC to avoid timezone issues
  // When it's 01:40 in Turkey (UTC+3), UTC is still 22:40 of previous day
  // This causes the system to show yesterday's date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`;
}

export function displayToIso(display: string): string {
  const parts = display.split('.');
  if (parts.length !== 3) return display;
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

export function getWeekdayTr(iso: string): string {
  // TIMEZONE FIX: Parse ISO date as local date to avoid timezone issues
  // "2025-12-22" should be treated as local date, not UTC
  const [y, m, d] = iso.split('-').map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return '';
  const date = new Date(y, m - 1, d); // Month is 0-indexed
  const day = date.getDay();
  return weekdays[day] || '';
}

export function diffInDays(fromIso: string, toIso: string): number {
  // TIMEZONE FIX: Parse ISO dates as local dates to avoid timezone issues
  const parseLocalDate = (iso: string): Date => {
    const [y, m, d] = iso.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return new Date(iso); // Fallback to default parsing
    return new Date(y, m - 1, d); // Month is 0-indexed
  };
  const from = parseLocalDate(fromIso);
  const to = parseLocalDate(toIso);
  const diff = to.getTime() - from.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map((part) => parseInt(part, 10));
  const baseYear = Number.isNaN(y) ? 1970 : y;
  const baseMonth = Number.isNaN(m) ? 0 : (m || 1) - 1;
  const day = Number.isNaN(d) ? 1 : d || 1;

  const totalMonths = baseMonth + months;
  const targetYear = baseYear + Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12;

  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, daysInTargetMonth);

  const targetDate = new Date(Date.UTC(targetYear, targetMonth, clampedDay));
  return targetDate.toISOString().slice(0, 10);
}
