export declare class DashboardService {
    static getOverview(date?: Date): Promise<{
        date: string;
        balances: {
            cash: number;
            banks: {
                id: string;
                name: string;
                currency: string;
                balance: number;
            }[];
            checks: {
                count: number;
                total: number;
            };
        };
        todayTable: {
            id: string;
            date: string;
            docNo: string;
            type: import(".prisma/client").$Enums.TransactionType;
            method: import(".prisma/client").$Enums.TransactionMethod;
            source: string;
            contact: string;
            desc: string;
            in: number;
            out: number;
            balance: number;
        }[];
    }>;
}
//# sourceMappingURL=dashboard.service.d.ts.map