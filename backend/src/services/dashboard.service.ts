import { CheckStatus, ContactType, TransactionDirection, TransactionMethod } from "@prisma/client";
import { endOfDay, format, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { prisma } from "../lib/prisma.js";
import { decimalToNumber } from "../utils/decimal.js";

const TIMEZONE = "Europe/Istanbul";

export class DashboardService {
  static async getOverview(date = new Date()) {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const bankAccounts = await prisma.bankAccount.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        currency: true,
        initialBalance: true,
      },
      orderBy: { name: "asc" },
    });

    const bankAggregates = await prisma.transaction.groupBy({
      by: ["bankAccountId", "direction"],
      where: {
        method: TransactionMethod.BANK,
        bankAccountId: { not: null },
      },
      _sum: {
        amount: true,
      },
    });

    const bankBalances = bankAccounts.map((account) => {
      const inflowSum = bankAggregates
        .filter(
          (row) =>
            row.bankAccountId === account.id && row.direction === TransactionDirection.INFLOW,
        )
        .reduce((acc, row) => acc + decimalToNumber(row._sum.amount), 0);
      const outflowSum = bankAggregates
        .filter(
          (row) =>
            row.bankAccountId === account.id && row.direction === TransactionDirection.OUTFLOW,
        )
        .reduce((acc, row) => acc + decimalToNumber(row._sum.amount), 0);

      const initial = decimalToNumber(account.initialBalance);

      return {
        id: account.id,
        name: account.name,
        currency: account.currency,
        balance: initial + inflowSum - outflowSum,
      };
    });

    const cashAggregates = await prisma.transaction.groupBy({
      by: ["direction"],
      where: {
        method: TransactionMethod.CASH,
      },
      _sum: { amount: true },
    });

    const cashIn = cashAggregates
      .filter((row) => row.direction === TransactionDirection.INFLOW)
      .reduce((acc, row) => acc + decimalToNumber(row._sum.amount), 0);

    const cashOut = cashAggregates
      .filter((row) => row.direction === TransactionDirection.OUTFLOW)
      .reduce((acc, row) => acc + decimalToNumber(row._sum.amount), 0);

    const checks = await prisma.check.aggregate({
      where: {
        status: CheckStatus.IN_SAFE,
        contact: {
          type: ContactType.CUSTOMER,
        },
      },
      _count: { id: true },
      _sum: { amount: true },
    });

      const dailyTransactions = await prisma.transaction.findMany({
      where: {
        txnDate: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        contact: {
          select: { name: true },
        },
        bankAccount: {
          select: { name: true },
        },
        card: {
          select: { name: true },
        },
        },
        orderBy: [
          { txnDate: "asc" },
          { createdAt: "asc" },
        ],
      });

      let runningBalance = 0;

      const todayTable = dailyTransactions.map((txn) => {
        const inflow = txn.direction === TransactionDirection.INFLOW ? decimalToNumber(txn.amount) : 0;
        const outflow =
          txn.direction === TransactionDirection.OUTFLOW ? decimalToNumber(txn.amount) : 0;

        runningBalance += inflow - outflow;

        return {
          id: txn.id,
          date: format(toZonedTime(txn.txnDate, TIMEZONE), "dd/MM/yyyy"),
          docNo: txn.txnNo,
          type: txn.type,
          method: txn.method,
          source: txn.bankAccount?.name ?? txn.card?.name ?? "-",
          contact: txn.contact?.name ?? "-",
          desc: txn.description ?? txn.note ?? "",
          in: inflow,
          out: outflow,
          balance: runningBalance,
        };
      });

      return {
        date: format(toZonedTime(dayStart, TIMEZONE), "yyyy-MM-dd"),
        balances: {
          cash: cashIn - cashOut,
          banks: bankBalances,
          checks: {
            count: checks._count.id ?? 0,
            total: decimalToNumber(checks._sum.amount),
          },
        },
        todayTable,
      };
  }
}
