import { Prisma } from "@prisma/client";
export declare class CheckService {
    static registerIn(payload: {
        serialNo: string;
        bank: string;
        amount: number;
        dueDate: string;
        customerId: string;
        notes?: string;
        createdById: string;
        attachment?: Express.Multer.File;
    }): Promise<void>;
    static registerOut(payload: {
        checkId: string;
        supplierId: string;
        notes?: string;
        createdById: string;
    }): Promise<void>;
    static issueCompanyCheck(payload: {
        serialNo: string;
        bank: string;
        amount: number;
        dueDate: string;
        notes?: string;
        createdById: string;
        attachment?: Express.Multer.File;
    }): Promise<void>;
    static listAll(): Promise<({
        contact: {
            type: import(".prisma/client").$Enums.ContactType;
            id: string;
            name: string;
        } | null;
        attachment: {
            id: string;
            path: string;
            filename: string;
        } | null;
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
        attachmentId: string | null;
        issuedBy: string | null;
    })[]>;
    static payCheck(payload: {
        checkId: string;
        bankAccountId: string;
        amount: number;
        txnDate: string;
        notes?: string;
        createdById: string;
    }): Promise<void>;
}
//# sourceMappingURL=check.service.d.ts.map