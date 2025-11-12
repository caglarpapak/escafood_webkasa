interface LedgerRow {
    txnDate: Date;
    txnNo: string;
    type: string;
    method: string;
    description: string;
    contact?: string | null;
    bankAccount?: string | null;
    card?: string | null;
    inflow: number;
    outflow: number;
    balance: number;
}
interface LedgerReport {
    period: {
        start: Date;
        end: Date;
    };
    rows: LedgerRow[];
    totals: {
        inflow: number;
        outflow: number;
        net: number;
        closingBalance: number;
    };
}
export declare const generateDailyReportPDF: (report: LedgerReport) => Promise<Buffer>;
export declare const generateDailyReportCSV: (report: LedgerReport) => string;
export type { LedgerReport, LedgerRow };
//# sourceMappingURL=report-export.d.ts.map