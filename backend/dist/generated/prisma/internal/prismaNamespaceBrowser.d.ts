import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: any;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: any;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: any;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: any;
export declare const ModelName: {
    readonly User: "User";
    readonly BankAccount: "BankAccount";
    readonly Card: "Card";
    readonly Contact: "Contact";
    readonly Attachment: "Attachment";
    readonly Transaction: "Transaction";
    readonly Check: "Check";
    readonly CheckMove: "CheckMove";
    readonly Tag: "Tag";
    readonly TxnTag: "TxnTag";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: any;
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly passwordHash: "passwordHash";
    readonly fullName: "fullName";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const BankAccountScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly iban: "iban";
    readonly currency: "currency";
    readonly initialBalance: "initialBalance";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BankAccountScalarFieldEnum = (typeof BankAccountScalarFieldEnum)[keyof typeof BankAccountScalarFieldEnum];
export declare const CardScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly bankAccountId: "bankAccountId";
    readonly limit: "limit";
    readonly currentRisk: "currentRisk";
    readonly statementDay: "statementDay";
    readonly dueDay: "dueDay";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CardScalarFieldEnum = (typeof CardScalarFieldEnum)[keyof typeof CardScalarFieldEnum];
export declare const ContactScalarFieldEnum: {
    readonly id: "id";
    readonly type: "type";
    readonly name: "name";
    readonly shortName: "shortName";
    readonly taxNo: "taxNo";
    readonly phone: "phone";
    readonly email: "email";
    readonly notes: "notes";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ContactScalarFieldEnum = (typeof ContactScalarFieldEnum)[keyof typeof ContactScalarFieldEnum];
export declare const AttachmentScalarFieldEnum: {
    readonly id: "id";
    readonly path: "path";
    readonly filename: "filename";
    readonly mimeType: "mimeType";
    readonly size: "size";
    readonly uploaderId: "uploaderId";
    readonly createdAt: "createdAt";
};
export type AttachmentScalarFieldEnum = (typeof AttachmentScalarFieldEnum)[keyof typeof AttachmentScalarFieldEnum];
export declare const TransactionScalarFieldEnum: {
    readonly id: "id";
    readonly txnNo: "txnNo";
    readonly method: "method";
    readonly type: "type";
    readonly direction: "direction";
    readonly amount: "amount";
    readonly currency: "currency";
    readonly txnDate: "txnDate";
    readonly description: "description";
    readonly note: "note";
    readonly channelReference: "channelReference";
    readonly category: "category";
    readonly bankAccountId: "bankAccountId";
    readonly cardId: "cardId";
    readonly contactId: "contactId";
    readonly checkId: "checkId";
    readonly createdById: "createdById";
    readonly posBrut: "posBrut";
    readonly posKomisyon: "posKomisyon";
    readonly posNet: "posNet";
    readonly posEffectiveRate: "posEffectiveRate";
    readonly meta: "meta";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum];
export declare const CheckScalarFieldEnum: {
    readonly id: "id";
    readonly serialNo: "serialNo";
    readonly bank: "bank";
    readonly amount: "amount";
    readonly dueDate: "dueDate";
    readonly status: "status";
    readonly contactId: "contactId";
    readonly attachmentId: "attachmentId";
    readonly notes: "notes";
    readonly issuedBy: "issuedBy";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CheckScalarFieldEnum = (typeof CheckScalarFieldEnum)[keyof typeof CheckScalarFieldEnum];
export declare const CheckMoveScalarFieldEnum: {
    readonly id: "id";
    readonly checkId: "checkId";
    readonly action: "action";
    readonly transactionId: "transactionId";
    readonly description: "description";
    readonly performedById: "performedById";
    readonly performedAt: "performedAt";
};
export type CheckMoveScalarFieldEnum = (typeof CheckMoveScalarFieldEnum)[keyof typeof CheckMoveScalarFieldEnum];
export declare const TagScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly color: "color";
    readonly createdAt: "createdAt";
};
export type TagScalarFieldEnum = (typeof TagScalarFieldEnum)[keyof typeof TagScalarFieldEnum];
export declare const TxnTagScalarFieldEnum: {
    readonly transactionId: "transactionId";
    readonly tagId: "tagId";
};
export type TxnTagScalarFieldEnum = (typeof TxnTagScalarFieldEnum)[keyof typeof TxnTagScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: any;
    readonly JsonNull: any;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: any;
    readonly JsonNull: any;
    readonly AnyNull: any;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map