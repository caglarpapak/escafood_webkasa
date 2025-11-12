export declare const ContactType: {
    readonly CUSTOMER: "CUSTOMER";
    readonly SUPPLIER: "SUPPLIER";
    readonly OTHER: "OTHER";
};
export type ContactType = (typeof ContactType)[keyof typeof ContactType];
export declare const TransactionDirection: {
    readonly INFLOW: "INFLOW";
    readonly OUTFLOW: "OUTFLOW";
};
export type TransactionDirection = (typeof TransactionDirection)[keyof typeof TransactionDirection];
export declare const TransactionMethod: {
    readonly CASH: "CASH";
    readonly BANK: "BANK";
    readonly POS: "POS";
    readonly CARD: "CARD";
    readonly CHECK: "CHECK";
};
export type TransactionMethod = (typeof TransactionMethod)[keyof typeof TransactionMethod];
export declare const TransactionType: {
    readonly CASH_IN: "CASH_IN";
    readonly CASH_OUT: "CASH_OUT";
    readonly BANK_IN: "BANK_IN";
    readonly BANK_OUT: "BANK_OUT";
    readonly POS_COLLECTION: "POS_COLLECTION";
    readonly POS_COMMISSION: "POS_COMMISSION";
    readonly CARD_EXPENSE: "CARD_EXPENSE";
    readonly CARD_PAYMENT: "CARD_PAYMENT";
    readonly CHECK_PAYMENT: "CHECK_PAYMENT";
    readonly OTHER: "OTHER";
};
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
export declare const TransactionCategory: {
    readonly CUSTOMER: "CUSTOMER";
    readonly SUPPLIER: "SUPPLIER";
    readonly SALARY: "SALARY";
    readonly EXPENSE: "EXPENSE";
    readonly CREDIT_CARD_PAYMENT: "CREDIT_CARD_PAYMENT";
    readonly TAX: "TAX";
    readonly SOCIAL_SECURITY: "SOCIAL_SECURITY";
    readonly FUEL: "FUEL";
    readonly FOOD: "FOOD";
    readonly MAINTENANCE: "MAINTENANCE";
    readonly REPRESENTATION: "REPRESENTATION";
    readonly COMMISSION: "COMMISSION";
    readonly TRANSFER: "TRANSFER";
    readonly OTHER: "OTHER";
};
export type TransactionCategory = (typeof TransactionCategory)[keyof typeof TransactionCategory];
export declare const CheckStatus: {
    readonly IN_SAFE: "IN_SAFE";
    readonly ENDORSED: "ENDORSED";
    readonly ISSUED: "ISSUED";
    readonly PAID: "PAID";
};
export type CheckStatus = (typeof CheckStatus)[keyof typeof CheckStatus];
export declare const CheckMoveAction: {
    readonly IN: "IN";
    readonly OUT: "OUT";
    readonly PAYMENT: "PAYMENT";
    readonly ISSUE: "ISSUE";
};
export type CheckMoveAction = (typeof CheckMoveAction)[keyof typeof CheckMoveAction];
//# sourceMappingURL=enums.d.ts.map