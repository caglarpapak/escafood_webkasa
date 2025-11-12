import type * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model CheckMove
 *
 */
export type CheckMoveModel = runtime.Types.Result.DefaultSelection<Prisma.$CheckMovePayload>;
export type AggregateCheckMove = {
    _count: CheckMoveCountAggregateOutputType | null;
    _min: CheckMoveMinAggregateOutputType | null;
    _max: CheckMoveMaxAggregateOutputType | null;
};
export type CheckMoveMinAggregateOutputType = {
    id: string | null;
    checkId: string | null;
    action: $Enums.CheckMoveAction | null;
    transactionId: string | null;
    description: string | null;
    performedById: string | null;
    performedAt: Date | null;
};
export type CheckMoveMaxAggregateOutputType = {
    id: string | null;
    checkId: string | null;
    action: $Enums.CheckMoveAction | null;
    transactionId: string | null;
    description: string | null;
    performedById: string | null;
    performedAt: Date | null;
};
export type CheckMoveCountAggregateOutputType = {
    id: number;
    checkId: number;
    action: number;
    transactionId: number;
    description: number;
    performedById: number;
    performedAt: number;
    _all: number;
};
export type CheckMoveMinAggregateInputType = {
    id?: true;
    checkId?: true;
    action?: true;
    transactionId?: true;
    description?: true;
    performedById?: true;
    performedAt?: true;
};
export type CheckMoveMaxAggregateInputType = {
    id?: true;
    checkId?: true;
    action?: true;
    transactionId?: true;
    description?: true;
    performedById?: true;
    performedAt?: true;
};
export type CheckMoveCountAggregateInputType = {
    id?: true;
    checkId?: true;
    action?: true;
    transactionId?: true;
    description?: true;
    performedById?: true;
    performedAt?: true;
    _all?: true;
};
export type CheckMoveAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CheckMove to aggregate.
     */
    where?: Prisma.CheckMoveWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CheckMoves to fetch.
     */
    orderBy?: Prisma.CheckMoveOrderByWithRelationInput | Prisma.CheckMoveOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.CheckMoveWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CheckMoves from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CheckMoves.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned CheckMoves
    **/
    _count?: true | CheckMoveCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: CheckMoveMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: CheckMoveMaxAggregateInputType;
};
export type GetCheckMoveAggregateType<T extends CheckMoveAggregateArgs> = {
    [P in keyof T & keyof AggregateCheckMove]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCheckMove[P]> : Prisma.GetScalarType<T[P], AggregateCheckMove[P]>;
};
export type CheckMoveGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckMoveWhereInput;
    orderBy?: Prisma.CheckMoveOrderByWithAggregationInput | Prisma.CheckMoveOrderByWithAggregationInput[];
    by: Prisma.CheckMoveScalarFieldEnum[] | Prisma.CheckMoveScalarFieldEnum;
    having?: Prisma.CheckMoveScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CheckMoveCountAggregateInputType | true;
    _min?: CheckMoveMinAggregateInputType;
    _max?: CheckMoveMaxAggregateInputType;
};
export type CheckMoveGroupByOutputType = {
    id: string;
    checkId: string;
    action: $Enums.CheckMoveAction;
    transactionId: string | null;
    description: string | null;
    performedById: string | null;
    performedAt: Date;
    _count: CheckMoveCountAggregateOutputType | null;
    _min: CheckMoveMinAggregateOutputType | null;
    _max: CheckMoveMaxAggregateOutputType | null;
};
type GetCheckMoveGroupByPayload<T extends CheckMoveGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CheckMoveGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CheckMoveGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CheckMoveGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CheckMoveGroupByOutputType[P]>;
}>>;
export type CheckMoveWhereInput = {
    AND?: Prisma.CheckMoveWhereInput | Prisma.CheckMoveWhereInput[];
    OR?: Prisma.CheckMoveWhereInput[];
    NOT?: Prisma.CheckMoveWhereInput | Prisma.CheckMoveWhereInput[];
    id?: Prisma.StringFilter<"CheckMove"> | string;
    checkId?: Prisma.StringFilter<"CheckMove"> | string;
    action?: Prisma.EnumCheckMoveActionFilter<"CheckMove"> | $Enums.CheckMoveAction;
    transactionId?: Prisma.StringNullableFilter<"CheckMove"> | string | null;
    description?: Prisma.StringNullableFilter<"CheckMove"> | string | null;
    performedById?: Prisma.StringNullableFilter<"CheckMove"> | string | null;
    performedAt?: Prisma.DateTimeFilter<"CheckMove"> | Date | string;
    check?: Prisma.XOR<Prisma.CheckScalarRelationFilter, Prisma.CheckWhereInput>;
    transaction?: Prisma.XOR<Prisma.TransactionNullableScalarRelationFilter, Prisma.TransactionWhereInput> | null;
    performedBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
};
export type CheckMoveOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    transactionId?: Prisma.SortOrderInput | Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    performedById?: Prisma.SortOrderInput | Prisma.SortOrder;
    performedAt?: Prisma.SortOrder;
    check?: Prisma.CheckOrderByWithRelationInput;
    transaction?: Prisma.TransactionOrderByWithRelationInput;
    performedBy?: Prisma.UserOrderByWithRelationInput;
};
export type CheckMoveWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CheckMoveWhereInput | Prisma.CheckMoveWhereInput[];
    OR?: Prisma.CheckMoveWhereInput[];
    NOT?: Prisma.CheckMoveWhereInput | Prisma.CheckMoveWhereInput[];
    checkId?: Prisma.StringFilter<"CheckMove"> | string;
    action?: Prisma.EnumCheckMoveActionFilter<"CheckMove"> | $Enums.CheckMoveAction;
    transactionId?: Prisma.StringNullableFilter<"CheckMove"> | string | null;
    description?: Prisma.StringNullableFilter<"CheckMove"> | string | null;
    performedById?: Prisma.StringNullableFilter<"CheckMove"> | string | null;
    performedAt?: Prisma.DateTimeFilter<"CheckMove"> | Date | string;
    check?: Prisma.XOR<Prisma.CheckScalarRelationFilter, Prisma.CheckWhereInput>;
    transaction?: Prisma.XOR<Prisma.TransactionNullableScalarRelationFilter, Prisma.TransactionWhereInput> | null;
    performedBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
}, "id">;
export type CheckMoveOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    transactionId?: Prisma.SortOrderInput | Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    performedById?: Prisma.SortOrderInput | Prisma.SortOrder;
    performedAt?: Prisma.SortOrder;
    _count?: Prisma.CheckMoveCountOrderByAggregateInput;
    _max?: Prisma.CheckMoveMaxOrderByAggregateInput;
    _min?: Prisma.CheckMoveMinOrderByAggregateInput;
};
export type CheckMoveScalarWhereWithAggregatesInput = {
    AND?: Prisma.CheckMoveScalarWhereWithAggregatesInput | Prisma.CheckMoveScalarWhereWithAggregatesInput[];
    OR?: Prisma.CheckMoveScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CheckMoveScalarWhereWithAggregatesInput | Prisma.CheckMoveScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"CheckMove"> | string;
    checkId?: Prisma.StringWithAggregatesFilter<"CheckMove"> | string;
    action?: Prisma.EnumCheckMoveActionWithAggregatesFilter<"CheckMove"> | $Enums.CheckMoveAction;
    transactionId?: Prisma.StringNullableWithAggregatesFilter<"CheckMove"> | string | null;
    description?: Prisma.StringNullableWithAggregatesFilter<"CheckMove"> | string | null;
    performedById?: Prisma.StringNullableWithAggregatesFilter<"CheckMove"> | string | null;
    performedAt?: Prisma.DateTimeWithAggregatesFilter<"CheckMove"> | Date | string;
};
export type CheckMoveCreateInput = {
    id?: string;
    action: $Enums.CheckMoveAction;
    description?: string | null;
    performedAt?: Date | string;
    check: Prisma.CheckCreateNestedOneWithoutMovesInput;
    transaction?: Prisma.TransactionCreateNestedOneWithoutCheckMovesInput;
    performedBy?: Prisma.UserCreateNestedOneWithoutCheckMovesInput;
};
export type CheckMoveUncheckedCreateInput = {
    id?: string;
    checkId: string;
    action: $Enums.CheckMoveAction;
    transactionId?: string | null;
    description?: string | null;
    performedById?: string | null;
    performedAt?: Date | string;
};
export type CheckMoveUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    check?: Prisma.CheckUpdateOneRequiredWithoutMovesNestedInput;
    transaction?: Prisma.TransactionUpdateOneWithoutCheckMovesNestedInput;
    performedBy?: Prisma.UserUpdateOneWithoutCheckMovesNestedInput;
};
export type CheckMoveUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    transactionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckMoveCreateManyInput = {
    id?: string;
    checkId: string;
    action: $Enums.CheckMoveAction;
    transactionId?: string | null;
    description?: string | null;
    performedById?: string | null;
    performedAt?: Date | string;
};
export type CheckMoveUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckMoveUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    transactionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckMoveListRelationFilter = {
    every?: Prisma.CheckMoveWhereInput;
    some?: Prisma.CheckMoveWhereInput;
    none?: Prisma.CheckMoveWhereInput;
};
export type CheckMoveOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CheckMoveCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    transactionId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    performedById?: Prisma.SortOrder;
    performedAt?: Prisma.SortOrder;
};
export type CheckMoveMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    transactionId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    performedById?: Prisma.SortOrder;
    performedAt?: Prisma.SortOrder;
};
export type CheckMoveMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    checkId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    transactionId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    performedById?: Prisma.SortOrder;
    performedAt?: Prisma.SortOrder;
};
export type CheckMoveCreateNestedManyWithoutPerformedByInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutPerformedByInput, Prisma.CheckMoveUncheckedCreateWithoutPerformedByInput> | Prisma.CheckMoveCreateWithoutPerformedByInput[] | Prisma.CheckMoveUncheckedCreateWithoutPerformedByInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutPerformedByInput | Prisma.CheckMoveCreateOrConnectWithoutPerformedByInput[];
    createMany?: Prisma.CheckMoveCreateManyPerformedByInputEnvelope;
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
};
export type CheckMoveUncheckedCreateNestedManyWithoutPerformedByInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutPerformedByInput, Prisma.CheckMoveUncheckedCreateWithoutPerformedByInput> | Prisma.CheckMoveCreateWithoutPerformedByInput[] | Prisma.CheckMoveUncheckedCreateWithoutPerformedByInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutPerformedByInput | Prisma.CheckMoveCreateOrConnectWithoutPerformedByInput[];
    createMany?: Prisma.CheckMoveCreateManyPerformedByInputEnvelope;
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
};
export type CheckMoveUpdateManyWithoutPerformedByNestedInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutPerformedByInput, Prisma.CheckMoveUncheckedCreateWithoutPerformedByInput> | Prisma.CheckMoveCreateWithoutPerformedByInput[] | Prisma.CheckMoveUncheckedCreateWithoutPerformedByInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutPerformedByInput | Prisma.CheckMoveCreateOrConnectWithoutPerformedByInput[];
    upsert?: Prisma.CheckMoveUpsertWithWhereUniqueWithoutPerformedByInput | Prisma.CheckMoveUpsertWithWhereUniqueWithoutPerformedByInput[];
    createMany?: Prisma.CheckMoveCreateManyPerformedByInputEnvelope;
    set?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    disconnect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    delete?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    update?: Prisma.CheckMoveUpdateWithWhereUniqueWithoutPerformedByInput | Prisma.CheckMoveUpdateWithWhereUniqueWithoutPerformedByInput[];
    updateMany?: Prisma.CheckMoveUpdateManyWithWhereWithoutPerformedByInput | Prisma.CheckMoveUpdateManyWithWhereWithoutPerformedByInput[];
    deleteMany?: Prisma.CheckMoveScalarWhereInput | Prisma.CheckMoveScalarWhereInput[];
};
export type CheckMoveUncheckedUpdateManyWithoutPerformedByNestedInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutPerformedByInput, Prisma.CheckMoveUncheckedCreateWithoutPerformedByInput> | Prisma.CheckMoveCreateWithoutPerformedByInput[] | Prisma.CheckMoveUncheckedCreateWithoutPerformedByInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutPerformedByInput | Prisma.CheckMoveCreateOrConnectWithoutPerformedByInput[];
    upsert?: Prisma.CheckMoveUpsertWithWhereUniqueWithoutPerformedByInput | Prisma.CheckMoveUpsertWithWhereUniqueWithoutPerformedByInput[];
    createMany?: Prisma.CheckMoveCreateManyPerformedByInputEnvelope;
    set?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    disconnect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    delete?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    update?: Prisma.CheckMoveUpdateWithWhereUniqueWithoutPerformedByInput | Prisma.CheckMoveUpdateWithWhereUniqueWithoutPerformedByInput[];
    updateMany?: Prisma.CheckMoveUpdateManyWithWhereWithoutPerformedByInput | Prisma.CheckMoveUpdateManyWithWhereWithoutPerformedByInput[];
    deleteMany?: Prisma.CheckMoveScalarWhereInput | Prisma.CheckMoveScalarWhereInput[];
};
export type CheckMoveCreateNestedManyWithoutTransactionInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutTransactionInput, Prisma.CheckMoveUncheckedCreateWithoutTransactionInput> | Prisma.CheckMoveCreateWithoutTransactionInput[] | Prisma.CheckMoveUncheckedCreateWithoutTransactionInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutTransactionInput | Prisma.CheckMoveCreateOrConnectWithoutTransactionInput[];
    createMany?: Prisma.CheckMoveCreateManyTransactionInputEnvelope;
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
};
export type CheckMoveUncheckedCreateNestedManyWithoutTransactionInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutTransactionInput, Prisma.CheckMoveUncheckedCreateWithoutTransactionInput> | Prisma.CheckMoveCreateWithoutTransactionInput[] | Prisma.CheckMoveUncheckedCreateWithoutTransactionInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutTransactionInput | Prisma.CheckMoveCreateOrConnectWithoutTransactionInput[];
    createMany?: Prisma.CheckMoveCreateManyTransactionInputEnvelope;
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
};
export type CheckMoveUpdateManyWithoutTransactionNestedInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutTransactionInput, Prisma.CheckMoveUncheckedCreateWithoutTransactionInput> | Prisma.CheckMoveCreateWithoutTransactionInput[] | Prisma.CheckMoveUncheckedCreateWithoutTransactionInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutTransactionInput | Prisma.CheckMoveCreateOrConnectWithoutTransactionInput[];
    upsert?: Prisma.CheckMoveUpsertWithWhereUniqueWithoutTransactionInput | Prisma.CheckMoveUpsertWithWhereUniqueWithoutTransactionInput[];
    createMany?: Prisma.CheckMoveCreateManyTransactionInputEnvelope;
    set?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    disconnect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    delete?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    update?: Prisma.CheckMoveUpdateWithWhereUniqueWithoutTransactionInput | Prisma.CheckMoveUpdateWithWhereUniqueWithoutTransactionInput[];
    updateMany?: Prisma.CheckMoveUpdateManyWithWhereWithoutTransactionInput | Prisma.CheckMoveUpdateManyWithWhereWithoutTransactionInput[];
    deleteMany?: Prisma.CheckMoveScalarWhereInput | Prisma.CheckMoveScalarWhereInput[];
};
export type CheckMoveUncheckedUpdateManyWithoutTransactionNestedInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutTransactionInput, Prisma.CheckMoveUncheckedCreateWithoutTransactionInput> | Prisma.CheckMoveCreateWithoutTransactionInput[] | Prisma.CheckMoveUncheckedCreateWithoutTransactionInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutTransactionInput | Prisma.CheckMoveCreateOrConnectWithoutTransactionInput[];
    upsert?: Prisma.CheckMoveUpsertWithWhereUniqueWithoutTransactionInput | Prisma.CheckMoveUpsertWithWhereUniqueWithoutTransactionInput[];
    createMany?: Prisma.CheckMoveCreateManyTransactionInputEnvelope;
    set?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    disconnect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    delete?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    update?: Prisma.CheckMoveUpdateWithWhereUniqueWithoutTransactionInput | Prisma.CheckMoveUpdateWithWhereUniqueWithoutTransactionInput[];
    updateMany?: Prisma.CheckMoveUpdateManyWithWhereWithoutTransactionInput | Prisma.CheckMoveUpdateManyWithWhereWithoutTransactionInput[];
    deleteMany?: Prisma.CheckMoveScalarWhereInput | Prisma.CheckMoveScalarWhereInput[];
};
export type CheckMoveCreateNestedManyWithoutCheckInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutCheckInput, Prisma.CheckMoveUncheckedCreateWithoutCheckInput> | Prisma.CheckMoveCreateWithoutCheckInput[] | Prisma.CheckMoveUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutCheckInput | Prisma.CheckMoveCreateOrConnectWithoutCheckInput[];
    createMany?: Prisma.CheckMoveCreateManyCheckInputEnvelope;
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
};
export type CheckMoveUncheckedCreateNestedManyWithoutCheckInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutCheckInput, Prisma.CheckMoveUncheckedCreateWithoutCheckInput> | Prisma.CheckMoveCreateWithoutCheckInput[] | Prisma.CheckMoveUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutCheckInput | Prisma.CheckMoveCreateOrConnectWithoutCheckInput[];
    createMany?: Prisma.CheckMoveCreateManyCheckInputEnvelope;
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
};
export type CheckMoveUpdateManyWithoutCheckNestedInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutCheckInput, Prisma.CheckMoveUncheckedCreateWithoutCheckInput> | Prisma.CheckMoveCreateWithoutCheckInput[] | Prisma.CheckMoveUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutCheckInput | Prisma.CheckMoveCreateOrConnectWithoutCheckInput[];
    upsert?: Prisma.CheckMoveUpsertWithWhereUniqueWithoutCheckInput | Prisma.CheckMoveUpsertWithWhereUniqueWithoutCheckInput[];
    createMany?: Prisma.CheckMoveCreateManyCheckInputEnvelope;
    set?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    disconnect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    delete?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    update?: Prisma.CheckMoveUpdateWithWhereUniqueWithoutCheckInput | Prisma.CheckMoveUpdateWithWhereUniqueWithoutCheckInput[];
    updateMany?: Prisma.CheckMoveUpdateManyWithWhereWithoutCheckInput | Prisma.CheckMoveUpdateManyWithWhereWithoutCheckInput[];
    deleteMany?: Prisma.CheckMoveScalarWhereInput | Prisma.CheckMoveScalarWhereInput[];
};
export type CheckMoveUncheckedUpdateManyWithoutCheckNestedInput = {
    create?: Prisma.XOR<Prisma.CheckMoveCreateWithoutCheckInput, Prisma.CheckMoveUncheckedCreateWithoutCheckInput> | Prisma.CheckMoveCreateWithoutCheckInput[] | Prisma.CheckMoveUncheckedCreateWithoutCheckInput[];
    connectOrCreate?: Prisma.CheckMoveCreateOrConnectWithoutCheckInput | Prisma.CheckMoveCreateOrConnectWithoutCheckInput[];
    upsert?: Prisma.CheckMoveUpsertWithWhereUniqueWithoutCheckInput | Prisma.CheckMoveUpsertWithWhereUniqueWithoutCheckInput[];
    createMany?: Prisma.CheckMoveCreateManyCheckInputEnvelope;
    set?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    disconnect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    delete?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    connect?: Prisma.CheckMoveWhereUniqueInput | Prisma.CheckMoveWhereUniqueInput[];
    update?: Prisma.CheckMoveUpdateWithWhereUniqueWithoutCheckInput | Prisma.CheckMoveUpdateWithWhereUniqueWithoutCheckInput[];
    updateMany?: Prisma.CheckMoveUpdateManyWithWhereWithoutCheckInput | Prisma.CheckMoveUpdateManyWithWhereWithoutCheckInput[];
    deleteMany?: Prisma.CheckMoveScalarWhereInput | Prisma.CheckMoveScalarWhereInput[];
};
export type EnumCheckMoveActionFieldUpdateOperationsInput = {
    set?: $Enums.CheckMoveAction;
};
export type CheckMoveCreateWithoutPerformedByInput = {
    id?: string;
    action: $Enums.CheckMoveAction;
    description?: string | null;
    performedAt?: Date | string;
    check: Prisma.CheckCreateNestedOneWithoutMovesInput;
    transaction?: Prisma.TransactionCreateNestedOneWithoutCheckMovesInput;
};
export type CheckMoveUncheckedCreateWithoutPerformedByInput = {
    id?: string;
    checkId: string;
    action: $Enums.CheckMoveAction;
    transactionId?: string | null;
    description?: string | null;
    performedAt?: Date | string;
};
export type CheckMoveCreateOrConnectWithoutPerformedByInput = {
    where: Prisma.CheckMoveWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckMoveCreateWithoutPerformedByInput, Prisma.CheckMoveUncheckedCreateWithoutPerformedByInput>;
};
export type CheckMoveCreateManyPerformedByInputEnvelope = {
    data: Prisma.CheckMoveCreateManyPerformedByInput | Prisma.CheckMoveCreateManyPerformedByInput[];
    skipDuplicates?: boolean;
};
export type CheckMoveUpsertWithWhereUniqueWithoutPerformedByInput = {
    where: Prisma.CheckMoveWhereUniqueInput;
    update: Prisma.XOR<Prisma.CheckMoveUpdateWithoutPerformedByInput, Prisma.CheckMoveUncheckedUpdateWithoutPerformedByInput>;
    create: Prisma.XOR<Prisma.CheckMoveCreateWithoutPerformedByInput, Prisma.CheckMoveUncheckedCreateWithoutPerformedByInput>;
};
export type CheckMoveUpdateWithWhereUniqueWithoutPerformedByInput = {
    where: Prisma.CheckMoveWhereUniqueInput;
    data: Prisma.XOR<Prisma.CheckMoveUpdateWithoutPerformedByInput, Prisma.CheckMoveUncheckedUpdateWithoutPerformedByInput>;
};
export type CheckMoveUpdateManyWithWhereWithoutPerformedByInput = {
    where: Prisma.CheckMoveScalarWhereInput;
    data: Prisma.XOR<Prisma.CheckMoveUpdateManyMutationInput, Prisma.CheckMoveUncheckedUpdateManyWithoutPerformedByInput>;
};
export type CheckMoveScalarWhereInput = {
    AND?: Prisma.CheckMoveScalarWhereInput | Prisma.CheckMoveScalarWhereInput[];
    OR?: Prisma.CheckMoveScalarWhereInput[];
    NOT?: Prisma.CheckMoveScalarWhereInput | Prisma.CheckMoveScalarWhereInput[];
    id?: Prisma.StringFilter<"CheckMove"> | string;
    checkId?: Prisma.StringFilter<"CheckMove"> | string;
    action?: Prisma.EnumCheckMoveActionFilter<"CheckMove"> | $Enums.CheckMoveAction;
    transactionId?: Prisma.StringNullableFilter<"CheckMove"> | string | null;
    description?: Prisma.StringNullableFilter<"CheckMove"> | string | null;
    performedById?: Prisma.StringNullableFilter<"CheckMove"> | string | null;
    performedAt?: Prisma.DateTimeFilter<"CheckMove"> | Date | string;
};
export type CheckMoveCreateWithoutTransactionInput = {
    id?: string;
    action: $Enums.CheckMoveAction;
    description?: string | null;
    performedAt?: Date | string;
    check: Prisma.CheckCreateNestedOneWithoutMovesInput;
    performedBy?: Prisma.UserCreateNestedOneWithoutCheckMovesInput;
};
export type CheckMoveUncheckedCreateWithoutTransactionInput = {
    id?: string;
    checkId: string;
    action: $Enums.CheckMoveAction;
    description?: string | null;
    performedById?: string | null;
    performedAt?: Date | string;
};
export type CheckMoveCreateOrConnectWithoutTransactionInput = {
    where: Prisma.CheckMoveWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckMoveCreateWithoutTransactionInput, Prisma.CheckMoveUncheckedCreateWithoutTransactionInput>;
};
export type CheckMoveCreateManyTransactionInputEnvelope = {
    data: Prisma.CheckMoveCreateManyTransactionInput | Prisma.CheckMoveCreateManyTransactionInput[];
    skipDuplicates?: boolean;
};
export type CheckMoveUpsertWithWhereUniqueWithoutTransactionInput = {
    where: Prisma.CheckMoveWhereUniqueInput;
    update: Prisma.XOR<Prisma.CheckMoveUpdateWithoutTransactionInput, Prisma.CheckMoveUncheckedUpdateWithoutTransactionInput>;
    create: Prisma.XOR<Prisma.CheckMoveCreateWithoutTransactionInput, Prisma.CheckMoveUncheckedCreateWithoutTransactionInput>;
};
export type CheckMoveUpdateWithWhereUniqueWithoutTransactionInput = {
    where: Prisma.CheckMoveWhereUniqueInput;
    data: Prisma.XOR<Prisma.CheckMoveUpdateWithoutTransactionInput, Prisma.CheckMoveUncheckedUpdateWithoutTransactionInput>;
};
export type CheckMoveUpdateManyWithWhereWithoutTransactionInput = {
    where: Prisma.CheckMoveScalarWhereInput;
    data: Prisma.XOR<Prisma.CheckMoveUpdateManyMutationInput, Prisma.CheckMoveUncheckedUpdateManyWithoutTransactionInput>;
};
export type CheckMoveCreateWithoutCheckInput = {
    id?: string;
    action: $Enums.CheckMoveAction;
    description?: string | null;
    performedAt?: Date | string;
    transaction?: Prisma.TransactionCreateNestedOneWithoutCheckMovesInput;
    performedBy?: Prisma.UserCreateNestedOneWithoutCheckMovesInput;
};
export type CheckMoveUncheckedCreateWithoutCheckInput = {
    id?: string;
    action: $Enums.CheckMoveAction;
    transactionId?: string | null;
    description?: string | null;
    performedById?: string | null;
    performedAt?: Date | string;
};
export type CheckMoveCreateOrConnectWithoutCheckInput = {
    where: Prisma.CheckMoveWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckMoveCreateWithoutCheckInput, Prisma.CheckMoveUncheckedCreateWithoutCheckInput>;
};
export type CheckMoveCreateManyCheckInputEnvelope = {
    data: Prisma.CheckMoveCreateManyCheckInput | Prisma.CheckMoveCreateManyCheckInput[];
    skipDuplicates?: boolean;
};
export type CheckMoveUpsertWithWhereUniqueWithoutCheckInput = {
    where: Prisma.CheckMoveWhereUniqueInput;
    update: Prisma.XOR<Prisma.CheckMoveUpdateWithoutCheckInput, Prisma.CheckMoveUncheckedUpdateWithoutCheckInput>;
    create: Prisma.XOR<Prisma.CheckMoveCreateWithoutCheckInput, Prisma.CheckMoveUncheckedCreateWithoutCheckInput>;
};
export type CheckMoveUpdateWithWhereUniqueWithoutCheckInput = {
    where: Prisma.CheckMoveWhereUniqueInput;
    data: Prisma.XOR<Prisma.CheckMoveUpdateWithoutCheckInput, Prisma.CheckMoveUncheckedUpdateWithoutCheckInput>;
};
export type CheckMoveUpdateManyWithWhereWithoutCheckInput = {
    where: Prisma.CheckMoveScalarWhereInput;
    data: Prisma.XOR<Prisma.CheckMoveUpdateManyMutationInput, Prisma.CheckMoveUncheckedUpdateManyWithoutCheckInput>;
};
export type CheckMoveCreateManyPerformedByInput = {
    id?: string;
    checkId: string;
    action: $Enums.CheckMoveAction;
    transactionId?: string | null;
    description?: string | null;
    performedAt?: Date | string;
};
export type CheckMoveUpdateWithoutPerformedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    check?: Prisma.CheckUpdateOneRequiredWithoutMovesNestedInput;
    transaction?: Prisma.TransactionUpdateOneWithoutCheckMovesNestedInput;
};
export type CheckMoveUncheckedUpdateWithoutPerformedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    transactionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckMoveUncheckedUpdateManyWithoutPerformedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    transactionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckMoveCreateManyTransactionInput = {
    id?: string;
    checkId: string;
    action: $Enums.CheckMoveAction;
    description?: string | null;
    performedById?: string | null;
    performedAt?: Date | string;
};
export type CheckMoveUpdateWithoutTransactionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    check?: Prisma.CheckUpdateOneRequiredWithoutMovesNestedInput;
    performedBy?: Prisma.UserUpdateOneWithoutCheckMovesNestedInput;
};
export type CheckMoveUncheckedUpdateWithoutTransactionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckMoveUncheckedUpdateManyWithoutTransactionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    checkId?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckMoveCreateManyCheckInput = {
    id?: string;
    action: $Enums.CheckMoveAction;
    transactionId?: string | null;
    description?: string | null;
    performedById?: string | null;
    performedAt?: Date | string;
};
export type CheckMoveUpdateWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transaction?: Prisma.TransactionUpdateOneWithoutCheckMovesNestedInput;
    performedBy?: Prisma.UserUpdateOneWithoutCheckMovesNestedInput;
};
export type CheckMoveUncheckedUpdateWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    transactionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckMoveUncheckedUpdateManyWithoutCheckInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    action?: Prisma.EnumCheckMoveActionFieldUpdateOperationsInput | $Enums.CheckMoveAction;
    transactionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    performedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckMoveSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    checkId?: boolean;
    action?: boolean;
    transactionId?: boolean;
    description?: boolean;
    performedById?: boolean;
    performedAt?: boolean;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.CheckMove$transactionArgs<ExtArgs>;
    performedBy?: boolean | Prisma.CheckMove$performedByArgs<ExtArgs>;
}, ExtArgs["result"]["checkMove"]>;
export type CheckMoveSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    checkId?: boolean;
    action?: boolean;
    transactionId?: boolean;
    description?: boolean;
    performedById?: boolean;
    performedAt?: boolean;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.CheckMove$transactionArgs<ExtArgs>;
    performedBy?: boolean | Prisma.CheckMove$performedByArgs<ExtArgs>;
}, ExtArgs["result"]["checkMove"]>;
export type CheckMoveSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    checkId?: boolean;
    action?: boolean;
    transactionId?: boolean;
    description?: boolean;
    performedById?: boolean;
    performedAt?: boolean;
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.CheckMove$transactionArgs<ExtArgs>;
    performedBy?: boolean | Prisma.CheckMove$performedByArgs<ExtArgs>;
}, ExtArgs["result"]["checkMove"]>;
export type CheckMoveSelectScalar = {
    id?: boolean;
    checkId?: boolean;
    action?: boolean;
    transactionId?: boolean;
    description?: boolean;
    performedById?: boolean;
    performedAt?: boolean;
};
export type CheckMoveOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "checkId" | "action" | "transactionId" | "description" | "performedById" | "performedAt", ExtArgs["result"]["checkMove"]>;
export type CheckMoveInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.CheckMove$transactionArgs<ExtArgs>;
    performedBy?: boolean | Prisma.CheckMove$performedByArgs<ExtArgs>;
};
export type CheckMoveIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.CheckMove$transactionArgs<ExtArgs>;
    performedBy?: boolean | Prisma.CheckMove$performedByArgs<ExtArgs>;
};
export type CheckMoveIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    check?: boolean | Prisma.CheckDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.CheckMove$transactionArgs<ExtArgs>;
    performedBy?: boolean | Prisma.CheckMove$performedByArgs<ExtArgs>;
};
export type $CheckMovePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CheckMove";
    objects: {
        check: Prisma.$CheckPayload<ExtArgs>;
        transaction: Prisma.$TransactionPayload<ExtArgs> | null;
        performedBy: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        checkId: string;
        action: $Enums.CheckMoveAction;
        transactionId: string | null;
        description: string | null;
        performedById: string | null;
        performedAt: Date;
    }, ExtArgs["result"]["checkMove"]>;
    composites: {};
};
export type CheckMoveGetPayload<S extends boolean | null | undefined | CheckMoveDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CheckMovePayload, S>;
export type CheckMoveCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CheckMoveFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CheckMoveCountAggregateInputType | true;
};
export interface CheckMoveDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CheckMove'];
        meta: {
            name: 'CheckMove';
        };
    };
    /**
     * Find zero or one CheckMove that matches the filter.
     * @param {CheckMoveFindUniqueArgs} args - Arguments to find a CheckMove
     * @example
     * // Get one CheckMove
     * const checkMove = await prisma.checkMove.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CheckMoveFindUniqueArgs>(args: Prisma.SelectSubset<T, CheckMoveFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CheckMoveClient<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one CheckMove that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CheckMoveFindUniqueOrThrowArgs} args - Arguments to find a CheckMove
     * @example
     * // Get one CheckMove
     * const checkMove = await prisma.checkMove.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CheckMoveFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CheckMoveFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CheckMoveClient<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CheckMove that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckMoveFindFirstArgs} args - Arguments to find a CheckMove
     * @example
     * // Get one CheckMove
     * const checkMove = await prisma.checkMove.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CheckMoveFindFirstArgs>(args?: Prisma.SelectSubset<T, CheckMoveFindFirstArgs<ExtArgs>>): Prisma.Prisma__CheckMoveClient<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CheckMove that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckMoveFindFirstOrThrowArgs} args - Arguments to find a CheckMove
     * @example
     * // Get one CheckMove
     * const checkMove = await prisma.checkMove.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CheckMoveFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CheckMoveFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CheckMoveClient<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more CheckMoves that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckMoveFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CheckMoves
     * const checkMoves = await prisma.checkMove.findMany()
     *
     * // Get first 10 CheckMoves
     * const checkMoves = await prisma.checkMove.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const checkMoveWithIdOnly = await prisma.checkMove.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CheckMoveFindManyArgs>(args?: Prisma.SelectSubset<T, CheckMoveFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a CheckMove.
     * @param {CheckMoveCreateArgs} args - Arguments to create a CheckMove.
     * @example
     * // Create one CheckMove
     * const CheckMove = await prisma.checkMove.create({
     *   data: {
     *     // ... data to create a CheckMove
     *   }
     * })
     *
     */
    create<T extends CheckMoveCreateArgs>(args: Prisma.SelectSubset<T, CheckMoveCreateArgs<ExtArgs>>): Prisma.Prisma__CheckMoveClient<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many CheckMoves.
     * @param {CheckMoveCreateManyArgs} args - Arguments to create many CheckMoves.
     * @example
     * // Create many CheckMoves
     * const checkMove = await prisma.checkMove.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CheckMoveCreateManyArgs>(args?: Prisma.SelectSubset<T, CheckMoveCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many CheckMoves and returns the data saved in the database.
     * @param {CheckMoveCreateManyAndReturnArgs} args - Arguments to create many CheckMoves.
     * @example
     * // Create many CheckMoves
     * const checkMove = await prisma.checkMove.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many CheckMoves and only return the `id`
     * const checkMoveWithIdOnly = await prisma.checkMove.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CheckMoveCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CheckMoveCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a CheckMove.
     * @param {CheckMoveDeleteArgs} args - Arguments to delete one CheckMove.
     * @example
     * // Delete one CheckMove
     * const CheckMove = await prisma.checkMove.delete({
     *   where: {
     *     // ... filter to delete one CheckMove
     *   }
     * })
     *
     */
    delete<T extends CheckMoveDeleteArgs>(args: Prisma.SelectSubset<T, CheckMoveDeleteArgs<ExtArgs>>): Prisma.Prisma__CheckMoveClient<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one CheckMove.
     * @param {CheckMoveUpdateArgs} args - Arguments to update one CheckMove.
     * @example
     * // Update one CheckMove
     * const checkMove = await prisma.checkMove.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CheckMoveUpdateArgs>(args: Prisma.SelectSubset<T, CheckMoveUpdateArgs<ExtArgs>>): Prisma.Prisma__CheckMoveClient<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more CheckMoves.
     * @param {CheckMoveDeleteManyArgs} args - Arguments to filter CheckMoves to delete.
     * @example
     * // Delete a few CheckMoves
     * const { count } = await prisma.checkMove.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CheckMoveDeleteManyArgs>(args?: Prisma.SelectSubset<T, CheckMoveDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CheckMoves.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckMoveUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CheckMoves
     * const checkMove = await prisma.checkMove.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CheckMoveUpdateManyArgs>(args: Prisma.SelectSubset<T, CheckMoveUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CheckMoves and returns the data updated in the database.
     * @param {CheckMoveUpdateManyAndReturnArgs} args - Arguments to update many CheckMoves.
     * @example
     * // Update many CheckMoves
     * const checkMove = await prisma.checkMove.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more CheckMoves and only return the `id`
     * const checkMoveWithIdOnly = await prisma.checkMove.updateManyAndReturn({
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
    updateManyAndReturn<T extends CheckMoveUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CheckMoveUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one CheckMove.
     * @param {CheckMoveUpsertArgs} args - Arguments to update or create a CheckMove.
     * @example
     * // Update or create a CheckMove
     * const checkMove = await prisma.checkMove.upsert({
     *   create: {
     *     // ... data to create a CheckMove
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CheckMove we want to update
     *   }
     * })
     */
    upsert<T extends CheckMoveUpsertArgs>(args: Prisma.SelectSubset<T, CheckMoveUpsertArgs<ExtArgs>>): Prisma.Prisma__CheckMoveClient<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of CheckMoves.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckMoveCountArgs} args - Arguments to filter CheckMoves to count.
     * @example
     * // Count the number of CheckMoves
     * const count = await prisma.checkMove.count({
     *   where: {
     *     // ... the filter for the CheckMoves we want to count
     *   }
     * })
    **/
    count<T extends CheckMoveCountArgs>(args?: Prisma.Subset<T, CheckMoveCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CheckMoveCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a CheckMove.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckMoveAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CheckMoveAggregateArgs>(args: Prisma.Subset<T, CheckMoveAggregateArgs>): Prisma.PrismaPromise<GetCheckMoveAggregateType<T>>;
    /**
     * Group by CheckMove.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckMoveGroupByArgs} args - Group by arguments.
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
    groupBy<T extends CheckMoveGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CheckMoveGroupByArgs['orderBy'];
    } : {
        orderBy?: CheckMoveGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CheckMoveGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCheckMoveGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the CheckMove model
     */
    readonly fields: CheckMoveFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for CheckMove.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__CheckMoveClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    check<T extends Prisma.CheckDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CheckDefaultArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    transaction<T extends Prisma.CheckMove$transactionArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CheckMove$transactionArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    performedBy<T extends Prisma.CheckMove$performedByArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CheckMove$performedByArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the CheckMove model
 */
export interface CheckMoveFieldRefs {
    readonly id: Prisma.FieldRef<"CheckMove", 'String'>;
    readonly checkId: Prisma.FieldRef<"CheckMove", 'String'>;
    readonly action: Prisma.FieldRef<"CheckMove", 'CheckMoveAction'>;
    readonly transactionId: Prisma.FieldRef<"CheckMove", 'String'>;
    readonly description: Prisma.FieldRef<"CheckMove", 'String'>;
    readonly performedById: Prisma.FieldRef<"CheckMove", 'String'>;
    readonly performedAt: Prisma.FieldRef<"CheckMove", 'DateTime'>;
}
/**
 * CheckMove findUnique
 */
export type CheckMoveFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which CheckMove to fetch.
     */
    where: Prisma.CheckMoveWhereUniqueInput;
};
/**
 * CheckMove findUniqueOrThrow
 */
export type CheckMoveFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which CheckMove to fetch.
     */
    where: Prisma.CheckMoveWhereUniqueInput;
};
/**
 * CheckMove findFirst
 */
export type CheckMoveFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which CheckMove to fetch.
     */
    where?: Prisma.CheckMoveWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CheckMoves to fetch.
     */
    orderBy?: Prisma.CheckMoveOrderByWithRelationInput | Prisma.CheckMoveOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CheckMoves.
     */
    cursor?: Prisma.CheckMoveWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CheckMoves from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CheckMoves.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CheckMoves.
     */
    distinct?: Prisma.CheckMoveScalarFieldEnum | Prisma.CheckMoveScalarFieldEnum[];
};
/**
 * CheckMove findFirstOrThrow
 */
export type CheckMoveFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which CheckMove to fetch.
     */
    where?: Prisma.CheckMoveWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CheckMoves to fetch.
     */
    orderBy?: Prisma.CheckMoveOrderByWithRelationInput | Prisma.CheckMoveOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CheckMoves.
     */
    cursor?: Prisma.CheckMoveWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CheckMoves from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CheckMoves.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CheckMoves.
     */
    distinct?: Prisma.CheckMoveScalarFieldEnum | Prisma.CheckMoveScalarFieldEnum[];
};
/**
 * CheckMove findMany
 */
export type CheckMoveFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which CheckMoves to fetch.
     */
    where?: Prisma.CheckMoveWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CheckMoves to fetch.
     */
    orderBy?: Prisma.CheckMoveOrderByWithRelationInput | Prisma.CheckMoveOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing CheckMoves.
     */
    cursor?: Prisma.CheckMoveWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CheckMoves from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CheckMoves.
     */
    skip?: number;
    distinct?: Prisma.CheckMoveScalarFieldEnum | Prisma.CheckMoveScalarFieldEnum[];
};
/**
 * CheckMove create
 */
export type CheckMoveCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a CheckMove.
     */
    data: Prisma.XOR<Prisma.CheckMoveCreateInput, Prisma.CheckMoveUncheckedCreateInput>;
};
/**
 * CheckMove createMany
 */
export type CheckMoveCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many CheckMoves.
     */
    data: Prisma.CheckMoveCreateManyInput | Prisma.CheckMoveCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * CheckMove createManyAndReturn
 */
export type CheckMoveCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckMove
     */
    select?: Prisma.CheckMoveSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CheckMove
     */
    omit?: Prisma.CheckMoveOmit<ExtArgs> | null;
    /**
     * The data used to create many CheckMoves.
     */
    data: Prisma.CheckMoveCreateManyInput | Prisma.CheckMoveCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CheckMoveIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * CheckMove update
 */
export type CheckMoveUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a CheckMove.
     */
    data: Prisma.XOR<Prisma.CheckMoveUpdateInput, Prisma.CheckMoveUncheckedUpdateInput>;
    /**
     * Choose, which CheckMove to update.
     */
    where: Prisma.CheckMoveWhereUniqueInput;
};
/**
 * CheckMove updateMany
 */
export type CheckMoveUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update CheckMoves.
     */
    data: Prisma.XOR<Prisma.CheckMoveUpdateManyMutationInput, Prisma.CheckMoveUncheckedUpdateManyInput>;
    /**
     * Filter which CheckMoves to update
     */
    where?: Prisma.CheckMoveWhereInput;
    /**
     * Limit how many CheckMoves to update.
     */
    limit?: number;
};
/**
 * CheckMove updateManyAndReturn
 */
export type CheckMoveUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckMove
     */
    select?: Prisma.CheckMoveSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CheckMove
     */
    omit?: Prisma.CheckMoveOmit<ExtArgs> | null;
    /**
     * The data used to update CheckMoves.
     */
    data: Prisma.XOR<Prisma.CheckMoveUpdateManyMutationInput, Prisma.CheckMoveUncheckedUpdateManyInput>;
    /**
     * Filter which CheckMoves to update
     */
    where?: Prisma.CheckMoveWhereInput;
    /**
     * Limit how many CheckMoves to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CheckMoveIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * CheckMove upsert
 */
export type CheckMoveUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the CheckMove to update in case it exists.
     */
    where: Prisma.CheckMoveWhereUniqueInput;
    /**
     * In case the CheckMove found by the `where` argument doesn't exist, create a new CheckMove with this data.
     */
    create: Prisma.XOR<Prisma.CheckMoveCreateInput, Prisma.CheckMoveUncheckedCreateInput>;
    /**
     * In case the CheckMove was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.CheckMoveUpdateInput, Prisma.CheckMoveUncheckedUpdateInput>;
};
/**
 * CheckMove delete
 */
export type CheckMoveDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which CheckMove to delete.
     */
    where: Prisma.CheckMoveWhereUniqueInput;
};
/**
 * CheckMove deleteMany
 */
export type CheckMoveDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CheckMoves to delete
     */
    where?: Prisma.CheckMoveWhereInput;
    /**
     * Limit how many CheckMoves to delete.
     */
    limit?: number;
};
/**
 * CheckMove.transaction
 */
export type CheckMove$transactionArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.TransactionWhereInput;
};
/**
 * CheckMove.performedBy
 */
export type CheckMove$performedByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: Prisma.UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: Prisma.UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
/**
 * CheckMove without action
 */
export type CheckMoveDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=CheckMove.d.ts.map