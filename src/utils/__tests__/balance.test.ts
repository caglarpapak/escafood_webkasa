/**
 * FINANCIAL INVARIANT: Test scenarios for balance calculations
 * 
 * These tests verify that the canonical transaction model is correctly implemented:
 * - KASA balance: Only source=KASA transactions affect cash balance
 * - Bank balance: Only bankDelta values affect bank balance
 * - Credit card transactions: Never affect KASA balance (balanceDelta = 0)
 */

import { DailyTransaction, DailyTransactionSource, DailyTransactionType } from '../../models/transaction';
import { computeRunningBalance, getBalanceDelta, BalanceContext } from '../balance';

describe('Financial Invariant: Balance Calculations', () => {
  const baseTx: Partial<DailyTransaction> = {
    id: 'test-id',
    isoDate: '2025-01-15',
    displayDate: '15.01.2025',
    documentNo: 'TEST-001',
    counterparty: 'Test',
    description: 'Test transaction',
    createdAtIso: '2025-01-15T10:00:00Z',
    createdBy: 'test@example.com',
  };

  describe('Test A: Credit card expense does not affect KASA balance', () => {
    it('should return 0 delta for credit card transaction in KASA context', () => {
      const tx: DailyTransaction = {
        ...baseTx,
        type: 'KREDI_KARTI_HARCAMA' as DailyTransactionType,
        source: 'KREDI_KARTI' as DailyTransactionSource,
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0,
        bankDelta: 0,
      } as DailyTransaction;

      const context: BalanceContext = { type: 'KASA' };
      const delta = getBalanceDelta(tx, context);

      expect(delta).toBe(0);
    });

    it('should maintain KASA balance when credit card transactions are present', () => {
      const transactions: DailyTransaction[] = [
        {
          ...baseTx,
          id: 'tx1',
          type: 'NAKIT_TAHSILAT' as DailyTransactionType,
          source: 'KASA' as DailyTransactionSource,
          incoming: 1000,
          outgoing: 0,
          balanceAfter: 1000,
        } as DailyTransaction,
        {
          ...baseTx,
          id: 'tx2',
          type: 'KREDI_KARTI_HARCAMA' as DailyTransactionType,
          source: 'KREDI_KARTI' as DailyTransactionSource,
          incoming: 0,
          outgoing: 500, // This should NOT affect KASA balance
          balanceAfter: 1000, // Should remain 1000
        } as DailyTransaction,
        {
          ...baseTx,
          id: 'tx3',
          type: 'NAKIT_ODEME' as DailyTransactionType,
          source: 'KASA' as DailyTransactionSource,
          incoming: 0,
          outgoing: 200,
          balanceAfter: 800,
        } as DailyTransaction,
      ];

      const context: BalanceContext = { type: 'KASA' };
      const balanceMap = computeRunningBalance(transactions, context, 0);

      expect(balanceMap.get('tx1')).toBe(1000);
      expect(balanceMap.get('tx2')).toBe(1000); // Credit card transaction doesn't change balance
      expect(balanceMap.get('tx3')).toBe(800);
    });
  });

  describe('Test B: Bank credit card payment affects BANKA balance, not KASA', () => {
    const bankId = 'bank-123';

    it('should decrease BANKA balance for credit card payment from bank', () => {
      const tx: DailyTransaction = {
        ...baseTx,
        type: 'KREDI_KARTI_EKSTRE_ODEME' as DailyTransactionType,
        source: 'BANKA' as DailyTransactionSource,
        incoming: 0,
        outgoing: 0,
        balanceAfter: 0, // Doesn't affect KASA
        bankId,
        bankDelta: -5000, // Decreases bank balance
      } as DailyTransaction;

      const kasaContext: BalanceContext = { type: 'KASA' };
      const bankContext: BalanceContext = { type: 'BANKA', bankId };

      expect(getBalanceDelta(tx, kasaContext)).toBe(0); // No effect on KASA
      expect(getBalanceDelta(tx, bankContext)).toBe(-5000); // Decreases bank balance
    });

    it('should maintain separate balances for KASA and BANKA contexts', () => {
      const transactions: DailyTransaction[] = [
        {
          ...baseTx,
          id: 'tx1',
          type: 'NAKIT_TAHSILAT' as DailyTransactionType,
          source: 'KASA' as DailyTransactionSource,
          incoming: 10000,
          outgoing: 0,
          balanceAfter: 10000,
        } as DailyTransaction,
        {
          ...baseTx,
          id: 'tx2',
          type: 'KREDI_KARTI_EKSTRE_ODEME' as DailyTransactionType,
          source: 'BANKA' as DailyTransactionSource,
          incoming: 0,
          outgoing: 0,
          balanceAfter: 10000, // KASA balance unchanged
          bankId,
          bankDelta: -5000, // Bank balance decreases
        } as DailyTransaction,
      ];

      const kasaContext: BalanceContext = { type: 'KASA' };
      const bankContext: BalanceContext = { type: 'BANKA', bankId };

      const kasaBalanceMap = computeRunningBalance(transactions, kasaContext, 0);
      const bankBalanceMap = computeRunningBalance(transactions, bankContext, 10000); // Starting bank balance

      expect(kasaBalanceMap.get('tx1')).toBe(10000);
      expect(kasaBalanceMap.get('tx2')).toBe(10000); // KASA unchanged
      expect(bankBalanceMap.get('tx1')).toBe(10000); // Bank unchanged by KASA transaction
      expect(bankBalanceMap.get('tx2')).toBe(5000); // Bank decreased by 5000
    });
  });

  describe('Test C: POS collection with commission calculates net correctly', () => {
    const bankId = 'bank-123';

    it('should calculate net bank balance correctly (brut - commission)', () => {
      const transactions: DailyTransaction[] = [
        {
          ...baseTx,
          id: 'tx1',
          type: 'POS_TAHSILAT_BRUT' as DailyTransactionType,
          source: 'POS' as DailyTransactionSource,
          incoming: 0,
          outgoing: 0,
          balanceAfter: 0, // Doesn't affect KASA
          bankId,
          bankDelta: 100000, // Gross amount added to bank
          displayIncoming: 100000,
        } as DailyTransaction,
        {
          ...baseTx,
          id: 'tx2',
          type: 'POS_KOMISYONU' as DailyTransactionType,
          source: 'POS' as DailyTransactionSource,
          incoming: 0,
          outgoing: 0,
          balanceAfter: 0, // Doesn't affect KASA
          bankId,
          bankDelta: -2000, // Commission deducted from bank
          displayOutgoing: 2000,
        } as DailyTransaction,
      ];

      const kasaContext: BalanceContext = { type: 'KASA' };
      const bankContext: BalanceContext = { type: 'BANKA', bankId };
      const totalBankContext: BalanceContext = { type: 'BANKA_TOPLAM' };

      const kasaBalanceMap = computeRunningBalance(transactions, kasaContext, 0);
      const bankBalanceMap = computeRunningBalance(transactions, bankContext, 0);
      const totalBankBalanceMap = computeRunningBalance(transactions, totalBankContext, 0);

      // KASA balance should remain 0 (POS transactions don't affect cash)
      expect(kasaBalanceMap.get('tx1')).toBe(0);
      expect(kasaBalanceMap.get('tx2')).toBe(0);

      // Bank balance should be net: 100000 - 2000 = 98000
      expect(bankBalanceMap.get('tx1')).toBe(100000);
      expect(bankBalanceMap.get('tx2')).toBe(98000);

      // Total bank balance should also be net
      expect(totalBankBalanceMap.get('tx1')).toBe(100000);
      expect(totalBankBalanceMap.get('tx2')).toBe(98000);
    });
  });
});

