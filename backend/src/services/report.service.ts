import { TransactionDirection } from "@prisma/client";
import { decimalToNumber } from "../utils/decimal.js";
import { TransactionService } from "./transaction.service.js";

export class ReportService {
  static async dailyLedger(params: { startDate?: string; endDate?: string }) {
    const { transactions, range } = await TransactionService.getDailyLedger(params);

    let runningBalance = 0;
    let totalIn = 0;
    let totalOut = 0;

    const rows = transactions.map((txn) => {
      const amount = decimalToNumber(txn.amount);
      const inflow = txn.direction === TransactionDirection.INFLOW ? amount : 0;
      const outflow = txn.direction === TransactionDirection.OUTFLOW ? amount : 0;

      totalIn += inflow;
      totalOut += outflow;
      runningBalance += inflow - outflow;

      return {
        id: txn.id,
        txnNo: txn.txnNo,
        txnDate: txn.txnDate,
        type: txn.type,
        method: txn.method,
        description: txn.description ?? txn.note ?? "",
        contact: txn.contact?.name ?? null,
        bankAccount: txn.bankAccount?.name ?? null,
        card: txn.card?.name ?? null,
        inflow,
        outflow,
        balance: runningBalance,
        tags: txn.tags.map((item) => ({
          id: item.tagId,
          name: item.tag.name,
          color: item.tag.color,
        })),
      };
    });

    return {
      period: range,
      totals: {
        inflow: totalIn,
        outflow: totalOut,
        net: totalIn - totalOut,
        closingBalance: runningBalance,
      },
      rows,
    };
  }
}
