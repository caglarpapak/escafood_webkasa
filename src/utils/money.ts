const formatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatTl(v: number): string {
  return `${formatter.format(v)} TL`;
}

export function formatTlPlain(v: number): string {
  return formatter.format(v);
}

export function parseTl(input: string): number | null {
  const normalized = input
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  const value = Number(normalized);
  return Number.isNaN(value) ? null : value;
}
