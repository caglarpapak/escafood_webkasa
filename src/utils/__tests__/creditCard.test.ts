/**
 * Kredi kartı hesap kesim mantığı testleri
 *
 * txDate <= kesim tarihi → son ekstreye dahil
 * txDate > kesim tarihi → sonraki ekstreye gider (son ekstre etkilenmez)
 */

import { describe, it, expect } from 'vitest';
import { isTransactionInCurrentStatement } from '../creditCard';

describe('isTransactionInCurrentStatement', () => {
  const ref = '2026-01-31'; // Referans: 31 Ocak

  it('Enpara cutoff=28, txDate=31.01 => son ekstre artmamalı (31 > 28 kesimden sonra)', () => {
    expect(isTransactionInCurrentStatement('2026-01-31', 28, 3, ref)).toBe(false);
  });

  it('World Card cutoff=2, txDate=31.01 => son ekstre artmalı (31.01 <= 02.02 kesimden önce)', () => {
    expect(isTransactionInCurrentStatement('2026-01-31', 2, 7, ref)).toBe(true);
  });

  it('cutoffDay=31, txDate=28.02 => kesim=28, 28<=28 dahil', () => {
    expect(isTransactionInCurrentStatement('2026-02-28', 31, 7, '2026-02-28')).toBe(true);
  });

  it('txDate kesim gününe eşit ise ekstreye dahil olmalı', () => {
    expect(isTransactionInCurrentStatement('2026-02-02', 2, 7, ref)).toBe(true);
  });

  it('txDate kesim gününden 1 gün sonra ise ekstreye dahil olmamalı', () => {
    expect(isTransactionInCurrentStatement('2026-02-03', 2, 7, ref)).toBe(false);
  });
});
