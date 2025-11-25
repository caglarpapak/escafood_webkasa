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
