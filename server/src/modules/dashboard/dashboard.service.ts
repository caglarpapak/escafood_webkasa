import { prisma } from '../../config/prisma';
import { DailyTransactionSource, LoanInstallmentStatus } from '@prisma/client';
import { DashboardSummary, UpcomingPayment } from './dashboard.types';

export class DashboardService {
  /**
   * Get authoritative dashboard summary
   * 
   * Calculates:
   * - cashBalance: Sum of (incoming - outgoing) for all KASA transactions
   * - totalBankBalance: Sum of all bankDelta values across all banks
   * - bankBalances: Per-bank balance breakdown
   * - creditCardSummary: Optional credit card debt summary
   */
  async getSummary(): Promise<DashboardSummary> {
    // 1. Calculate cash balance (only KASA transactions)
    const cashTransactions = await prisma.transaction.aggregate({
      where: {
        deletedAt: null,
        source: DailyTransactionSource.KASA,
      },
      _sum: {
        incoming: true,
        outgoing: true,
      },
    });

    const cashBalance =
      (cashTransactions._sum.incoming?.toNumber() ?? 0) -
      (cashTransactions._sum.outgoing?.toNumber() ?? 0);

    // 2. Calculate bank balances (group by bankId)
    // DEBUG: Log POS transactions to verify bankDelta and bankId
    const posTransactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        type: { in: ['POS_TAHSILAT_BRUT', 'POS_KOMISYONU'] },
      },
      select: {
        id: true,
        type: true,
        bankId: true,
        bankDelta: true,
        isoDate: true,
        documentNo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Last 10 POS transactions
    });
    
    console.log('[POS DEBUG] Last 10 POS transactions from DB:', JSON.stringify(posTransactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      bankId: tx.bankId,
      bankDelta: tx.bankDelta?.toNumber(),
      isoDate: tx.isoDate,
      documentNo: tx.documentNo,
    })), null, 2));
    
    // CRITICAL FIX: Exclude opening balance transactions from bankDelta sum
    // Opening balance is stored in Bank.openingBalance, NOT in transactions
    const bankBalanceGroups = await prisma.transaction.groupBy({
      by: ['bankId'],
      where: {
        deletedAt: null,
        bankId: { not: null },
        // CRITICAL: Exclude opening transactions, but include null descriptions (normal transactions)
        OR: [
          { description: { not: 'Açılış bakiyesi' } },
          { description: null },
        ],
      },
      _sum: {
        bankDelta: true,
      },
    });
    
    // DEBUG: Log bank balance groups
    console.log('[POS DEBUG] Bank balance groups:', JSON.stringify(bankBalanceGroups.map(g => ({
      bankId: g.bankId,
      bankDeltaSum: g._sum.bankDelta?.toNumber(),
    })), null, 2));

    // 3. Get bank names for each bankId
    const bankIds = bankBalanceGroups
      .map((g) => g.bankId)
      .filter((id): id is string => id !== null);

    const banks = bankIds.length > 0
      ? await prisma.bank.findMany({
          where: {
            id: { in: bankIds },
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

    const bankMap = new Map(banks.map((b) => [b.id, b.name]));

    // 4. Build bankBalances array
    const bankBalances = bankBalanceGroups
      .filter((g) => g.bankId !== null)
      .map((g) => ({
        bankId: g.bankId!,
        bankName: bankMap.get(g.bankId!) || 'Bilinmeyen Banka',
        balance: g._sum.bankDelta?.toNumber() ?? 0,
      }));

    // 5. Calculate total bank balance
    const totalBankBalance = bankBalances.reduce((sum, b) => sum + b.balance, 0);

    // 6. Optional: Get credit card summary
    const creditCards = await prisma.creditCard.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        limit: true,
        manualGuncelBorc: true,
      },
    });

    const creditCardSummary = creditCards.map((card) => {
      const currentDebt = card.manualGuncelBorc?.toNumber() ?? 0;
      const limit = card.limit?.toNumber() ?? 0;
      const availableLimit = Math.max(0, limit - currentDebt);

      return {
        creditCardId: card.id,
        creditCardName: card.name,
        currentDebt,
        limit,
        availableLimit,
      };
    });

    // 7. Calculate upcoming payments (single source of truth)
    const upcomingPayments: UpcomingPayment[] = [];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // 7a. Credit cards with debt
    // FIX: Fetch all active cards first, then filter by debt amount in JavaScript
    // Prisma Decimal comparison with gt: 0 might not work correctly
    const allActiveCards = await prisma.creditCard.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const cardsWithDebt = allActiveCards.filter(card => {
      const sonEkstreBorcu = card.sonEkstreBorcu?.toNumber() ?? 0;
      const manualGuncelBorc = card.manualGuncelBorc?.toNumber() ?? 0;
      return sonEkstreBorcu > 0 || manualGuncelBorc > 0;
    });

    for (const card of cardsWithDebt) {
      const sonEkstreBorcu = card.sonEkstreBorcu?.toNumber() ?? 0;
      const manualGuncelBorc = card.manualGuncelBorc?.toNumber() ?? 0;
      const amount = sonEkstreBorcu > 0 ? sonEkstreBorcu : manualGuncelBorc;

      if (amount > 0 && card.dueDay) {
        // Calculate next due date (same logic as frontend getCreditCardNextDue)
        const todayDate = new Date(`${today}T00:00:00Z`);
        const year = todayDate.getUTCFullYear();
        const month = todayDate.getUTCMonth();

        const daysInMonthUtc = (y: number, m: number) =>
          new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

        const dayThisMonth = Math.min(card.dueDay, daysInMonthUtc(year, month));
        const dueThisMonth = new Date(Date.UTC(year, month, dayThisMonth));

        const nextMonthIndex = month + 1;
        const nextMonthYear = year + Math.floor(nextMonthIndex / 12);
        const nextMonth = nextMonthIndex % 12;
        const dayNextMonth = Math.min(
          card.dueDay,
          daysInMonthUtc(nextMonthYear, nextMonth)
        );
        const dueNextMonth = new Date(Date.UTC(nextMonthYear, nextMonth, dayNextMonth));

        const dueDate = dueThisMonth >= todayDate ? dueThisMonth : dueNextMonth;
        const dueDateIso = dueDate.toISOString().slice(0, 10);

        // Format: DD.MM.YYYY
        const dueDateDisplay = `${String(dueDate.getUTCDate()).padStart(2, '0')}.${String(dueDate.getUTCMonth() + 1).padStart(2, '0')}.${dueDate.getUTCFullYear()}`;

        // Calculate days left
        const daysLeft = Math.floor((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

        upcomingPayments.push({
          id: `cc-${card.id}`,
          category: 'KREDI_KARTI',
          bankName: card.bank?.name || '-',
          name: card.name,
          dueDateIso,
          dueDateDisplay,
          amount,
          daysLeft,
        });
      }
    }

    // 7b. Cheques (BORC direction, not paid yet - ODENDI excluded)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartIso = todayStart.toISOString().split('T')[0];
    
    const cheques = await prisma.cheque.findMany({
      where: {
        deletedAt: null,
        direction: 'BORC',
        status: { not: 'ODENDI' }, // FIX: Exclude paid cheques
        maturityDate: { gte: todayStartIso }, // Only future due dates (Date object comparison)
      },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    for (const cheque of cheques) {
      const dueDate = new Date(`${cheque.maturityDate}T00:00:00Z`);
      const todayDate = new Date(`${today}T00:00:00Z`);
      const daysLeft = Math.floor((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

      // Format: DD.MM.YYYY
      const dueDateDisplay = `${String(dueDate.getUTCDate()).padStart(2, '0')}.${String(dueDate.getUTCMonth() + 1).padStart(2, '0')}.${dueDate.getUTCFullYear()}`;

      // FIX: Get counterparty name from customer or supplier relation
      // For BORC cheques, supplier is typically the counterparty
      const counterpartyName = cheque.supplier?.name || cheque.customer?.name || `Çek ${cheque.cekNo}`;

      upcomingPayments.push({
        id: `cek-${cheque.id}`,
        category: 'CEK',
        bankName: cheque.bank?.name || '-',
        name: counterpartyName,
        dueDateIso: cheque.maturityDate,
        dueDateDisplay,
        amount: cheque.amount.toNumber(), // FIX: use amount, not tutar
        daysLeft,
      });
    }

    // DETERMINISTIC FIX: Only show the next (earliest) unpaid installment per loan
    // Use Date object for filtering (not string ISO split)
    // Reuse todayStart from cheques section above

    // Step 1: Find min(dueDate) per loan using groupBy
    const nextDuePerLoan = await prisma.loanInstallment.groupBy({
      by: ['loanId'],
      where: {
        deletedAt: null,
        status: { not: LoanInstallmentStatus.ODEME_ALINDI },
        dueDate: { gte: todayStartIso },
        loan: {
          deletedAt: null,
          isActive: true,
        },
      },
      _min: {
        dueDate: true,
      },
    });

    // Step 2: Fetch candidates (all installments matching min dueDate per loan)
    const orPairs = nextDuePerLoan
      .filter(x => x._min.dueDate)
      .map(x => ({
        loanId: x.loanId,
        dueDate: x._min.dueDate!,
      }));

    if (orPairs.length > 0) {
      // DETERMINISTIC FIX: Fetch all candidates, then deterministically select one per loan
      const candidates = await prisma.loanInstallment.findMany({
        where: {
          OR: orPairs.map(pair => ({
            loanId: pair.loanId,
            dueDate: pair.dueDate,
          })),
          deletedAt: null,
          status: { not: LoanInstallmentStatus.ODEME_ALINDI },
          loan: {
            deletedAt: null,
            isActive: true,
          },
        },
        include: {
          loan: {
            select: {
              id: true,
              name: true,
              bank: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          { loanId: 'asc' },
          { dueDate: 'asc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
      });

      // DETERMINISTIC FIX: Select first installment per loan (deterministic by createdAt, then id)
      const nextInstallments: typeof candidates = [];
      const seenLoanIds = new Set<string>();
      for (const candidate of candidates) {
        if (!seenLoanIds.has(candidate.loanId)) {
          seenLoanIds.add(candidate.loanId);
          nextInstallments.push(candidate);
        }
      }

      for (const inst of nextInstallments) {
        const dueDate = new Date(`${inst.dueDate}T00:00:00Z`);
        const todayDate = new Date(`${today}T00:00:00Z`);
        const daysLeft = Math.floor((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

        // Format: DD.MM.YYYY
        const dueDateDisplay = `${String(dueDate.getUTCDate()).padStart(2, '0')}.${String(dueDate.getUTCMonth() + 1).padStart(2, '0')}.${dueDate.getUTCFullYear()}`;

        upcomingPayments.push({
          id: `kredi-${inst.id}`,
          category: 'KREDI',
          bankName: inst.loan.bank?.name || '-',
          name: inst.loan.name,
          dueDateIso: inst.dueDate,
          dueDateDisplay,
          amount: inst.totalAmount.toNumber(),
          daysLeft,
          installmentId: inst.id, // DETERMINISTIC FIX: Required field
          loanId: inst.loanId, // DETERMINISTIC FIX: Required field
        });
      }
    }

    // Sort by daysLeft (ascending)
    upcomingPayments.sort((a, b) => a.daysLeft - b.daysLeft);


    return {
      cashBalance,
      totalBankBalance,
      bankBalances,
      creditCardSummary,
      upcomingPayments,
    };
  }
}

