import { Prisma } from "@prisma/client";
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
export declare class CheckService {
    static registerIn(payload: {
        actor: Actor;
        serialNo: string;
        bank: string;
        amount: number;
        dueDate: string;
        customerId: string;
        notes?: string;
        attachments: AttachmentInput[];
    }): Promise<void>;
    static registerOut(payload: {
        actor: Actor;
        checkId: string;
        supplierId: string;
        notes?: string;
    }): Promise<void>;
    static issueCompanyCheck(payload: {
        actor: Actor;
        serialNo: string;
        bank: string;
        amount: number;
        dueDate: string;
        notes?: string;
        attachments: AttachmentInput[];
        issuerName?: string;
    }): Promise<void>;
    static listAll(): Promise<({
        contact: {
            type: import(".prisma/client").$Enums.ContactType;
            id: string;
            name: string;
        } | null;
        attachments: {
            id: string;
            path: string;
            filename: string;
        }[];
        moves: ({
            performedBy: {
                id: string;
                fullName: string;
            } | null;
        } & {
            id: string;
            description: string | null;
            checkId: string;
            action: import(".prisma/client").$Enums.CheckMoveAction;
            performedAt: Date;
            transactionId: string | null;
            performedById: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: Prisma.Decimal;
        contactId: string | null;
        status: import(".prisma/client").$Enums.CheckStatus;
        notes: string | null;
        serialNo: string;
        bank: string;
        dueDate: Date;
        issuedBy: string | null;
    })[]>;
    static payCheck(payload: {
        actor: Actor;
        checkId: string;
        bankAccountId: string;
        amount: number;
        txnDate: string;
        notes?: string;
    }): Promise<void>;
}
export {};
//# sourceMappingURL=check.service.d.ts.map