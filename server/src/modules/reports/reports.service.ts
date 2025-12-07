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

    const where: any = {
      deletedAt: null,
      isoDate: {
        gte: fromDate,
        lte: toDate,
      },
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

    return {
      totalIn,
      totalOut,
      net,
      bankInTotal,
      bankOutTotal,
      bankNet,
      cashInTotal,
      cashOutTotal,
      cashNet,
      girisler,
      cikislar,
    };
  }

  /**
   * Get cashflow contribution for a transaction (giris)
   */
  private getNakitAkisGiris(tx: any): number {
    switch (tx.type) {
      case 'NAKIT_TAHSILAT':
        return Number(tx.incoming);

      case 'BANKA_HAVALE_GIRIS':
        if (Number(tx.bankDelta) > 0) {
          return Number(tx.bankDelta);
        }
        return 0;

      case 'POS_TAHSILAT_BRUT':
        return Number(tx.displayIncoming) || 0;

      case 'BANKA_KASA_TRANSFER':
        // Internal movements do NOT affect net cashflow in the report
        return 0;

      case 'KASA_BANKA_TRANSFER':
        // Internal movements do NOT affect net cashflow in the report
        return 0;

      case 'CEK_TAHSIL_BANKA':
        if (tx.source === 'KASA' && Number(tx.incoming) > 0) {
          return Number(tx.incoming);
        }
        if (tx.source === 'BANKA' && Number(tx.bankDelta) > 0) {
          return Number(tx.bankDelta);
        }
        return 0;

      case 'DEVIR_BAKIYE':
      case 'DUZELTME':
        // Optional: exclude or handle separately
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Get cashflow contribution for a transaction (cikis)
   * Uses explicit per-type rules from the spec
   */
  private getNakitAkisCikis(tx: any): number {
    switch (tx.type) {
      case 'NAKIT_ODEME':
        return Number(tx.outgoing);

      case 'BANKA_HAVALE_CIKIS':
        if (Number(tx.bankDelta) < 0) {
          return Math.abs(Number(tx.bankDelta));
        }
        return 0;

      case 'POS_KOMISYONU':
        // Always use displayOutgoing for commission
        return Number(tx.displayOutgoing) || 0;

      case 'KREDI_KARTI_HARCAMA':
        return Number(tx.displayOutgoing) || 0;

      case 'KREDI_KARTI_EKSTRE_ODEME':
        if (Number(tx.bankDelta) < 0) {
          return Math.abs(Number(tx.bankDelta));
        }
        if (Number(tx.outgoing) > 0) {
          return Number(tx.outgoing);
        }
        return 0;

      case 'KASA_BANKA_TRANSFER':
        // Internal movements do NOT affect net cashflow in the report
        return 0;

      case 'BANKA_KASA_TRANSFER':
        // Internal movements do NOT affect net cashflow in the report
        return 0;

      case 'CEK_ODENMESI':
        if (tx.source === 'KASA' && Number(tx.outgoing) > 0) {
          return Number(tx.outgoing);
        }
        if (tx.source === 'BANKA' && Number(tx.bankDelta) < 0) {
          return Math.abs(Number(tx.bankDelta));
        }
        return 0;

      case 'DEVIR_BAKIYE':
      case 'DUZELTME':
        // Optional: exclude or handle separately
        return 0;

      default:
        return 0;
    }
  }
}

