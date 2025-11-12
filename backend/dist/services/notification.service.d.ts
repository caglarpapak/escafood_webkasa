interface TransactionEmailPayload {
    txnNo: string;
    amount: number;
    description?: string | null;
    txnDate: Date;
    performedAt: Date;
    actor: {
        id: string;
        fullName: string;
        email: string;
    };
}
export declare class NotificationService {
    static sendBackdatedTransaction(context: TransactionEmailPayload): Promise<void>;
    static sendHardDelete(context: TransactionEmailPayload): Promise<void>;
}
export {};
//# sourceMappingURL=notification.service.d.ts.map