import { PrismaClient, DailyTransactionType, DailyTransactionSource } from '@prisma/client';
import { prisma } from '../../config/prisma';
import {
  KasaDefteriQuery,
  KasaDefteriResponse,
  NakitAkisQuery,
  NakitAkisResponse,
} from './reports.types';

export class ReportsService {
  /**
   * Get Kasa Defteri (Cash Book) report
   */
  async getKasaDefteri(query: KasaDefteriQuery): Promise<KasaDefteriResponse> {
    // Default to today if no date range provided
    const today = new Date().toISOString().slice(0, 10);
    const fromDate = query.from || today;
    const toDate = query.to || today;

    const where: any = {
      deletedAt: null,
      isoDate: {
        gte: fromDate,
        lte: toDate,
      },
    };

    if (query.documentNo) {
      where.documentNo = { contains: query.documentNo, mode: 'insensitive' };
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.source) {
      where.source = query.source;
    }

    if (query.counterparty) {
      where.counterparty = { contains: query.counterparty, mode: 'insensitive' };
    }

    if (query.description) {
      where.description = { contains: query.description, mode: 'insensitive' };
    }

    // Calculate opening balance (before from date)
    // IMPORTANT: Only KASA transactions affect cash balance
    const beforeTransactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        isoDate: { lt: fromDate },
        source: 'KASA', // Only KASA transactions affect cash balance
      },
      orderBy: [
        { isoDate: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    const openingBalance = beforeTransactions.reduce(
      (sum: number, tx) => sum + Number(tx.incoming) - Number(tx.outgoing),
      0
    );

    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const skip = (page - 1) * pageSize;

    // Fix Bug 8: Default sort order is ascending by date (oldest to newest)
    const sortKey = query.sortKey || 'isoDate';
    const sortDir = query.sortDir || 'asc';
    
    // Build orderBy array based on sortKey
    const orderBy: any[] = [];
    if (sortKey === 'isoDate') {
      // For date sorting, use isoDate first, then createdAt as secondary sort
      orderBy.push({ isoDate: sortDir });
      orderBy.push({ createdAt: sortDir });
    } else {
      // For other fields, use the sortKey directly
      orderBy.push({ [sortKey]: sortDir });
      // Add isoDate as secondary sort for consistency
      orderBy.push({ isoDate: 'asc' });
    }

    // Fix Bug 4: Include bank and credit card relations for display
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          bank: {
            select: {
              id: true,
              name: true,
            },
          },
          creditCard: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calculate totals from ALL matching transactions (not just current page)
    const allTransactions = await prisma.transaction.findMany({
      where,
      select: {
        incoming: true,
        outgoing: true,
        balanceAfter: true,
        isoDate: true,
        createdAt: true,
      },
      orderBy: [
        { isoDate: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    const totalIncoming = allTransactions.reduce((sum: number, tx) => sum + Number(tx.incoming), 0);
    const totalOutgoing = allTransactions.reduce((sum: number, tx) => sum + Number(tx.outgoing), 0);

    // Closing balance: opening + net of all transactions in range
    // OR the last transaction's balanceAfter if available
    const closingBalance =
      allTransactions.length > 0
        ? Number(allTransactions[allTransactions.length - 1].balanceAfter)
        : openingBalance + totalIncoming - totalOutgoing;

    // Fix Bug 4: Include bank and credit card info in response
    return {
      items: transactions.map((tx) => ({
        id: tx.id,
        isoDate: tx.isoDate,
        documentNo: tx.documentNo,
        type: tx.type,
        source: tx.source,
        counterparty: tx.counterparty,
        description: tx.description,
        incoming: Number(tx.incoming),
        outgoing: Number(tx.outgoing),
        balanceAfter: Number(tx.balanceAfter),
        displayIncoming: tx.displayIncoming ? Number(tx.displayIncoming) : null, // BUG 2 FIX: Include for bank cash in
        displayOutgoing: tx.displayOutgoing ? Number(tx.displayOutgoing) : null, // BUG 2 FIX: Include for bank cash out
        bankId: tx.bankId,
        bankName: tx.bank?.name || null,
        bankDelta: tx.bankDelta !== null && tx.bankDelta !== undefined ? Number(tx.bankDelta) : null, // For bank transfer tracking
        creditCardId: tx.creditCardId,
        creditCardName: tx.creditCard?.name || null,
      })),
      totalCount,
      totalIncoming,
      totalOutgoing,
      openingBalance,
      closingBalance,
    };
  }

  /**
   * Get Nakit Akış (Cash Flow) report
   * Defaults to current month if no date range provided
   */
  async getNakitAkis(query: NakitAkisQuery): Promise<NakitAkisResponse> {
    // Default to current month if no date range provided
    const today = new Date().toISOString().slice(0, 10);
    const year = new Date().getUTCFullYear();
    const month = new Date().getUTCMonth();
    const firstOfMonth = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
    const lastOfMonth = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
    
    const fromDate = query.from || firstOfMonth;
    const toDate = query.to || lastOfMonth;

    // CRITICAL FIX: Exclude opening balance transactions from reports
    // Opening balance is stored in Bank.openingBalance, NOT in transactions
    // IMPORTANT: Use OR condition to handle null descriptions (normal transactions don't have "Açılış bakiyesi")
    const where: any = {
      deletedAt: null,
      isoDate: {
        gte: fromDate,
        lte: toDate,
      },
      // Exclude opening transactions, but include null descriptions (normal transactions)
      OR: [
        { description: { not: 'Açılış bakiyesi' } },
        { description: null },
      ],
    };

    if (query.user) {
      where.createdBy = query.user;
    }

    if (query.search) {
      where.OR = [
        { documentNo: { contains: query.search, mode: 'insensitive' } },
        { counterparty: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filter by scope
    if (query.scope === 'NAKIT') {
      where.source = 'KASA';
    } else if (query.scope === 'BANKA') {
      where.source = 'BANKA';
    }
    // 'HEPSI' means no source filter

    // Fix Bug 4: Include bank relation for bank name display
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: [
        { isoDate: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
        creditCard: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const girisler: NakitAkisResponse['girisler'] = [];
    const cikislar: NakitAkisResponse['cikislar'] = [];

    for (const tx of transactions) {
      const giris = this.getNakitAkisGiris(tx);
      const cikis = this.getNakitAkisCikis(tx);

      // Fix Bug 4: Include bank and credit card info in cash flow report
      if (giris > 0) {
        girisler.push({
          isoDate: tx.isoDate,
          type: tx.type,
          source: tx.source,
          counterparty: tx.counterparty,
          description: tx.description,
          amount: giris,
          bankId: tx.bankId,
          bankName: tx.bank?.name || null,
          creditCardId: tx.creditCardId,
          creditCardName: tx.creditCard?.name || null,
        });
      }

      if (cikis > 0) {
        cikislar.push({
          isoDate: tx.isoDate,
          type: tx.type,
          source: tx.source,
          counterparty: tx.counterparty,
          description: tx.description,
          amount: cikis,
          bankId: tx.bankId,
          bankName: tx.bank?.name || null,
          creditCardId: tx.creditCardId,
          creditCardName: tx.creditCard?.name || null,
        });
      }
    }

    const totalIn = girisler.reduce((sum: number, g) => sum + g.amount, 0);
    const totalOut = cikislar.reduce((sum: number, c) => sum + c.amount, 0);
    const net = totalIn - totalOut;

    // Calculate bank movement totals (based on bankDelta)
    let bankInTotal = 0;
    let bankOutTotal = 0;
    for (const tx of transactions) {
      const bankDelta = Number(tx.bankDelta) || 0;
      if (bankDelta > 0) {
        bankInTotal += bankDelta;
      } else if (bankDelta < 0) {
        bankOutTotal += Math.abs(bankDelta); // Store as positive for display
      }
    }
    const bankNet = bankInTotal - bankOutTotal;

    // Calculate cash movement totals (based on source = KASA and incoming/outgoing)
    let cashInTotal = 0;
    let cashOutTotal = 0;
    for (const tx of transactions) {
      if (tx.source === 'KASA') {
        const incoming = Number(tx.incoming) || 0;
        const outgoing = Number(tx.outgoing) || 0;
        if (incoming > 0) {
          cashInTotal += incoming;
        }
        if (outgoing > 0) {
          cashOutTotal += outgoing;
        }
      }
    }
    const cashNet = cashInTotal - cashOutTotal;

    // CRITICAL FIX: Calculate bank opening/closing balances from Bank.openingBalance (NOT transactions)
    // Opening balance is stored in Bank table, NOT as transactions
    const allBanks = await prisma.bank.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        openingBalance: true,
      },
    });

    // Calculate total opening balance from all active banks
    const bankOpeningTotal = allBanks.reduce((sum, bank) => {
      return sum + (bank.openingBalance ? Number(bank.openingBalance) : 0);
    }, 0);

    // Calculate net delta from transactions in date range (already calculated as bankNet)
    const bankNetDelta = bankNet; // This is the net delta from transactions in the date range

    // Closing balance = opening + net delta
    const bankClosingTotal = bankOpeningTotal + bankNetDelta;

    return {
      totalIn,
      totalOut,
      net,
      bankInTotal,
      bankOutTotal,
      bankNet,
      bankOpeningTotal, // NEW: Opening balance from Bank.openingBalance
      bankNetDelta, // NEW: Net delta from transactions (same as bankNet)
      bankClosingTotal, // NEW: Opening + Net Delta
      cashInTotal,
      cashOutTotal,
      cashNet,
      girisler,
      cikislar,
    };
  }

  /**
   * Get cashflow contribution for a transaction (giris)
   * 
   * UI GÖSTERİM KURALI (GÜN İÇİ / KASA DEFTERİ) - 2.1 Tutar resolver (TEK KURAL)
   * if (tx.source === 'BANKA') {
   *   giris = tx.bankDelta > 0 ? tx.bankDelta : null
   * } else {
   *   giris = tx.incoming > 0 ? tx.incoming : null
   * }
   */
  private getNakitAkisGiris(tx: any): number {
    // UI GÖSTERİM KURALI: Source-based resolver
    if (tx.source === 'BANKA') {
      // BANKA source: SADECE bankDelta kullanılır
      const bankDelta = Number(tx.bankDelta) || 0;
      return bankDelta > 0 ? bankDelta : 0;
    } else if (tx.source === 'POS') {
      // POS source: displayIncoming kullanılır (POS_TAHSILAT_BRUT için)
      // POS transaction'larında incoming=0 olduğu için displayIncoming kullanılmalı
      return Number(tx.displayIncoming) || 0;
    } else if (tx.source === 'KREDI_KARTI') {
      // KREDI_KARTI source: giriş yok (kredi kartı harcamaları giriş değildir)
      return 0;
    } else {
      // KASA source: incoming/outgoing kullanılır
      // Legacy: Kredi kartı ekstre ödeme gibi legacy outgoing kullanan satırlar için
      // incoming kullanılır (source !== 'BANKA' && source !== 'POS' && source !== 'KREDI_KARTI' olduğu için buraya düşer)
      return Number(tx.incoming) || 0;
    }
  }

  /**
   * Get cashflow contribution for a transaction (cikis)
   * 
   * UI GÖSTERİM KURALI (GÜN İÇİ / KASA DEFTERİ) - 2.1 Tutar resolver (TEK KURAL)
   * if (tx.source === 'BANKA') {
   *   cikis = tx.bankDelta < 0 ? abs(tx.bankDelta) : null
   * } else {
   *   cikis = tx.outgoing > 0 ? tx.outgoing : null
   * }
   * 
   * BANKA satırında (-) tutar mutlaka görünür (cikis olarak)
   * Kredi kartı ekstre ödeme gibi legacy outgoing kullanan satırlar bozulmayacak
   */
  private getNakitAkisCikis(tx: any): number {
    // UI GÖSTERİM KURALI: Source-based resolver
    if (tx.source === 'BANKA') {
      // BANKA source: SADECE bankDelta kullanılır
      // BANKA satırında (-) tutar mutlaka görünür (cikis olarak)
      const bankDelta = Number(tx.bankDelta) || 0;
      return bankDelta < 0 ? Math.abs(bankDelta) : 0;
    } else if (tx.source === 'POS') {
      // POS source: displayOutgoing kullanılır (POS_KOMISYONU için)
      // POS transaction'larında outgoing=0 olduğu için displayOutgoing kullanılmalı
      return Number(tx.displayOutgoing) || 0;
    } else if (tx.source === 'KREDI_KARTI') {
      // KREDI_KARTI source: displayOutgoing kullanılır (KREDI_KARTI_HARCAMA için)
      // Kredi kartı transaction'larında outgoing=0 olduğu için displayOutgoing kullanılmalı
      return Number(tx.displayOutgoing) || 0;
    } else {
      // KASA source: incoming/outgoing kullanılır
      // Legacy: Kredi kartı ekstre ödeme gibi legacy outgoing kullanan satırlar için
      // outgoing kullanılır (source !== 'BANKA' && source !== 'POS' && source !== 'KREDI_KARTI' olduğu için buraya düşer)
      return Number(tx.outgoing) || 0;
    }
  }
}

