import { Prisma, TransactionCategory } from "@prisma/client";
interface BaseTransactionInput {
    amount: number;
    txnDate?: string | Date;
    description?: string;
    note?: string;
    contactId?: string | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    checkId?: string | null;
    category?: TransactionCategory | null;
    meta?: Prisma.InputJsonValue;
    tagIds?: string[];
    createdById: string;
}
interface PosInput extends BaseTransactionInput {
    bankAccountId: string;
    posBrut: number;
    posKomisyon: number;
    effectiveRate?: number;
}
export declare class TransactionService {
    static cashIn(payload: BaseTransactionInput & {
        contactId?: string;
    }): Promise<void>;
    static cashOut(payload: BaseTransactionInput & {
        category: TransactionCategory;
    }): Promise<void>;
    static bankIn(payload: BaseTransactionInput & {
        bankAccountId: string;
    }): Promise<void>;
    static bankOut(payload: BaseTransactionInput & {
        bankAccountId: string;
        category: TransactionCategory;
    }): Promise<void>;
    static posCollection(payload: PosInput): Promise<void>;
    static cardExpense(payload: BaseTransactionInput & {
        cardId: string;
        category: TransactionCategory;
    }): Promise<void>;
    static cardPayment(payload: BaseTransactionInput & {
        cardId: string;
        bankAccountId?: string;
    }): Promise<void>;
    static registerCheckPayment(payload: BaseTransactionInput & {
        checkId: string;
        bankAccountId: string;
    }): Promise<void>;
    static deleteTransaction(id: string): Promise<void>;
    static getDailyLedger(params: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        transactions: ({
            bankAccount: {
                name: string;
            } | null;
            card: {
                name: string;
            } | null;
            contact: {
                name: string;
            } | null;
            tags: ({
                tag: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    color: string | null;
                };
            } & {
                transactionId: string;
                tagId: string;
            })[];
        } & {
            type: import(".prisma/client").$Enums.TransactionType;
            meta: Prisma.JsonValue | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            currency: string;
            txnNo: string;
            method: import(".prisma/client").$Enums.TransactionMethod;
            direction: import(".prisma/client").$Enums.TransactionDirection;
            amount: Prisma.Decimal;
            txnDate: Date;
            note: string | null;
            channelReference: string | null;
            category: import(".prisma/client").$Enums.TransactionCategory | null;
            bankAccountId: string | null;
            cardId: string | null;
            contactId: string | null;
            checkId: string | null;
            createdById: string;
            posBrut: Prisma.Decimal | null;
            posKomisyon: Prisma.Decimal | null;
            posNet: Prisma.Decimal | null;
            posEffectiveRate: Prisma.Decimal | null;
        })[];
        range: {
            start: Date;
            end: Date;
        };
    }>;
}
export {};
//# sourceMappingURL=transaction.service.d.ts.map