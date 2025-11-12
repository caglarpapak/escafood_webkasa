export declare class ReportService {
    static dailyLedger(params: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        totals: {
            inflow: number;
            outflow: number;
            net: number;
            closingBalance: number;
        };
        rows: {
            id: string;
            txnNo: string;
            txnDate: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            method: import(".prisma/client").$Enums.TransactionMethod;
            description: string;
            contact: string | null;
            bankAccount: string | null;
            card: string | null;
            inflow: number;
            outflow: number;
            balance: number;
            tags: {
                id: string;
                name: string;
                color: string | null;
            }[];
        }[];
    }>;
}
//# sourceMappingURL=report.service.d.ts.map