const weekdays = ['pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi'];

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
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
  const date = new Date(iso);
  const day = date.getDay();
  return weekdays[day] || '';
}

export function diffInDays(fromIso: string, toIso: string): number {
  const from = new Date(fromIso);
  const to = new Date(toIso);
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
