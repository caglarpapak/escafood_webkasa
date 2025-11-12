import type * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model Transaction
 *
 */
export type TransactionModel = runtime.Types.Result.DefaultSelection<Prisma.$TransactionPayload>;
export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null;
    _avg: TransactionAvgAggregateOutputType | null;
    _sum: TransactionSumAggregateOutputType | null;
    _min: TransactionMinAggregateOutputType | null;
    _max: TransactionMaxAggregateOutputType | null;
};
export type TransactionAvgAggregateOutputType = {
    amount: runtime.Decimal | null;
    posBrut: runtime.Decimal | null;
    posKomisyon: runtime.Decimal | null;
    posNet: runtime.Decimal | null;
    posEffectiveRate: runtime.Decimal | null;
};
export type TransactionSumAggregateOutputType = {
    amount: runtime.Decimal | null;
    posBrut: runtime.Decimal | null;
    posKomisyon: runtime.Decimal | null;
    posNet: runtime.Decimal | null;
    posEffectiveRate: runtime.Decimal | null;
};
export type TransactionMinAggregateOutputType = {
    id: string | null;
    txnNo: string | null;
    method: $Enums.TransactionMethod | null;
    type: $Enums.TransactionType | null;
    direction: $Enums.TransactionDirection | null;
    amount: runtime.Decimal | null;
    currency: string | null;
    txnDate: Date | null;
    description: string | null;
    note: string | null;
    channelReference: string | null;
    category: $Enums.TransactionCategory | null;
    bankAccountId: string | null;
    cardId: string | null;
    contactId: string | null;
    checkId: string | null;
    createdById: string | null;
    posBrut: runtime.Decimal | null;
    posKomisyon: runtime.Decimal | null;
    posNet: runtime.Decimal | null;
    posEffectiveRate: runtime.Decimal | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TransactionMaxAggregateOutputType = {
    id: string | null;
    txnNo: string | null;
    method: $Enums.TransactionMethod | null;
    type: $Enums.TransactionType | null;
    direction: $Enums.TransactionDirection | null;
    amount: runtime.Decimal | null;
    currency: string | null;
    txnDate: Date | null;
    description: string | null;
    note: string | null;
    channelReference: string | null;
    category: $Enums.TransactionCategory | null;
    bankAccountId: string | null;
    cardId: string | null;
    contactId: string | null;
    checkId: string | null;
    createdById: string | null;
    posBrut: runtime.Decimal | null;
    posKomisyon: runtime.Decimal | null;
    posNet: runtime.Decimal | null;
    posEffectiveRate: runtime.Decimal | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TransactionCountAggregateOutputType = {
    id: number;
    txnNo: number;
    method: number;
    type: number;
    direction: number;
    amount: number;
    currency: number;
    txnDate: number;
    description: number;
    note: number;
    channelReference: number;
    category: number;
    bankAccountId: number;
    cardId: number;
    contactId: number;
    checkId: number;
    createdById: number;
    posBrut: number;
    posKomisyon: number;
    posNet: number;
    posEffectiveRate: number;
    meta: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TransactionAvgAggregateInputType = {
    amount?: true;
    posBrut?: true;
    posKomisyon?: true;
    posNet?: true;
    posEffectiveRate?: true;
};
export type TransactionSumAggregateInputType = {
    amount?: true;
    posBrut?: true;
    posKomisyon?: true;
    posNet?: true;
    posEffectiveRate?: true;
};
export type TransactionMinAggregateInputType = {
    id?: true;
    txnNo?: true;
    method?: true;
    type?: true;
    direction?: true;
    amount?: true;
    currency?: true;
    txnDate?: true;
    description?: true;
    note?: true;
    channelReference?: true;
    category?: true;
    bankAccountId?: true;
    cardId?: true;
    contactId?: true;
    checkId?: true;
    createdById?: true;
    posBrut?: true;
    posKomisyon?: true;
    posNet?: true;
    posEffectiveRate?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TransactionMaxAggregateInputType = {
    id?: true;
    txnNo?: true;
    method?: true;
    type?: true;
    direction?: true;
    amount?: true;
    currency?: true;
    txnDate?: true;
    description?: true;
    note?: true;
    channelReference?: true;
    category?: true;
    bankAccountId?: true;
    cardId?: true;
    contactId?: true;
    checkId?: true;
    createdById?: true;
    posBrut?: true;
    posKomisyon?: true;
    posNet?: true;
    posEffectiveRate?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TransactionCountAggregateInputType = {
    id?: true;
    txnNo?: true;
    method?: true;
    type?: true;
    direction?: true;
    amount?: true;
    currency?: true;
    txnDate?: true;
    description?: true;
    note?: true;
    channelReference?: true;
    category?: true;
    bankAccountId?: true;
    cardId?: true;
    contactId?: true;
    checkId?: true;
    createdById?: true;
    posBrut?: true;
    posKomisyon?: true;
    posNet?: true;
    posEffectiveRate?: true;
    meta?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TransactionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: Prisma.TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: Prisma.TransactionOrderByWithRelationInput | Prisma.TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Transactions
    **/
    _count?: true | TransactionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: TransactionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: TransactionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: TransactionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: TransactionMaxAggregateInputType;
};
export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
    [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTransaction[P]> : Prisma.GetScalarType<T[P], AggregateTransaction[P]>;
};
export type TransactionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TransactionWhereInput;
    orderBy?: Prisma.TransactionOrderByWithAggregationInput | Prisma.TransactionOrderByWithAggregationInput[];
    by: Prisma.TransactionScalarFieldEnum[] | Prisma.TransactionScalarFieldEnum;
    having?: Prisma.TransactionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TransactionCountAggregateInputType | true;
    _avg?: TransactionAvgAggregateInputType;
    _sum?: TransactionSumAggregateInputType;
    _min?: TransactionMinAggregateInputType;
    _max?: TransactionMaxAggregateInputType;
};
export type TransactionGroupByOutputType = {
    id: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal;
    currency: string;
    txnDate: Date;
    description: string | null;
    note: string | null;
    channelReference: string | null;
    category: $Enums.TransactionCategory | null;
    bankAccountId: string | null;
    cardId: string | null;
    contactId: string | null;
    checkId: string | null;
    createdById: string;
    posBrut: runtime.Decimal | null;
    posKomisyon: runtime.Decimal | null;
    posNet: runtime.Decimal | null;
    posEffectiveRate: runtime.Decimal | null;
    meta: runtime.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TransactionCountAggregateOutputType | null;
    _avg: TransactionAvgAggregateOutputType | null;
    _sum: TransactionSumAggregateOutputType | null;
    _min: TransactionMinAggregateOutputType | null;
    _max: TransactionMaxAggregateOutputType | null;
};
type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TransactionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TransactionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TransactionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TransactionGroupByOutputType[P]>;
}>>;
export type TransactionWhereInput = {
    AND?: Prisma.TransactionWhereInput | Prisma.TransactionWhereInput[];
    OR?: Prisma.TransactionWhereInput[];
    NOT?: Prisma.TransactionWhereInput | Prisma.TransactionWhereInput[];
    id?: Prisma.StringFilter<"Transaction"> | string;
    txnNo?: Prisma.StringFilter<"Transaction"> | string;
    method?: Prisma.EnumTransactionMethodFilter<"Transaction"> | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFilter<"Transaction"> | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFilter<"Transaction"> | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFilter<"Transaction"> | string;
    txnDate?: Prisma.DateTimeFilter<"Transaction"> | Date | string;
    description?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    note?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    channelReference?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    category?: Prisma.EnumTransactionCategoryNullableFilter<"Transaction"> | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    cardId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    contactId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    checkId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    createdById?: Prisma.StringFilter<"Transaction"> | string;
    posBrut?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.JsonNullableFilter<"Transaction">;
    createdAt?: Prisma.DateTimeFilter<"Transaction"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Transaction"> | Date | string;
    bankAccount?: Prisma.XOR<Prisma.BankAccountNullableScalarRelationFilter, Prisma.BankAccountWhereInput> | null;
    card?: Prisma.XOR<Prisma.CardNullableScalarRelationFilter, Prisma.CardWhereInput> | null;
    contact?: Prisma.XOR<Prisma.ContactNullableScalarRelationFilter, Prisma.ContactWhereInput> | null;
    check?: Prisma.XOR<Prisma.CheckNullableScalarRelationFilter, Prisma.CheckWhereInput> | null;
    createdBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tags?: Prisma.TxnTagListRelationFilter;
    checkMoves?: Prisma.CheckMoveListRelationFilter;
};
export type TransactionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    txnNo?: Prisma.SortOrder;
    method?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    direction?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    currency?: Prisma.SortOrder;
    txnDate?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    channelReference?: Prisma.SortOrderInput | Prisma.SortOrder;
    category?: Prisma.SortOrderInput | Prisma.SortOrder;
    bankAccountId?: Prisma.SortOrderInput | Prisma.SortOrder;
    cardId?: Prisma.SortOrderInput | Prisma.SortOrder;
    contactId?: Prisma.SortOrderInput | Prisma.SortOrder;
    checkId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    posBrut?: Prisma.SortOrderInput | Prisma.SortOrder;
    posKomisyon?: Prisma.SortOrderInput | Prisma.SortOrder;
    posNet?: Prisma.SortOrderInput | Prisma.SortOrder;
    posEffectiveRate?: Prisma.SortOrderInput | Prisma.SortOrder;
    meta?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    bankAccount?: Prisma.BankAccountOrderByWithRelationInput;
    card?: Prisma.CardOrderByWithRelationInput;
    contact?: Prisma.ContactOrderByWithRelationInput;
    check?: Prisma.CheckOrderByWithRelationInput;
    createdBy?: Prisma.UserOrderByWithRelationInput;
    tags?: Prisma.TxnTagOrderByRelationAggregateInput;
    checkMoves?: Prisma.CheckMoveOrderByRelationAggregateInput;
};
export type TransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    txnNo?: string;
    AND?: Prisma.TransactionWhereInput | Prisma.TransactionWhereInput[];
    OR?: Prisma.TransactionWhereInput[];
    NOT?: Prisma.TransactionWhereInput | Prisma.TransactionWhereInput[];
    method?: Prisma.EnumTransactionMethodFilter<"Transaction"> | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFilter<"Transaction"> | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFilter<"Transaction"> | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFilter<"Transaction"> | string;
    txnDate?: Prisma.DateTimeFilter<"Transaction"> | Date | string;
    description?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    note?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    channelReference?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    category?: Prisma.EnumTransactionCategoryNullableFilter<"Transaction"> | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    cardId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    contactId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    checkId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    createdById?: Prisma.StringFilter<"Transaction"> | string;
    posBrut?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.JsonNullableFilter<"Transaction">;
    createdAt?: Prisma.DateTimeFilter<"Transaction"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Transaction"> | Date | string;
    bankAccount?: Prisma.XOR<Prisma.BankAccountNullableScalarRelationFilter, Prisma.BankAccountWhereInput> | null;
    card?: Prisma.XOR<Prisma.CardNullableScalarRelationFilter, Prisma.CardWhereInput> | null;
    contact?: Prisma.XOR<Prisma.ContactNullableScalarRelationFilter, Prisma.ContactWhereInput> | null;
    check?: Prisma.XOR<Prisma.CheckNullableScalarRelationFilter, Prisma.CheckWhereInput> | null;
    createdBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tags?: Prisma.TxnTagListRelationFilter;
    checkMoves?: Prisma.CheckMoveListRelationFilter;
}, "id" | "txnNo">;
export type TransactionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    txnNo?: Prisma.SortOrder;
    method?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    direction?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    currency?: Prisma.SortOrder;
    txnDate?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    channelReference?: Prisma.SortOrderInput | Prisma.SortOrder;
    category?: Prisma.SortOrderInput | Prisma.SortOrder;
    bankAccountId?: Prisma.SortOrderInput | Prisma.SortOrder;
    cardId?: Prisma.SortOrderInput | Prisma.SortOrder;
    contactId?: Prisma.SortOrderInput | Prisma.SortOrder;
    checkId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    posBrut?: Prisma.SortOrderInput | Prisma.SortOrder;
    posKomisyon?: Prisma.SortOrderInput | Prisma.SortOrder;
    posNet?: Prisma.SortOrderInput | Prisma.SortOrder;
    posEffectiveRate?: Prisma.SortOrderInput | Prisma.SortOrder;
    meta?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TransactionCountOrderByAggregateInput;
    _avg?: Prisma.TransactionAvgOrderByAggregateInput;
    _max?: Prisma.TransactionMaxOrderByAggregateInput;
    _min?: Prisma.TransactionMinOrderByAggregateInput;
    _sum?: Prisma.TransactionSumOrderByAggregateInput;
};
export type TransactionScalarWhereWithAggregatesInput = {
    AND?: Prisma.TransactionScalarWhereWithAggregatesInput | Prisma.TransactionScalarWhereWithAggregatesInput[];
    OR?: Prisma.TransactionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TransactionScalarWhereWithAggregatesInput | Prisma.TransactionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Transaction"> | string;
    txnNo?: Prisma.StringWithAggregatesFilter<"Transaction"> | string;
    method?: Prisma.EnumTransactionMethodWithAggregatesFilter<"Transaction"> | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeWithAggregatesFilter<"Transaction"> | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionWithAggregatesFilter<"Transaction"> | $Enums.TransactionDirection;
    amount?: Prisma.DecimalWithAggregatesFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringWithAggregatesFilter<"Transaction"> | string;
    txnDate?: Prisma.DateTimeWithAggregatesFilter<"Transaction"> | Date | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"Transaction"> | string | null;
    note?: Prisma.StringNullableWithAggregatesFilter<"Transaction"> | string | null;
    channelReference?: Prisma.StringNullableWithAggregatesFilter<"Transaction"> | string | null;
    category?: Prisma.EnumTransactionCategoryNullableWithAggregatesFilter<"Transaction"> | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.StringNullableWithAggregatesFilter<"Transaction"> | string | null;
    cardId?: Prisma.StringNullableWithAggregatesFilter<"Transaction"> | string | null;
    contactId?: Prisma.StringNullableWithAggregatesFilter<"Transaction"> | string | null;
    checkId?: Prisma.StringNullableWithAggregatesFilter<"Transaction"> | string | null;
    createdById?: Prisma.StringWithAggregatesFilter<"Transaction"> | string;
    posBrut?: Prisma.DecimalNullableWithAggregatesFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.DecimalNullableWithAggregatesFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.DecimalNullableWithAggregatesFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.DecimalNullableWithAggregatesFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.JsonNullableWithAggregatesFilter<"Transaction">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Transaction"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Transaction"> | Date | string;
};
export type TransactionCreateInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccount?: Prisma.BankAccountCreateNestedOneWithoutTransactionsInput;
    card?: Prisma.CardCreateNestedOneWithoutTransactionsInput;
    contact?: Prisma.ContactCreateNestedOneWithoutTransactionsInput;
    check?: Prisma.CheckCreateNestedOneWithoutTransactionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutTransactionsInput;
    tags?: Prisma.TxnTagCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveCreateNestedManyWithoutTransactionInput;
};
export type TransactionUncheckedCreateInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    contactId?: string | null;
    checkId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tags?: Prisma.TxnTagUncheckedCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutTransactionInput;
};
export type TransactionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccount?: Prisma.BankAccountUpdateOneWithoutTransactionsNestedInput;
    card?: Prisma.CardUpdateOneWithoutTransactionsNestedInput;
    contact?: Prisma.ContactUpdateOneWithoutTransactionsNestedInput;
    check?: Prisma.CheckUpdateOneWithoutTransactionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutTransactionsNestedInput;
    tags?: Prisma.TxnTagUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tags?: Prisma.TxnTagUncheckedUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUncheckedUpdateManyWithoutTransactionNestedInput;
};
export type TransactionCreateManyInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    contactId?: string | null;
    checkId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TransactionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TransactionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TransactionListRelationFilter = {
    every?: Prisma.TransactionWhereInput;
    some?: Prisma.TransactionWhereInput;
    none?: Prisma.TransactionWhereInput;
};
export type TransactionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TransactionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    txnNo?: Prisma.SortOrder;
    method?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    direction?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    currency?: Prisma.SortOrder;
    txnDate?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    channelReference?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    bankAccountId?: Prisma.SortOrder;
    cardId?: Prisma.SortOrder;
    contactId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    posBrut?: Prisma.SortOrder;
    posKomisyon?: Prisma.SortOrder;
    posNet?: Prisma.SortOrder;
    posEffectiveRate?: Prisma.SortOrder;
    meta?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TransactionAvgOrderByAggregateInput = {
    amount?: Prisma.SortOrder;
    posBrut?: Prisma.SortOrder;
    posKomisyon?: Prisma.SortOrder;
    posNet?: Prisma.SortOrder;
    posEffectiveRate?: Prisma.SortOrder;
};
export type TransactionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    txnNo?: Prisma.SortOrder;
    method?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    direction?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    currency?: Prisma.SortOrder;
    txnDate?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    channelReference?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    bankAccountId?: Prisma.SortOrder;
    cardId?: Prisma.SortOrder;
    contactId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    posBrut?: Prisma.SortOrder;
    posKomisyon?: Prisma.SortOrder;
    posNet?: Prisma.SortOrder;
    posEffectiveRate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TransactionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    txnNo?: Prisma.SortOrder;
    method?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    direction?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    currency?: Prisma.SortOrder;
    txnDate?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    channelReference?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    bankAccountId?: Prisma.SortOrder;
    cardId?: Prisma.SortOrder;
    contactId?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    posBrut?: Prisma.SortOrder;
    posKomisyon?: Prisma.SortOrder;
    posNet?: Prisma.SortOrder;
    posEffectiveRate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TransactionSumOrderByAggregateInput = {
    amount?: Prisma.SortOrder;
    posBrut?: Prisma.SortOrder;
    posKomisyon?: Prisma.SortOrder;
    posNet?: Prisma.SortOrder;
    posEffectiveRate?: Prisma.SortOrder;
};
export type TransactionNullableScalarRelationFilter = {
    is?: Prisma.TransactionWhereInput | null;
    isNot?: Prisma.TransactionWhereInput | null;
};
export type TransactionScalarRelationFilter = {
    is?: Prisma.TransactionWhereInput;
    isNot?: Prisma.TransactionWhereInput;
};
export type TransactionCreateNestedManyWithoutCreatedByInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCreatedByInput, Prisma.TransactionUncheckedCreateWithoutCreatedByInput> | Prisma.TransactionCreateWithoutCreatedByInput[] | Prisma.TransactionUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCreatedByInput | Prisma.TransactionCreateOrConnectWithoutCreatedByInput[];
    createMany?: Prisma.TransactionCreateManyCreatedByInputEnvelope;
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
};
export type TransactionUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCreatedByInput, Prisma.TransactionUncheckedCreateWithoutCreatedByInput> | Prisma.TransactionCreateWithoutCreatedByInput[] | Prisma.TransactionUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCreatedByInput | Prisma.TransactionCreateOrConnectWithoutCreatedByInput[];
    createMany?: Prisma.TransactionCreateManyCreatedByInputEnvelope;
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
};
export type TransactionUpdateManyWithoutCreatedByNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCreatedByInput, Prisma.TransactionUncheckedCreateWithoutCreatedByInput> | Prisma.TransactionCreateWithoutCreatedByInput[] | Prisma.TransactionUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCreatedByInput | Prisma.TransactionCreateOrConnectWithoutCreatedByInput[];
    upsert?: Prisma.TransactionUpsertWithWhereUniqueWithoutCreatedByInput | Prisma.TransactionUpsertWithWhereUniqueWithoutCreatedByInput[];
    createMany?: Prisma.TransactionCreateManyCreatedByInputEnvelope;
    set?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    disconnect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    delete?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    update?: Prisma.TransactionUpdateWithWhereUniqueWithoutCreatedByInput | Prisma.TransactionUpdateWithWhereUniqueWithoutCreatedByInput[];
    updateMany?: Prisma.TransactionUpdateManyWithWhereWithoutCreatedByInput | Prisma.TransactionUpdateManyWithWhereWithoutCreatedByInput[];
    deleteMany?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
};
export type TransactionUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCreatedByInput, Prisma.TransactionUncheckedCreateWithoutCreatedByInput> | Prisma.TransactionCreateWithoutCreatedByInput[] | Prisma.TransactionUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCreatedByInput | Prisma.TransactionCreateOrConnectWithoutCreatedByInput[];
    upsert?: Prisma.TransactionUpsertWithWhereUniqueWithoutCreatedByInput | Prisma.TransactionUpsertWithWhereUniqueWithoutCreatedByInput[];
    createMany?: Prisma.TransactionCreateManyCreatedByInputEnvelope;
    set?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    disconnect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    delete?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    update?: Prisma.TransactionUpdateWithWhereUniqueWithoutCreatedByInput | Prisma.TransactionUpdateWithWhereUniqueWithoutCreatedByInput[];
    updateMany?: Prisma.TransactionUpdateManyWithWhereWithoutCreatedByInput | Prisma.TransactionUpdateManyWithWhereWithoutCreatedByInput[];
    deleteMany?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
};
export type TransactionCreateNestedManyWithoutBankAccountInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutBankAccountInput, Prisma.TransactionUncheckedCreateWithoutBankAccountInput> | Prisma.TransactionCreateWithoutBankAccountInput[] | Prisma.TransactionUncheckedCreateWithoutBankAccountInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutBankAccountInput | Prisma.TransactionCreateOrConnectWithoutBankAccountInput[];
    createMany?: Prisma.TransactionCreateManyBankAccountInputEnvelope;
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
};
export type TransactionUncheckedCreateNestedManyWithoutBankAccountInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutBankAccountInput, Prisma.TransactionUncheckedCreateWithoutBankAccountInput> | Prisma.TransactionCreateWithoutBankAccountInput[] | Prisma.TransactionUncheckedCreateWithoutBankAccountInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutBankAccountInput | Prisma.TransactionCreateOrConnectWithoutBankAccountInput[];
    createMany?: Prisma.TransactionCreateManyBankAccountInputEnvelope;
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
};
export type TransactionUpdateManyWithoutBankAccountNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutBankAccountInput, Prisma.TransactionUncheckedCreateWithoutBankAccountInput> | Prisma.TransactionCreateWithoutBankAccountInput[] | Prisma.TransactionUncheckedCreateWithoutBankAccountInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutBankAccountInput | Prisma.TransactionCreateOrConnectWithoutBankAccountInput[];
    upsert?: Prisma.TransactionUpsertWithWhereUniqueWithoutBankAccountInput | Prisma.TransactionUpsertWithWhereUniqueWithoutBankAccountInput[];
    createMany?: Prisma.TransactionCreateManyBankAccountInputEnvelope;
    set?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    disconnect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    delete?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    update?: Prisma.TransactionUpdateWithWhereUniqueWithoutBankAccountInput | Prisma.TransactionUpdateWithWhereUniqueWithoutBankAccountInput[];
    updateMany?: Prisma.TransactionUpdateManyWithWhereWithoutBankAccountInput | Prisma.TransactionUpdateManyWithWhereWithoutBankAccountInput[];
    deleteMany?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
};
export type TransactionUncheckedUpdateManyWithoutBankAccountNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutBankAccountInput, Prisma.TransactionUncheckedCreateWithoutBankAccountInput> | Prisma.TransactionCreateWithoutBankAccountInput[] | Prisma.TransactionUncheckedCreateWithoutBankAccountInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutBankAccountInput | Prisma.TransactionCreateOrConnectWithoutBankAccountInput[];
    upsert?: Prisma.TransactionUpsertWithWhereUniqueWithoutBankAccountInput | Prisma.TransactionUpsertWithWhereUniqueWithoutBankAccountInput[];
    createMany?: Prisma.TransactionCreateManyBankAccountInputEnvelope;
    set?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    disconnect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    delete?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    update?: Prisma.TransactionUpdateWithWhereUniqueWithoutBankAccountInput | Prisma.TransactionUpdateWithWhereUniqueWithoutBankAccountInput[];
    updateMany?: Prisma.TransactionUpdateManyWithWhereWithoutBankAccountInput | Prisma.TransactionUpdateManyWithWhereWithoutBankAccountInput[];
    deleteMany?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
};
export type TransactionCreateNestedManyWithoutCardInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCardInput, Prisma.TransactionUncheckedCreateWithoutCardInput> | Prisma.TransactionCreateWithoutCardInput[] | Prisma.TransactionUncheckedCreateWithoutCardInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCardInput | Prisma.TransactionCreateOrConnectWithoutCardInput[];
    createMany?: Prisma.TransactionCreateManyCardInputEnvelope;
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
};
export type TransactionUncheckedCreateNestedManyWithoutCardInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCardInput, Prisma.TransactionUncheckedCreateWithoutCardInput> | Prisma.TransactionCreateWithoutCardInput[] | Prisma.TransactionUncheckedCreateWithoutCardInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCardInput | Prisma.TransactionCreateOrConnectWithoutCardInput[];
    createMany?: Prisma.TransactionCreateManyCardInputEnvelope;
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
};
export type TransactionUpdateManyWithoutCardNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCardInput, Prisma.TransactionUncheckedCreateWithoutCardInput> | Prisma.TransactionCreateWithoutCardInput[] | Prisma.TransactionUncheckedCreateWithoutCardInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCardInput | Prisma.TransactionCreateOrConnectWithoutCardInput[];
    upsert?: Prisma.TransactionUpsertWithWhereUniqueWithoutCardInput | Prisma.TransactionUpsertWithWhereUniqueWithoutCardInput[];
    createMany?: Prisma.TransactionCreateManyCardInputEnvelope;
    set?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    disconnect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    delete?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    update?: Prisma.TransactionUpdateWithWhereUniqueWithoutCardInput | Prisma.TransactionUpdateWithWhereUniqueWithoutCardInput[];
    updateMany?: Prisma.TransactionUpdateManyWithWhereWithoutCardInput | Prisma.TransactionUpdateManyWithWhereWithoutCardInput[];
    deleteMany?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
};
export type TransactionUncheckedUpdateManyWithoutCardNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCardInput, Prisma.TransactionUncheckedCreateWithoutCardInput> | Prisma.TransactionCreateWithoutCardInput[] | Prisma.TransactionUncheckedCreateWithoutCardInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCardInput | Prisma.TransactionCreateOrConnectWithoutCardInput[];
    upsert?: Prisma.TransactionUpsertWithWhereUniqueWithoutCardInput | Prisma.TransactionUpsertWithWhereUniqueWithoutCardInput[];
    createMany?: Prisma.TransactionCreateManyCardInputEnvelope;
    set?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    disconnect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    delete?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    update?: Prisma.TransactionUpdateWithWhereUniqueWithoutCardInput | Prisma.TransactionUpdateWithWhereUniqueWithoutCardInput[];
    updateMany?: Prisma.TransactionUpdateManyWithWhereWithoutCardInput | Prisma.TransactionUpdateManyWithWhereWithoutCardInput[];
    deleteMany?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
};
export type TransactionCreateNestedManyWithoutContactInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutContactInput, Prisma.TransactionUncheckedCreateWithoutContactInput> | Prisma.TransactionCreateWithoutContactInput[] | Prisma.TransactionUncheckedCreateWithoutContactInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutContactInput | Prisma.TransactionCreateOrConnectWithoutContactInput[];
    createMany?: Prisma.TransactionCreateManyContactInputEnvelope;
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
};
export type TransactionUncheckedCreateNestedManyWithoutContactInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutContactInput, Prisma.TransactionUncheckedCreateWithoutContactInput> | Prisma.TransactionCreateWithoutContactInput[] | Prisma.TransactionUncheckedCreateWithoutContactInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutContactInput | Prisma.TransactionCreateOrConnectWithoutContactInput[];
    createMany?: Prisma.TransactionCreateManyContactInputEnvelope;
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
};
export type TransactionUpdateManyWithoutContactNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutContactInput, Prisma.TransactionUncheckedCreateWithoutContactInput> | Prisma.TransactionCreateWithoutContactInput[] | Prisma.TransactionUncheckedCreateWithoutContactInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutContactInput | Prisma.TransactionCreateOrConnectWithoutContactInput[];
    upsert?: Prisma.TransactionUpsertWithWhereUniqueWithoutContactInput | Prisma.TransactionUpsertWithWhereUniqueWithoutContactInput[];
    createMany?: Prisma.TransactionCreateManyContactInputEnvelope;
    set?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    disconnect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    delete?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    update?: Prisma.TransactionUpdateWithWhereUniqueWithoutContactInput | Prisma.TransactionUpdateWithWhereUniqueWithoutContactInput[];
    updateMany?: Prisma.TransactionUpdateManyWithWhereWithoutContactInput | Prisma.TransactionUpdateManyWithWhereWithoutContactInput[];
    deleteMany?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
};
export type TransactionUncheckedUpdateManyWithoutContactNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutContactInput, Prisma.TransactionUncheckedCreateWithoutContactInput> | Prisma.TransactionCreateWithoutContactInput[] | Prisma.TransactionUncheckedCreateWithoutContactInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutContactInput | Prisma.TransactionCreateOrConnectWithoutContactInput[];
    upsert?: Prisma.TransactionUpsertWithWhereUniqueWithoutContactInput | Prisma.TransactionUpsertWithWhereUniqueWithoutContactInput[];
    createMany?: Prisma.TransactionCreateManyContactInputEnvelope;
    set?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    disconnect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    delete?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    update?: Prisma.TransactionUpdateWithWhereUniqueWithoutContactInput | Prisma.TransactionUpdateWithWhereUniqueWithoutContactInput[];
    updateMany?: Prisma.TransactionUpdateManyWithWhereWithoutContactInput | Prisma.TransactionUpdateManyWithWhereWithoutContactInput[];
    deleteMany?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
};
export type EnumTransactionMethodFieldUpdateOperationsInput = {
    set?: $Enums.TransactionMethod;
};
export type EnumTransactionTypeFieldUpdateOperationsInput = {
    set?: $Enums.TransactionType;
};
export type EnumTransactionDirectionFieldUpdateOperationsInput = {
    set?: $Enums.TransactionDirection;
};
export type NullableEnumTransactionCategoryFieldUpdateOperationsInput = {
    set?: $Enums.TransactionCategory | null;
};
export type NullableDecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type TransactionCreateNestedManyWithoutCheckInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCheckInput, Prisma.TransactionUncheckedCreateWithoutCheckInput> | Prisma.TransactionCreateWithoutCheckInput[] | Prisma.TransactionUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCheckInput | Prisma.TransactionCreateOrConnectWithoutCheckInput[];
    createMany?: Prisma.TransactionCreateManyCheckInputEnvelope;
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
};
export type TransactionUncheckedCreateNestedManyWithoutCheckInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCheckInput, Prisma.TransactionUncheckedCreateWithoutCheckInput> | Prisma.TransactionCreateWithoutCheckInput[] | Prisma.TransactionUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCheckInput | Prisma.TransactionCreateOrConnectWithoutCheckInput[];
    createMany?: Prisma.TransactionCreateManyCheckInputEnvelope;
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
};
export type TransactionUpdateManyWithoutCheckNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCheckInput, Prisma.TransactionUncheckedCreateWithoutCheckInput> | Prisma.TransactionCreateWithoutCheckInput[] | Prisma.TransactionUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCheckInput | Prisma.TransactionCreateOrConnectWithoutCheckInput[];
    upsert?: Prisma.TransactionUpsertWithWhereUniqueWithoutCheckInput | Prisma.TransactionUpsertWithWhereUniqueWithoutCheckInput[];
    createMany?: Prisma.TransactionCreateManyCheckInputEnvelope;
    set?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    disconnect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    delete?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    update?: Prisma.TransactionUpdateWithWhereUniqueWithoutCheckInput | Prisma.TransactionUpdateWithWhereUniqueWithoutCheckInput[];
    updateMany?: Prisma.TransactionUpdateManyWithWhereWithoutCheckInput | Prisma.TransactionUpdateManyWithWhereWithoutCheckInput[];
    deleteMany?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
};
export type TransactionUncheckedUpdateManyWithoutCheckNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCheckInput, Prisma.TransactionUncheckedCreateWithoutCheckInput> | Prisma.TransactionCreateWithoutCheckInput[] | Prisma.TransactionUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCheckInput | Prisma.TransactionCreateOrConnectWithoutCheckInput[];
    upsert?: Prisma.TransactionUpsertWithWhereUniqueWithoutCheckInput | Prisma.TransactionUpsertWithWhereUniqueWithoutCheckInput[];
    createMany?: Prisma.TransactionCreateManyCheckInputEnvelope;
    set?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    disconnect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    delete?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    connect?: Prisma.TransactionWhereUniqueInput | Prisma.TransactionWhereUniqueInput[];
    update?: Prisma.TransactionUpdateWithWhereUniqueWithoutCheckInput | Prisma.TransactionUpdateWithWhereUniqueWithoutCheckInput[];
    updateMany?: Prisma.TransactionUpdateManyWithWhereWithoutCheckInput | Prisma.TransactionUpdateManyWithWhereWithoutCheckInput[];
    deleteMany?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
};
export type TransactionCreateNestedOneWithoutCheckMovesInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCheckMovesInput, Prisma.TransactionUncheckedCreateWithoutCheckMovesInput>;
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCheckMovesInput;
    connect?: Prisma.TransactionWhereUniqueInput;
};
export type TransactionUpdateOneWithoutCheckMovesNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutCheckMovesInput, Prisma.TransactionUncheckedCreateWithoutCheckMovesInput>;
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutCheckMovesInput;
    upsert?: Prisma.TransactionUpsertWithoutCheckMovesInput;
    disconnect?: Prisma.TransactionWhereInput | boolean;
    delete?: Prisma.TransactionWhereInput | boolean;
    connect?: Prisma.TransactionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TransactionUpdateToOneWithWhereWithoutCheckMovesInput, Prisma.TransactionUpdateWithoutCheckMovesInput>, Prisma.TransactionUncheckedUpdateWithoutCheckMovesInput>;
};
export type TransactionCreateNestedOneWithoutTagsInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutTagsInput, Prisma.TransactionUncheckedCreateWithoutTagsInput>;
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutTagsInput;
    connect?: Prisma.TransactionWhereUniqueInput;
};
export type TransactionUpdateOneRequiredWithoutTagsNestedInput = {
    create?: Prisma.XOR<Prisma.TransactionCreateWithoutTagsInput, Prisma.TransactionUncheckedCreateWithoutTagsInput>;
    connectOrCreate?: Prisma.TransactionCreateOrConnectWithoutTagsInput;
    upsert?: Prisma.TransactionUpsertWithoutTagsInput;
    connect?: Prisma.TransactionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TransactionUpdateToOneWithWhereWithoutTagsInput, Prisma.TransactionUpdateWithoutTagsInput>, Prisma.TransactionUncheckedUpdateWithoutTagsInput>;
};
export type TransactionCreateWithoutCreatedByInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccount?: Prisma.BankAccountCreateNestedOneWithoutTransactionsInput;
    card?: Prisma.CardCreateNestedOneWithoutTransactionsInput;
    contact?: Prisma.ContactCreateNestedOneWithoutTransactionsInput;
    check?: Prisma.CheckCreateNestedOneWithoutTransactionsInput;
    tags?: Prisma.TxnTagCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveCreateNestedManyWithoutTransactionInput;
};
export type TransactionUncheckedCreateWithoutCreatedByInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    contactId?: string | null;
    checkId?: string | null;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tags?: Prisma.TxnTagUncheckedCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutTransactionInput;
};
export type TransactionCreateOrConnectWithoutCreatedByInput = {
    where: Prisma.TransactionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutCreatedByInput, Prisma.TransactionUncheckedCreateWithoutCreatedByInput>;
};
export type TransactionCreateManyCreatedByInputEnvelope = {
    data: Prisma.TransactionCreateManyCreatedByInput | Prisma.TransactionCreateManyCreatedByInput[];
    skipDuplicates?: boolean;
};
export type TransactionUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: Prisma.TransactionWhereUniqueInput;
    update: Prisma.XOR<Prisma.TransactionUpdateWithoutCreatedByInput, Prisma.TransactionUncheckedUpdateWithoutCreatedByInput>;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutCreatedByInput, Prisma.TransactionUncheckedCreateWithoutCreatedByInput>;
};
export type TransactionUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: Prisma.TransactionWhereUniqueInput;
    data: Prisma.XOR<Prisma.TransactionUpdateWithoutCreatedByInput, Prisma.TransactionUncheckedUpdateWithoutCreatedByInput>;
};
export type TransactionUpdateManyWithWhereWithoutCreatedByInput = {
    where: Prisma.TransactionScalarWhereInput;
    data: Prisma.XOR<Prisma.TransactionUpdateManyMutationInput, Prisma.TransactionUncheckedUpdateManyWithoutCreatedByInput>;
};
export type TransactionScalarWhereInput = {
    AND?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
    OR?: Prisma.TransactionScalarWhereInput[];
    NOT?: Prisma.TransactionScalarWhereInput | Prisma.TransactionScalarWhereInput[];
    id?: Prisma.StringFilter<"Transaction"> | string;
    txnNo?: Prisma.StringFilter<"Transaction"> | string;
    method?: Prisma.EnumTransactionMethodFilter<"Transaction"> | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFilter<"Transaction"> | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFilter<"Transaction"> | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFilter<"Transaction"> | string;
    txnDate?: Prisma.DateTimeFilter<"Transaction"> | Date | string;
    description?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    note?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    channelReference?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    category?: Prisma.EnumTransactionCategoryNullableFilter<"Transaction"> | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    cardId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    contactId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    checkId?: Prisma.StringNullableFilter<"Transaction"> | string | null;
    createdById?: Prisma.StringFilter<"Transaction"> | string;
    posBrut?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.DecimalNullableFilter<"Transaction"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.JsonNullableFilter<"Transaction">;
    createdAt?: Prisma.DateTimeFilter<"Transaction"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Transaction"> | Date | string;
};
export type TransactionCreateWithoutBankAccountInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    card?: Prisma.CardCreateNestedOneWithoutTransactionsInput;
    contact?: Prisma.ContactCreateNestedOneWithoutTransactionsInput;
    check?: Prisma.CheckCreateNestedOneWithoutTransactionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutTransactionsInput;
    tags?: Prisma.TxnTagCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveCreateNestedManyWithoutTransactionInput;
};
export type TransactionUncheckedCreateWithoutBankAccountInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    cardId?: string | null;
    contactId?: string | null;
    checkId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tags?: Prisma.TxnTagUncheckedCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutTransactionInput;
};
export type TransactionCreateOrConnectWithoutBankAccountInput = {
    where: Prisma.TransactionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutBankAccountInput, Prisma.TransactionUncheckedCreateWithoutBankAccountInput>;
};
export type TransactionCreateManyBankAccountInputEnvelope = {
    data: Prisma.TransactionCreateManyBankAccountInput | Prisma.TransactionCreateManyBankAccountInput[];
    skipDuplicates?: boolean;
};
export type TransactionUpsertWithWhereUniqueWithoutBankAccountInput = {
    where: Prisma.TransactionWhereUniqueInput;
    update: Prisma.XOR<Prisma.TransactionUpdateWithoutBankAccountInput, Prisma.TransactionUncheckedUpdateWithoutBankAccountInput>;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutBankAccountInput, Prisma.TransactionUncheckedCreateWithoutBankAccountInput>;
};
export type TransactionUpdateWithWhereUniqueWithoutBankAccountInput = {
    where: Prisma.TransactionWhereUniqueInput;
    data: Prisma.XOR<Prisma.TransactionUpdateWithoutBankAccountInput, Prisma.TransactionUncheckedUpdateWithoutBankAccountInput>;
};
export type TransactionUpdateManyWithWhereWithoutBankAccountInput = {
    where: Prisma.TransactionScalarWhereInput;
    data: Prisma.XOR<Prisma.TransactionUpdateManyMutationInput, Prisma.TransactionUncheckedUpdateManyWithoutBankAccountInput>;
};
export type TransactionCreateWithoutCardInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccount?: Prisma.BankAccountCreateNestedOneWithoutTransactionsInput;
    contact?: Prisma.ContactCreateNestedOneWithoutTransactionsInput;
    check?: Prisma.CheckCreateNestedOneWithoutTransactionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutTransactionsInput;
    tags?: Prisma.TxnTagCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveCreateNestedManyWithoutTransactionInput;
};
export type TransactionUncheckedCreateWithoutCardInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    contactId?: string | null;
    checkId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tags?: Prisma.TxnTagUncheckedCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutTransactionInput;
};
export type TransactionCreateOrConnectWithoutCardInput = {
    where: Prisma.TransactionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutCardInput, Prisma.TransactionUncheckedCreateWithoutCardInput>;
};
export type TransactionCreateManyCardInputEnvelope = {
    data: Prisma.TransactionCreateManyCardInput | Prisma.TransactionCreateManyCardInput[];
    skipDuplicates?: boolean;
};
export type TransactionUpsertWithWhereUniqueWithoutCardInput = {
    where: Prisma.TransactionWhereUniqueInput;
    update: Prisma.XOR<Prisma.TransactionUpdateWithoutCardInput, Prisma.TransactionUncheckedUpdateWithoutCardInput>;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutCardInput, Prisma.TransactionUncheckedCreateWithoutCardInput>;
};
export type TransactionUpdateWithWhereUniqueWithoutCardInput = {
    where: Prisma.TransactionWhereUniqueInput;
    data: Prisma.XOR<Prisma.TransactionUpdateWithoutCardInput, Prisma.TransactionUncheckedUpdateWithoutCardInput>;
};
export type TransactionUpdateManyWithWhereWithoutCardInput = {
    where: Prisma.TransactionScalarWhereInput;
    data: Prisma.XOR<Prisma.TransactionUpdateManyMutationInput, Prisma.TransactionUncheckedUpdateManyWithoutCardInput>;
};
export type TransactionCreateWithoutContactInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccount?: Prisma.BankAccountCreateNestedOneWithoutTransactionsInput;
    card?: Prisma.CardCreateNestedOneWithoutTransactionsInput;
    check?: Prisma.CheckCreateNestedOneWithoutTransactionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutTransactionsInput;
    tags?: Prisma.TxnTagCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveCreateNestedManyWithoutTransactionInput;
};
export type TransactionUncheckedCreateWithoutContactInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    checkId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tags?: Prisma.TxnTagUncheckedCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutTransactionInput;
};
export type TransactionCreateOrConnectWithoutContactInput = {
    where: Prisma.TransactionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutContactInput, Prisma.TransactionUncheckedCreateWithoutContactInput>;
};
export type TransactionCreateManyContactInputEnvelope = {
    data: Prisma.TransactionCreateManyContactInput | Prisma.TransactionCreateManyContactInput[];
    skipDuplicates?: boolean;
};
export type TransactionUpsertWithWhereUniqueWithoutContactInput = {
    where: Prisma.TransactionWhereUniqueInput;
    update: Prisma.XOR<Prisma.TransactionUpdateWithoutContactInput, Prisma.TransactionUncheckedUpdateWithoutContactInput>;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutContactInput, Prisma.TransactionUncheckedCreateWithoutContactInput>;
};
export type TransactionUpdateWithWhereUniqueWithoutContactInput = {
    where: Prisma.TransactionWhereUniqueInput;
    data: Prisma.XOR<Prisma.TransactionUpdateWithoutContactInput, Prisma.TransactionUncheckedUpdateWithoutContactInput>;
};
export type TransactionUpdateManyWithWhereWithoutContactInput = {
    where: Prisma.TransactionScalarWhereInput;
    data: Prisma.XOR<Prisma.TransactionUpdateManyMutationInput, Prisma.TransactionUncheckedUpdateManyWithoutContactInput>;
};
export type TransactionCreateWithoutCheckInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccount?: Prisma.BankAccountCreateNestedOneWithoutTransactionsInput;
    card?: Prisma.CardCreateNestedOneWithoutTransactionsInput;
    contact?: Prisma.ContactCreateNestedOneWithoutTransactionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutTransactionsInput;
    tags?: Prisma.TxnTagCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveCreateNestedManyWithoutTransactionInput;
};
export type TransactionUncheckedCreateWithoutCheckInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    contactId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tags?: Prisma.TxnTagUncheckedCreateNestedManyWithoutTransactionInput;
    checkMoves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutTransactionInput;
};
export type TransactionCreateOrConnectWithoutCheckInput = {
    where: Prisma.TransactionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutCheckInput, Prisma.TransactionUncheckedCreateWithoutCheckInput>;
};
export type TransactionCreateManyCheckInputEnvelope = {
    data: Prisma.TransactionCreateManyCheckInput | Prisma.TransactionCreateManyCheckInput[];
    skipDuplicates?: boolean;
};
export type TransactionUpsertWithWhereUniqueWithoutCheckInput = {
    where: Prisma.TransactionWhereUniqueInput;
    update: Prisma.XOR<Prisma.TransactionUpdateWithoutCheckInput, Prisma.TransactionUncheckedUpdateWithoutCheckInput>;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutCheckInput, Prisma.TransactionUncheckedCreateWithoutCheckInput>;
};
export type TransactionUpdateWithWhereUniqueWithoutCheckInput = {
    where: Prisma.TransactionWhereUniqueInput;
    data: Prisma.XOR<Prisma.TransactionUpdateWithoutCheckInput, Prisma.TransactionUncheckedUpdateWithoutCheckInput>;
};
export type TransactionUpdateManyWithWhereWithoutCheckInput = {
    where: Prisma.TransactionScalarWhereInput;
    data: Prisma.XOR<Prisma.TransactionUpdateManyMutationInput, Prisma.TransactionUncheckedUpdateManyWithoutCheckInput>;
};
export type TransactionCreateWithoutCheckMovesInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccount?: Prisma.BankAccountCreateNestedOneWithoutTransactionsInput;
    card?: Prisma.CardCreateNestedOneWithoutTransactionsInput;
    contact?: Prisma.ContactCreateNestedOneWithoutTransactionsInput;
    check?: Prisma.CheckCreateNestedOneWithoutTransactionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutTransactionsInput;
    tags?: Prisma.TxnTagCreateNestedManyWithoutTransactionInput;
};
export type TransactionUncheckedCreateWithoutCheckMovesInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    contactId?: string | null;
    checkId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tags?: Prisma.TxnTagUncheckedCreateNestedManyWithoutTransactionInput;
};
export type TransactionCreateOrConnectWithoutCheckMovesInput = {
    where: Prisma.TransactionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutCheckMovesInput, Prisma.TransactionUncheckedCreateWithoutCheckMovesInput>;
};
export type TransactionUpsertWithoutCheckMovesInput = {
    update: Prisma.XOR<Prisma.TransactionUpdateWithoutCheckMovesInput, Prisma.TransactionUncheckedUpdateWithoutCheckMovesInput>;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutCheckMovesInput, Prisma.TransactionUncheckedCreateWithoutCheckMovesInput>;
    where?: Prisma.TransactionWhereInput;
};
export type TransactionUpdateToOneWithWhereWithoutCheckMovesInput = {
    where?: Prisma.TransactionWhereInput;
    data: Prisma.XOR<Prisma.TransactionUpdateWithoutCheckMovesInput, Prisma.TransactionUncheckedUpdateWithoutCheckMovesInput>;
};
export type TransactionUpdateWithoutCheckMovesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccount?: Prisma.BankAccountUpdateOneWithoutTransactionsNestedInput;
    card?: Prisma.CardUpdateOneWithoutTransactionsNestedInput;
    contact?: Prisma.ContactUpdateOneWithoutTransactionsNestedInput;
    check?: Prisma.CheckUpdateOneWithoutTransactionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutTransactionsNestedInput;
    tags?: Prisma.TxnTagUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateWithoutCheckMovesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tags?: Prisma.TxnTagUncheckedUpdateManyWithoutTransactionNestedInput;
};
export type TransactionCreateWithoutTagsInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    bankAccount?: Prisma.BankAccountCreateNestedOneWithoutTransactionsInput;
    card?: Prisma.CardCreateNestedOneWithoutTransactionsInput;
    contact?: Prisma.ContactCreateNestedOneWithoutTransactionsInput;
    check?: Prisma.CheckCreateNestedOneWithoutTransactionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutTransactionsInput;
    checkMoves?: Prisma.CheckMoveCreateNestedManyWithoutTransactionInput;
};
export type TransactionUncheckedCreateWithoutTagsInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    contactId?: string | null;
    checkId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    checkMoves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutTransactionInput;
};
export type TransactionCreateOrConnectWithoutTagsInput = {
    where: Prisma.TransactionWhereUniqueInput;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutTagsInput, Prisma.TransactionUncheckedCreateWithoutTagsInput>;
};
export type TransactionUpsertWithoutTagsInput = {
    update: Prisma.XOR<Prisma.TransactionUpdateWithoutTagsInput, Prisma.TransactionUncheckedUpdateWithoutTagsInput>;
    create: Prisma.XOR<Prisma.TransactionCreateWithoutTagsInput, Prisma.TransactionUncheckedCreateWithoutTagsInput>;
    where?: Prisma.TransactionWhereInput;
};
export type TransactionUpdateToOneWithWhereWithoutTagsInput = {
    where?: Prisma.TransactionWhereInput;
    data: Prisma.XOR<Prisma.TransactionUpdateWithoutTagsInput, Prisma.TransactionUncheckedUpdateWithoutTagsInput>;
};
export type TransactionUpdateWithoutTagsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccount?: Prisma.BankAccountUpdateOneWithoutTransactionsNestedInput;
    card?: Prisma.CardUpdateOneWithoutTransactionsNestedInput;
    contact?: Prisma.ContactUpdateOneWithoutTransactionsNestedInput;
    check?: Prisma.CheckUpdateOneWithoutTransactionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutTransactionsNestedInput;
    checkMoves?: Prisma.CheckMoveUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateWithoutTagsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    checkMoves?: Prisma.CheckMoveUncheckedUpdateManyWithoutTransactionNestedInput;
};
export type TransactionCreateManyCreatedByInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    contactId?: string | null;
    checkId?: string | null;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TransactionUpdateWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccount?: Prisma.BankAccountUpdateOneWithoutTransactionsNestedInput;
    card?: Prisma.CardUpdateOneWithoutTransactionsNestedInput;
    contact?: Prisma.ContactUpdateOneWithoutTransactionsNestedInput;
    check?: Prisma.CheckUpdateOneWithoutTransactionsNestedInput;
    tags?: Prisma.TxnTagUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tags?: Prisma.TxnTagUncheckedUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUncheckedUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateManyWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TransactionCreateManyBankAccountInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    cardId?: string | null;
    contactId?: string | null;
    checkId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TransactionUpdateWithoutBankAccountInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    card?: Prisma.CardUpdateOneWithoutTransactionsNestedInput;
    contact?: Prisma.ContactUpdateOneWithoutTransactionsNestedInput;
    check?: Prisma.CheckUpdateOneWithoutTransactionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutTransactionsNestedInput;
    tags?: Prisma.TxnTagUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateWithoutBankAccountInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tags?: Prisma.TxnTagUncheckedUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUncheckedUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateManyWithoutBankAccountInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TransactionCreateManyCardInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    contactId?: string | null;
    checkId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TransactionUpdateWithoutCardInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccount?: Prisma.BankAccountUpdateOneWithoutTransactionsNestedInput;
    contact?: Prisma.ContactUpdateOneWithoutTransactionsNestedInput;
    check?: Prisma.CheckUpdateOneWithoutTransactionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutTransactionsNestedInput;
    tags?: Prisma.TxnTagUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateWithoutCardInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tags?: Prisma.TxnTagUncheckedUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUncheckedUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateManyWithoutCardInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TransactionCreateManyContactInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    checkId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TransactionUpdateWithoutContactInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccount?: Prisma.BankAccountUpdateOneWithoutTransactionsNestedInput;
    card?: Prisma.CardUpdateOneWithoutTransactionsNestedInput;
    check?: Prisma.CheckUpdateOneWithoutTransactionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutTransactionsNestedInput;
    tags?: Prisma.TxnTagUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateWithoutContactInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tags?: Prisma.TxnTagUncheckedUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUncheckedUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateManyWithoutContactInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    checkId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TransactionCreateManyCheckInput = {
    id?: string;
    txnNo: string;
    method: $Enums.TransactionMethod;
    type: $Enums.TransactionType;
    direction: $Enums.TransactionDirection;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: string;
    txnDate: Date | string;
    description?: string | null;
    note?: string | null;
    channelReference?: string | null;
    category?: $Enums.TransactionCategory | null;
    bankAccountId?: string | null;
    cardId?: string | null;
    contactId?: string | null;
    createdById: string;
    posBrut?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TransactionUpdateWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    bankAccount?: Prisma.BankAccountUpdateOneWithoutTransactionsNestedInput;
    card?: Prisma.CardUpdateOneWithoutTransactionsNestedInput;
    contact?: Prisma.ContactUpdateOneWithoutTransactionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutTransactionsNestedInput;
    tags?: Prisma.TxnTagUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tags?: Prisma.TxnTagUncheckedUpdateManyWithoutTransactionNestedInput;
    checkMoves?: Prisma.CheckMoveUncheckedUpdateManyWithoutTransactionNestedInput;
};
export type TransactionUncheckedUpdateManyWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    txnNo?: Prisma.StringFieldUpdateOperationsInput | string;
    method?: Prisma.EnumTransactionMethodFieldUpdateOperationsInput | $Enums.TransactionMethod;
    type?: Prisma.EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType;
    direction?: Prisma.EnumTransactionDirectionFieldUpdateOperationsInput | $Enums.TransactionDirection;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    currency?: Prisma.StringFieldUpdateOperationsInput | string;
    txnDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelReference?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    category?: Prisma.NullableEnumTransactionCategoryFieldUpdateOperationsInput | $Enums.TransactionCategory | null;
    bankAccountId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    cardId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    posBrut?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posKomisyon?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posNet?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    posEffectiveRate?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    meta?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type TransactionCountOutputType
 */
export type TransactionCountOutputType = {
    tags: number;
    checkMoves: number;
};
export type TransactionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tags?: boolean | TransactionCountOutputTypeCountTagsArgs;
    checkMoves?: boolean | TransactionCountOutputTypeCountCheckMovesArgs;
};
/**
 * TransactionCountOutputType without action
 */
export type TransactionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCountOutputType
     */
    select?: Prisma.TransactionCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * TransactionCountOutputType without action
 */
export type TransactionCountOutputTypeCountTagsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TxnTagWhereInput;
};
/**
 * TransactionCountOutputType without action
 */
export type TransactionCountOutputTypeCountCheckMovesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckMoveWhereInput;
};
export type TransactionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    txnNo?: boolean;
    method?: boolean;
    type?: boolean;
    direction?: boolean;
    amount?: boolean;
    currency?: boolean;
    txnDate?: boolean;
    description?: boolean;
    note?: boolean;
    channelReference?: boolean;
    category?: boolean;
    bankAccountId?: boolean;
    cardId?: boolean;
    contactId?: boolean;
    checkId?: boolean;
    createdById?: boolean;
    posBrut?: boolean;
    posKomisyon?: boolean;
    posNet?: boolean;
    posEffectiveRate?: boolean;
    meta?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    bankAccount?: boolean | Prisma.Transaction$bankAccountArgs<ExtArgs>;
    card?: boolean | Prisma.Transaction$cardArgs<ExtArgs>;
    contact?: boolean | Prisma.Transaction$contactArgs<ExtArgs>;
    check?: boolean | Prisma.Transaction$checkArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tags?: boolean | Prisma.Transaction$tagsArgs<ExtArgs>;
    checkMoves?: boolean | Prisma.Transaction$checkMovesArgs<ExtArgs>;
    _count?: boolean | Prisma.TransactionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["transaction"]>;
export type TransactionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    txnNo?: boolean;
    method?: boolean;
    type?: boolean;
    direction?: boolean;
    amount?: boolean;
    currency?: boolean;
    txnDate?: boolean;
    description?: boolean;
    note?: boolean;
    channelReference?: boolean;
    category?: boolean;
    bankAccountId?: boolean;
    cardId?: boolean;
    contactId?: boolean;
    checkId?: boolean;
    createdById?: boolean;
    posBrut?: boolean;
    posKomisyon?: boolean;
    posNet?: boolean;
    posEffectiveRate?: boolean;
    meta?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    bankAccount?: boolean | Prisma.Transaction$bankAccountArgs<ExtArgs>;
    card?: boolean | Prisma.Transaction$cardArgs<ExtArgs>;
    contact?: boolean | Prisma.Transaction$contactArgs<ExtArgs>;
    check?: boolean | Prisma.Transaction$checkArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["transaction"]>;
export type TransactionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    txnNo?: boolean;
    method?: boolean;
    type?: boolean;
    direction?: boolean;
    amount?: boolean;
    currency?: boolean;
    txnDate?: boolean;
    description?: boolean;
    note?: boolean;
    channelReference?: boolean;
    category?: boolean;
    bankAccountId?: boolean;
    cardId?: boolean;
    contactId?: boolean;
    checkId?: boolean;
    createdById?: boolean;
    posBrut?: boolean;
    posKomisyon?: boolean;
    posNet?: boolean;
    posEffectiveRate?: boolean;
    meta?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    bankAccount?: boolean | Prisma.Transaction$bankAccountArgs<ExtArgs>;
    card?: boolean | Prisma.Transaction$cardArgs<ExtArgs>;
    contact?: boolean | Prisma.Transaction$contactArgs<ExtArgs>;
    check?: boolean | Prisma.Transaction$checkArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["transaction"]>;
export type TransactionSelectScalar = {
    id?: boolean;
    txnNo?: boolean;
    method?: boolean;
    type?: boolean;
    direction?: boolean;
    amount?: boolean;
    currency?: boolean;
    txnDate?: boolean;
    description?: boolean;
    note?: boolean;
    channelReference?: boolean;
    category?: boolean;
    bankAccountId?: boolean;
    cardId?: boolean;
    contactId?: boolean;
    checkId?: boolean;
    createdById?: boolean;
    posBrut?: boolean;
    posKomisyon?: boolean;
    posNet?: boolean;
    posEffectiveRate?: boolean;
    meta?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TransactionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "txnNo" | "method" | "type" | "direction" | "amount" | "currency" | "txnDate" | "description" | "note" | "channelReference" | "category" | "bankAccountId" | "cardId" | "contactId" | "checkId" | "createdById" | "posBrut" | "posKomisyon" | "posNet" | "posEffectiveRate" | "meta" | "createdAt" | "updatedAt", ExtArgs["result"]["transaction"]>;
export type TransactionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    bankAccount?: boolean | Prisma.Transaction$bankAccountArgs<ExtArgs>;
    card?: boolean | Prisma.Transaction$cardArgs<ExtArgs>;
    contact?: boolean | Prisma.Transaction$contactArgs<ExtArgs>;
    check?: boolean | Prisma.Transaction$checkArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tags?: boolean | Prisma.Transaction$tagsArgs<ExtArgs>;
    checkMoves?: boolean | Prisma.Transaction$checkMovesArgs<ExtArgs>;
    _count?: boolean | Prisma.TransactionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TransactionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    bankAccount?: boolean | Prisma.Transaction$bankAccountArgs<ExtArgs>;
    card?: boolean | Prisma.Transaction$cardArgs<ExtArgs>;
    contact?: boolean | Prisma.Transaction$contactArgs<ExtArgs>;
    check?: boolean | Prisma.Transaction$checkArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type TransactionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    bankAccount?: boolean | Prisma.Transaction$bankAccountArgs<ExtArgs>;
    card?: boolean | Prisma.Transaction$cardArgs<ExtArgs>;
    contact?: boolean | Prisma.Transaction$contactArgs<ExtArgs>;
    check?: boolean | Prisma.Transaction$checkArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $TransactionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Transaction";
    objects: {
        bankAccount: Prisma.$BankAccountPayload<ExtArgs> | null;
        card: Prisma.$CardPayload<ExtArgs> | null;
        contact: Prisma.$ContactPayload<ExtArgs> | null;
        check: Prisma.$CheckPayload<ExtArgs> | null;
        createdBy: Prisma.$UserPayload<ExtArgs>;
        tags: Prisma.$TxnTagPayload<ExtArgs>[];
        checkMoves: Prisma.$CheckMovePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        txnNo: string;
        method: $Enums.TransactionMethod;
        type: $Enums.TransactionType;
        direction: $Enums.TransactionDirection;
        amount: runtime.Decimal;
        currency: string;
        txnDate: Date;
        description: string | null;
        note: string | null;
        channelReference: string | null;
        category: $Enums.TransactionCategory | null;
        bankAccountId: string | null;
        cardId: string | null;
        contactId: string | null;
        checkId: string | null;
        createdById: string;
        posBrut: runtime.Decimal | null;
        posKomisyon: runtime.Decimal | null;
        posNet: runtime.Decimal | null;
        posEffectiveRate: runtime.Decimal | null;
        meta: runtime.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["transaction"]>;
    composites: {};
};
export type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TransactionPayload, S>;
export type TransactionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TransactionCountAggregateInputType | true;
};
export interface TransactionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Transaction'];
        meta: {
            name: 'Transaction';
        };
    };
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(args: Prisma.SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(args?: Prisma.SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     *
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TransactionFindManyArgs>(args?: Prisma.SelectSubset<T, TransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     *
     */
    create<T extends TransactionCreateArgs>(args: Prisma.SelectSubset<T, TransactionCreateArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TransactionCreateManyArgs>(args?: Prisma.SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     *
     */
    delete<T extends TransactionDeleteArgs>(args: Prisma.SelectSubset<T, TransactionDeleteArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TransactionUpdateArgs>(args: Prisma.SelectSubset<T, TransactionUpdateArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TransactionDeleteManyArgs>(args?: Prisma.SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TransactionUpdateManyArgs>(args: Prisma.SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Transactions and returns the data updated in the database.
     * @param {TransactionUpdateManyAndReturnArgs} args - Arguments to update many Transactions.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends TransactionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TransactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(args: Prisma.SelectSubset<T, TransactionUpsertArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
    **/
    count<T extends TransactionCountArgs>(args?: Prisma.Subset<T, TransactionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TransactionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TransactionAggregateArgs>(args: Prisma.Subset<T, TransactionAggregateArgs>): Prisma.PrismaPromise<GetTransactionAggregateType<T>>;
    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends TransactionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TransactionGroupByArgs['orderBy'];
    } : {
        orderBy?: TransactionGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Transaction model
     */
    readonly fields: TransactionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Transaction.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__TransactionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    bankAccount<T extends Prisma.Transaction$bankAccountArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Transaction$bankAccountArgs<ExtArgs>>): Prisma.Prisma__BankAccountClient<runtime.Types.Result.GetResult<Prisma.$BankAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    card<T extends Prisma.Transaction$cardArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Transaction$cardArgs<ExtArgs>>): Prisma.Prisma__CardClient<runtime.Types.Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    contact<T extends Prisma.Transaction$contactArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Transaction$contactArgs<ExtArgs>>): Prisma.Prisma__ContactClient<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    check<T extends Prisma.Transaction$checkArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Transaction$checkArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    createdBy<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tags<T extends Prisma.Transaction$tagsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Transaction$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    checkMoves<T extends Prisma.Transaction$checkMovesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Transaction$checkMovesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Transaction model
 */
export interface TransactionFieldRefs {
    readonly id: Prisma.FieldRef<"Transaction", 'String'>;
    readonly txnNo: Prisma.FieldRef<"Transaction", 'String'>;
    readonly method: Prisma.FieldRef<"Transaction", 'TransactionMethod'>;
    readonly type: Prisma.FieldRef<"Transaction", 'TransactionType'>;
    readonly direction: Prisma.FieldRef<"Transaction", 'TransactionDirection'>;
    readonly amount: Prisma.FieldRef<"Transaction", 'Decimal'>;
    readonly currency: Prisma.FieldRef<"Transaction", 'String'>;
    readonly txnDate: Prisma.FieldRef<"Transaction", 'DateTime'>;
    readonly description: Prisma.FieldRef<"Transaction", 'String'>;
    readonly note: Prisma.FieldRef<"Transaction", 'String'>;
    readonly channelReference: Prisma.FieldRef<"Transaction", 'String'>;
    readonly category: Prisma.FieldRef<"Transaction", 'TransactionCategory'>;
    readonly bankAccountId: Prisma.FieldRef<"Transaction", 'String'>;
    readonly cardId: Prisma.FieldRef<"Transaction", 'String'>;
    readonly contactId: Prisma.FieldRef<"Transaction", 'String'>;
    readonly checkId: Prisma.FieldRef<"Transaction", 'String'>;
    readonly createdById: Prisma.FieldRef<"Transaction", 'String'>;
    readonly posBrut: Prisma.FieldRef<"Transaction", 'Decimal'>;
    readonly posKomisyon: Prisma.FieldRef<"Transaction", 'Decimal'>;
    readonly posNet: Prisma.FieldRef<"Transaction", 'Decimal'>;
    readonly posEffectiveRate: Prisma.FieldRef<"Transaction", 'Decimal'>;
    readonly meta: Prisma.FieldRef<"Transaction", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"Transaction", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Transaction", 'DateTime'>;
}
/**
 * Transaction findUnique
 */
export type TransactionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where: Prisma.TransactionWhereUniqueInput;
};
/**
 * Transaction findUniqueOrThrow
 */
export type TransactionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where: Prisma.TransactionWhereUniqueInput;
};
/**
 * Transaction findFirst
 */
export type TransactionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where?: Prisma.TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: Prisma.TransactionOrderByWithRelationInput | Prisma.TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Transactions.
     */
    cursor?: Prisma.TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Transactions.
     */
    distinct?: Prisma.TransactionScalarFieldEnum | Prisma.TransactionScalarFieldEnum[];
};
/**
 * Transaction findFirstOrThrow
 */
export type TransactionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transaction to fetch.
     */
    where?: Prisma.TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: Prisma.TransactionOrderByWithRelationInput | Prisma.TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Transactions.
     */
    cursor?: Prisma.TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Transactions.
     */
    distinct?: Prisma.TransactionScalarFieldEnum | Prisma.TransactionScalarFieldEnum[];
};
/**
 * Transaction findMany
 */
export type TransactionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    /**
     * Filter, which Transactions to fetch.
     */
    where?: Prisma.TransactionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Transactions to fetch.
     */
    orderBy?: Prisma.TransactionOrderByWithRelationInput | Prisma.TransactionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Transactions.
     */
    cursor?: Prisma.TransactionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Transactions.
     */
    skip?: number;
    distinct?: Prisma.TransactionScalarFieldEnum | Prisma.TransactionScalarFieldEnum[];
};
/**
 * Transaction create
 */
export type TransactionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    /**
     * The data needed to create a Transaction.
     */
    data: Prisma.XOR<Prisma.TransactionCreateInput, Prisma.TransactionUncheckedCreateInput>;
};
/**
 * Transaction createMany
 */
export type TransactionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transactions.
     */
    data: Prisma.TransactionCreateManyInput | Prisma.TransactionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Transaction createManyAndReturn
 */
export type TransactionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * The data used to create many Transactions.
     */
    data: Prisma.TransactionCreateManyInput | Prisma.TransactionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Transaction update
 */
export type TransactionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    /**
     * The data needed to update a Transaction.
     */
    data: Prisma.XOR<Prisma.TransactionUpdateInput, Prisma.TransactionUncheckedUpdateInput>;
    /**
     * Choose, which Transaction to update.
     */
    where: Prisma.TransactionWhereUniqueInput;
};
/**
 * Transaction updateMany
 */
export type TransactionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Transactions.
     */
    data: Prisma.XOR<Prisma.TransactionUpdateManyMutationInput, Prisma.TransactionUncheckedUpdateManyInput>;
    /**
     * Filter which Transactions to update
     */
    where?: Prisma.TransactionWhereInput;
    /**
     * Limit how many Transactions to update.
     */
    limit?: number;
};
/**
 * Transaction updateManyAndReturn
 */
export type TransactionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * The data used to update Transactions.
     */
    data: Prisma.XOR<Prisma.TransactionUpdateManyMutationInput, Prisma.TransactionUncheckedUpdateManyInput>;
    /**
     * Filter which Transactions to update
     */
    where?: Prisma.TransactionWhereInput;
    /**
     * Limit how many Transactions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Transaction upsert
 */
export type TransactionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: Prisma.TransactionWhereUniqueInput;
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: Prisma.XOR<Prisma.TransactionCreateInput, Prisma.TransactionUncheckedCreateInput>;
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.TransactionUpdateInput, Prisma.TransactionUncheckedUpdateInput>;
};
/**
 * Transaction delete
 */
export type TransactionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    /**
     * Filter which Transaction to delete.
     */
    where: Prisma.TransactionWhereUniqueInput;
};
/**
 * Transaction deleteMany
 */
export type TransactionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Transactions to delete
     */
    where?: Prisma.TransactionWhereInput;
    /**
     * Limit how many Transactions to delete.
     */
    limit?: number;
};
/**
 * Transaction.bankAccount
 */
export type Transaction$bankAccountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BankAccount
     */
    select?: Prisma.BankAccountSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BankAccount
     */
    omit?: Prisma.BankAccountOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BankAccountInclude<ExtArgs> | null;
    where?: Prisma.BankAccountWhereInput;
};
/**
 * Transaction.card
 */
export type Transaction$cardArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: Prisma.CardSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Card
     */
    omit?: Prisma.CardOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CardInclude<ExtArgs> | null;
    where?: Prisma.CardWhereInput;
};
/**
 * Transaction.contact
 */
export type Transaction$contactArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: Prisma.ContactSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Contact
     */
    omit?: Prisma.ContactOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ContactInclude<ExtArgs> | null;
    where?: Prisma.ContactWhereInput;
};
/**
 * Transaction.check
 */
export type Transaction$checkArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Check
     */
    select?: Prisma.CheckSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Check
     */
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CheckInclude<ExtArgs> | null;
    where?: Prisma.CheckWhereInput;
};
/**
 * Transaction.tags
 */
export type Transaction$tagsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TxnTag
     */
    select?: Prisma.TxnTagSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TxnTag
     */
    omit?: Prisma.TxnTagOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TxnTagInclude<ExtArgs> | null;
    where?: Prisma.TxnTagWhereInput;
    orderBy?: Prisma.TxnTagOrderByWithRelationInput | Prisma.TxnTagOrderByWithRelationInput[];
    cursor?: Prisma.TxnTagWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TxnTagScalarFieldEnum | Prisma.TxnTagScalarFieldEnum[];
};
/**
 * Transaction.checkMoves
 */
export type Transaction$checkMovesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckMove
     */
    select?: Prisma.CheckMoveSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CheckMove
     */
    omit?: Prisma.CheckMoveOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CheckMoveInclude<ExtArgs> | null;
    where?: Prisma.CheckMoveWhereInput;
    orderBy?: Prisma.CheckMoveOrderByWithRelationInput | Prisma.CheckMoveOrderByWithRelationInput[];
    cursor?: Prisma.CheckMoveWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CheckMoveScalarFieldEnum | Prisma.CheckMoveScalarFieldEnum[];
};
/**
 * Transaction without action
 */
export type TransactionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Transaction
     */
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TransactionInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=Transaction.d.ts.map