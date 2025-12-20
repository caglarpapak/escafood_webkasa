/**
 * FINANCIAL INVARIANT: Canonical Transaction Model
 * 
 * This module implements the single source of truth for balance calculations
 * across all transaction types and contexts (KASA, BANKA, BANKA_TOPLAM).
 * 
 * Rules:
 * - KASA balance: Only source=KASA transactions affect cash balance
 * - Bank balance: Only bankDelta values affect bank balance
 * - Credit card transactions: Never affect KASA balance (balanceDelta = 0)
 * - POS transactions: Affect bank balance via bankDelta (net = brut - commission)
 */

import { DailyTransaction, DailyTransactionSource, DailyTransactionType } from '../models/transaction';

export type BalanceContext = 
  | { type: 'KASA' }
  | { type: 'BANKA'; bankId: string }
  | { type: 'BANKA_TOPLAM' };

/**
 * Calculate the balance delta for a transaction in a given context
 * 
 * @param tx - Transaction to calculate delta for
 * @param context - Balance context (KASA, BANKA, or BANKA_TOPLAM)
 * @returns Balance delta (positive = increase, negative = decrease, 0 = no effect)
 */
export function getBalanceDelta(tx: DailyTransaction, context: BalanceContext): number {
  switch (context.type) {
    case 'KASA':
      // KASA balance: Only source=KASA transactions affect cash balance
      // Credit card transactions (source=KREDI_KARTI) never affect KASA balance
      if (tx.source === 'KASA') {
        return (tx.incoming || 0) - (tx.outgoing || 0);
      }
      // All other sources (BANKA, KREDI_KARTI, POS, CEK) have 0 delta for KASA
      return 0;

    case 'BANKA':
      // Bank balance: Only transactions with matching bankId affect this bank's balance
      if (tx.bankId === context.bankId && tx.bankDelta !== undefined && tx.bankDelta !== null) {
        return tx.bankDelta;
      }
      return 0;

    case 'BANKA_TOPLAM':
      // Total bank balance: Sum of all bankDelta values across all banks
      if (tx.bankDelta !== undefined && tx.bankDelta !== null) {
        return tx.bankDelta;
      }
      return 0;

    default:
      return 0;
  }
}

/**
 * Compute running balance for a list of transactions in a given context
 * 
 * @param transactions - List of transactions (should be sorted chronologically)
 * @param context - Balance context (KASA, BANKA, or BANKA_TOPLAM)
 * @param initialBalance - Starting balance (default: 0)
 * @returns Map of transaction ID to balance after that transaction
 */
export function computeRunningBalance(
  transactions: DailyTransaction[],
  context: BalanceContext,
  initialBalance: number = 0
): Map<string, number> {
  const balanceMap = new Map<string, number>();
  let runningBalance = initialBalance;

  for (const tx of transactions) {
    const delta = getBalanceDelta(tx, context);
    runningBalance += delta;
    balanceMap.set(tx.id, runningBalance);
  }

  return balanceMap;
}

/**
 * Get the balance after a specific transaction in a given context
 * 
 * @param transactions - List of transactions (should be sorted chronologically)
 * @param transactionId - ID of the transaction to get balance after
 * @param context - Balance context
 * @param initialBalance - Starting balance (default: 0)
 * @returns Balance after the specified transaction, or initialBalance if transaction not found
 */
export function getBalanceAfter(
  transactions: DailyTransaction[],
  transactionId: string,
  context: BalanceContext,
  initialBalance: number = 0
): number {
  const balanceMap = computeRunningBalance(transactions, context, initialBalance);
  return balanceMap.get(transactionId) ?? initialBalance;
}

/**
 * Check if a transaction affects a given balance context
 * 
 * @param tx - Transaction to check
 * @param context - Balance context
 * @returns true if transaction affects the balance in this context
 */
export function affectsBalance(tx: DailyTransaction, context: BalanceContext): boolean {
  return getBalanceDelta(tx, context) !== 0;
}

/**
 * Get the last balance from a list of transactions in a given context
 * 
 * @param transactions - List of transactions (should be sorted chronologically)
 * @param context - Balance context
 * @param initialBalance - Starting balance (default: 0)
 * @returns Last balance after all transactions
 */
export function getLastBalance(
  transactions: DailyTransaction[],
  context: BalanceContext,
  initialBalance: number = 0
): number {
  if (transactions.length === 0) {
    return initialBalance;
  }
  
  const balanceMap = computeRunningBalance(transactions, context, initialBalance);
  const lastTx = transactions[transactions.length - 1];
  return balanceMap.get(lastTx.id) ?? initialBalance;
}

