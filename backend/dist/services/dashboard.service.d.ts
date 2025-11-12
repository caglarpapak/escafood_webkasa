export declare class DashboardService {
    static getOverview(date?: Date): Promise<{
        bankBalances: {
            id: string;
            name: string;
            currency: string;
            balance: number;
        }[];
        cashBalance: number;
        checksInSafe: {
            count: number;
            total: number;
        };
        dailyMovements: {
            id: string;
            txnDate: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            method: import(".prisma/client").$Enums.TransactionMethod;
            description: string;
            contactName: string | undefined;
            bankAccountName: string | undefined;
            cardName: string | undefined;
            inflow: number;
            outflow: number;
        }[];
    }>;
}
//# sourceMappingURL=dashboard.service.d.ts.map