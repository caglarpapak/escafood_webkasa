export type DocumentPrefix = 'NKT-GRS' | 'NKT-CKS' | 'BNK-GRS' | 'BNK-CKS';

export function generateBelgeNo(prefix: DocumentPrefix, isoDate: string, seq: number): string {
  const [y, m, d] = isoDate.split('-');
  const gg = (d ?? '01').padStart(2, '0');
  const aa = (m ?? '01').padStart(2, '0');
  const s = String(seq).padStart(4, '0');
  return `${prefix}-${gg}/${aa}-${s}`;
}

export function getNextBelgeNo(prefix: DocumentPrefix, isoDate: string, existingDocs: { documentNo: string }[]): string {
  const [_, m, d] = isoDate.split('-');
  const gg = (d ?? '01').padStart(2, '0');
  const aa = (m ?? '01').padStart(2, '0');
  const base = `${prefix}-${gg}/${aa}-`;
  const maxSeq = existingDocs.reduce((max, tx) => {
    if (!tx.documentNo.startsWith(base)) return max;
    const suffix = tx.documentNo.slice(base.length);
    const n = parseInt(suffix, 10);
    return Number.isNaN(n) ? max : Math.max(max, n);
  }, 0);
  return generateBelgeNo(prefix, isoDate, maxSeq + 1);
}
