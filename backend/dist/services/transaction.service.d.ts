import { Prisma, TransactionCategory, PosProvider } from "@prisma/client";
interface Actor {
    id: string;
    email: string;
    fullName: string;
}
interface AttachmentInput {
    path: string;
    filename: string;
    mimeType: string;
    size: number;
}
interface BaseTransactionInput {
    actor: Actor;
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
    tagNames?: string[];
    plate?: string | null;
    posProvider?: PosProvider | null;
}
interface PosInput extends BaseTransactionInput {
    bankAccountId: string;
    mode: "net_komisyon" | "brut_komisyon";
    net?: number;
    brut?: number;
    komisyon: number;
    provider?: "ykb" | "enpara" | "other";
}
interface CardExpenseInput extends BaseTransactionInput {
    cardId: string;
    category: TransactionCategory;
    attachments: AttachmentInput[];
}
export declare class TransactionService {
    static cashIn(payload: BaseTransactionInput & {
        contactId?: string | null;
    }): Promise<{
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
        plate: string | null;
        bankAccountId: string | null;
        cardId: string | null;
        contactId: string | null;
        checkId: string | null;
        createdById: string;
        posBrut: Prisma.Decimal | null;
        posKomisyon: Prisma.Decimal | null;
        posNet: Prisma.Decimal | null;
        posEffectiveRate: Prisma.Decimal | null;
        posProvider: import(".prisma/client").$Enums.PosProvider | null;
    }>;
    static cashOut(payload: BaseTransactionInput & {
        category: TransactionCategory;
    }): Promise<{
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
        plate: string | null;
        bankAccountId: string | null;
        cardId: string | null;
        contactId: string | null;
        checkId: string | null;
        createdById: string;
        posBrut: Prisma.Decimal | null;
        posKomisyon: Prisma.Decimal | null;
        posNet: Prisma.Decimal | null;
        posEffectiveRate: Prisma.Decimal | null;
        posProvider: import(".prisma/client").$Enums.PosProvider | null;
    }>;
    static bankIn(payload: BaseTransactionInput & {
        bankAccountId: string;
    }): Promise<{
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
        plate: string | null;
        bankAccountId: string | null;
        cardId: string | null;
        contactId: string | null;
        checkId: string | null;
        createdById: string;
        posBrut: Prisma.Decimal | null;
        posKomisyon: Prisma.Decimal | null;
        posNet: Prisma.Decimal | null;
        posEffectiveRate: Prisma.Decimal | null;
        posProvider: import(".prisma/client").$Enums.PosProvider | null;
    }>;
    static bankOut(payload: BaseTransactionInput & {
        bankAccountId: string;
        category: TransactionCategory;
    }): Promise<{
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
        plate: string | null;
        bankAccountId: string | null;
        cardId: string | null;
        contactId: string | null;
        checkId: string | null;
        createdById: string;
        posBrut: Prisma.Decimal | null;
        posKomisyon: Prisma.Decimal | null;
        posNet: Prisma.Decimal | null;
        posEffectiveRate: Prisma.Decimal | null;
        posProvider: import(".prisma/client").$Enums.PosProvider | null;
    }>;
    static posCollection(payload: PosInput): Promise<{
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
        plate: string | null;
        bankAccountId: string | null;
        cardId: string | null;
        contactId: string | null;
        checkId: string | null;
        createdById: string;
        posBrut: Prisma.Decimal | null;
        posKomisyon: Prisma.Decimal | null;
        posNet: Prisma.Decimal | null;
        posEffectiveRate: Prisma.Decimal | null;
        posProvider: import(".prisma/client").$Enums.PosProvider | null;
    }>;
    static cardExpense(payload: CardExpenseInput): Promise<{
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
        plate: string | null;
        bankAccountId: string | null;
        cardId: string | null;
        contactId: string | null;
        checkId: string | null;
        createdById: string;
        posBrut: Prisma.Decimal | null;
        posKomisyon: Prisma.Decimal | null;
        posNet: Prisma.Decimal | null;
        posEffectiveRate: Prisma.Decimal | null;
        posProvider: import(".prisma/client").$Enums.PosProvider | null;
    }>;
    static cardPayment(payload: BaseTransactionInput & {
        cardId: string;
        bankAccountId?: string | null;
    }): Promise<{
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
        plate: string | null;
        bankAccountId: string | null;
        cardId: string | null;
        contactId: string | null;
        checkId: string | null;
        createdById: string;
        posBrut: Prisma.Decimal | null;
        posKomisyon: Prisma.Decimal | null;
        posNet: Prisma.Decimal | null;
        posEffectiveRate: Prisma.Decimal | null;
        posProvider: import(".prisma/client").$Enums.PosProvider | null;
    }>;
    static registerCheckPayment(payload: BaseTransactionInput & {
        checkId: string;
        bankAccountId: string;
    }): Promise<{
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
        plate: string | null;
        bankAccountId: string | null;
        cardId: string | null;
        contactId: string | null;
        checkId: string | null;
        createdById: string;
        posBrut: Prisma.Decimal | null;
        posKomisyon: Prisma.Decimal | null;
        posNet: Prisma.Decimal | null;
        posEffectiveRate: Prisma.Decimal | null;
        posProvider: import(".prisma/client").$Enums.PosProvider | null;
    }>;
    static deleteTransaction(id: string, actor: Actor): Promise<void>;
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
            plate: string | null;
            bankAccountId: string | null;
            cardId: string | null;
            contactId: string | null;
            checkId: string | null;
            createdById: string;
            posBrut: Prisma.Decimal | null;
            posKomisyon: Prisma.Decimal | null;
            posNet: Prisma.Decimal | null;
            posEffectiveRate: Prisma.Decimal | null;
            posProvider: import(".prisma/client").$Enums.PosProvider | null;
        })[];
        range: {
            start: Date;
            end: Date;
        };
    }>;
}
export {};
//# sourceMappingURL=transaction.service.d.ts.map