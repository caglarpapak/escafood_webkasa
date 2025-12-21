import { DailyTransaction } from '../models/transaction';

/**
 * Resolve display amounts for GİRİŞ/ÇIKIŞ columns
 * 
 * UI GÖSTERİM KURALI (GÜN İÇİ / KASA DEFTERİ) - 2.1 Tutar resolver (TEK KURAL)
 * 
 * if (tx.source === 'BANKA') {
 *   giris = tx.bankDelta > 0 ? tx.bankDelta : null
 *   cikis = tx.bankDelta < 0 ? abs(tx.bankDelta) : null
 * } else {
 *   giris = tx.incoming > 0 ? tx.incoming : null
 *   cikis = tx.outgoing > 0 ? tx.outgoing : null
 * }
 * 
 * BANKA satırında (-) tutar mutlaka görünür (cikis olarak)
 * Kredi kartı ekstre ödeme gibi legacy outgoing kullanan satırlar bozulmayacak
 * 
 * @param tx Transaction to resolve display amounts for
 * @returns Object with giris and cikis amounts (null if not applicable)
 */
export function resolveDisplayAmounts(tx: DailyTransaction): {
  giris: number | null;
  cikis: number | null;
} {
  if (tx.source === 'BANKA') {
    // BANKA source: SADECE bankDelta kullanılır
    // BANKA satırında (-) tutar mutlaka görünür (cikis olarak)
    const bankDelta = tx.bankDelta ?? 0;
    return {
      giris: bankDelta > 0 ? bankDelta : null,
      cikis: bankDelta < 0 ? Math.abs(bankDelta) : null,
    };
  }

  // POS source: displayIncoming/displayOutgoing kullanılır (POS_TAHSILAT_BRUT ve POS_KOMISYONU için)
  // POS transaction'larında incoming=0, outgoing=0 olduğu için displayIncoming/displayOutgoing kullanılmalı
  if (tx.source === 'POS') {
    return {
      giris: (tx.displayIncoming ?? null) && tx.displayIncoming > 0 ? tx.displayIncoming : null,
      cikis: (tx.displayOutgoing ?? null) && tx.displayOutgoing > 0 ? tx.displayOutgoing : null,
    };
  }

  // KREDI_KARTI source: displayOutgoing kullanılır (KREDI_KARTI_HARCAMA için)
  // Kredi kartı transaction'larında incoming=0, outgoing=0 olduğu için displayOutgoing kullanılmalı
  if (tx.source === 'KREDI_KARTI') {
    return {
      giris: null, // Kredi kartı harcamaları giriş değildir
      cikis: (tx.displayOutgoing ?? null) && tx.displayOutgoing > 0 ? tx.displayOutgoing : null,
    };
  }

  // KASA source: incoming/outgoing kullanılır
  // Legacy: Kredi kartı ekstre ödeme gibi legacy outgoing kullanan satırlar için
  // outgoing kullanılır (source !== 'BANKA' && source !== 'POS' && source !== 'KREDI_KARTI' olduğu için buraya düşer)
  return {
    giris: tx.incoming > 0 ? tx.incoming : null,
    cikis: tx.outgoing > 0 ? tx.outgoing : null,
  };
}

