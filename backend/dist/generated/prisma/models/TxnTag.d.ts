import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model TxnTag
 *
 */
export type TxnTagModel = runtime.Types.Result.DefaultSelection<Prisma.$TxnTagPayload>;
export type AggregateTxnTag = {
    _count: TxnTagCountAggregateOutputType | null;
    _min: TxnTagMinAggregateOutputType | null;
    _max: TxnTagMaxAggregateOutputType | null;
};
export type TxnTagMinAggregateOutputType = {
    transactionId: string | null;
    tagId: string | null;
};
export type TxnTagMaxAggregateOutputType = {
    transactionId: string | null;
    tagId: string | null;
};
export type TxnTagCountAggregateOutputType = {
    transactionId: number;
    tagId: number;
    _all: number;
};
export type TxnTagMinAggregateInputType = {
    transactionId?: true;
    tagId?: true;
};
export type TxnTagMaxAggregateInputType = {
    transactionId?: true;
    tagId?: true;
};
export type TxnTagCountAggregateInputType = {
    transactionId?: true;
    tagId?: true;
    _all?: true;
};
export type TxnTagAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which TxnTag to aggregate.
     */
    where?: Prisma.TxnTagWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TxnTags to fetch.
     */
    orderBy?: Prisma.TxnTagOrderByWithRelationInput | Prisma.TxnTagOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.TxnTagWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TxnTags from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TxnTags.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned TxnTags
    **/
    _count?: true | TxnTagCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: TxnTagMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: TxnTagMaxAggregateInputType;
};
export type GetTxnTagAggregateType<T extends TxnTagAggregateArgs> = {
    [P in keyof T & keyof AggregateTxnTag]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTxnTag[P]> : Prisma.GetScalarType<T[P], AggregateTxnTag[P]>;
};
export type TxnTagGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TxnTagWhereInput;
    orderBy?: Prisma.TxnTagOrderByWithAggregationInput | Prisma.TxnTagOrderByWithAggregationInput[];
    by: Prisma.TxnTagScalarFieldEnum[] | Prisma.TxnTagScalarFieldEnum;
    having?: Prisma.TxnTagScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TxnTagCountAggregateInputType | true;
    _min?: TxnTagMinAggregateInputType;
    _max?: TxnTagMaxAggregateInputType;
};
export type TxnTagGroupByOutputType = {
    transactionId: string;
    tagId: string;
    _count: TxnTagCountAggregateOutputType | null;
    _min: TxnTagMinAggregateOutputType | null;
    _max: TxnTagMaxAggregateOutputType | null;
};
type GetTxnTagGroupByPayload<T extends TxnTagGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TxnTagGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TxnTagGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TxnTagGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TxnTagGroupByOutputType[P]>;
}>>;
export type TxnTagWhereInput = {
    AND?: Prisma.TxnTagWhereInput | Prisma.TxnTagWhereInput[];
    OR?: Prisma.TxnTagWhereInput[];
    NOT?: Prisma.TxnTagWhereInput | Prisma.TxnTagWhereInput[];
    transactionId?: Prisma.StringFilter<"TxnTag"> | string;
    tagId?: Prisma.StringFilter<"TxnTag"> | string;
    transaction?: Prisma.XOR<Prisma.TransactionScalarRelationFilter, Prisma.TransactionWhereInput>;
    tag?: Prisma.XOR<Prisma.TagScalarRelationFilter, Prisma.TagWhereInput>;
};
export type TxnTagOrderByWithRelationInput = {
    transactionId?: Prisma.SortOrder;
    tagId?: Prisma.SortOrder;
    transaction?: Prisma.TransactionOrderByWithRelationInput;
    tag?: Prisma.TagOrderByWithRelationInput;
};
export type TxnTagWhereUniqueInput = Prisma.AtLeast<{
    transactionId_tagId?: Prisma.TxnTagTransactionIdTagIdCompoundUniqueInput;
    AND?: Prisma.TxnTagWhereInput | Prisma.TxnTagWhereInput[];
    OR?: Prisma.TxnTagWhereInput[];
    NOT?: Prisma.TxnTagWhereInput | Prisma.TxnTagWhereInput[];
    transactionId?: Prisma.StringFilter<"TxnTag"> | string;
    tagId?: Prisma.StringFilter<"TxnTag"> | string;
    transaction?: Prisma.XOR<Prisma.TransactionScalarRelationFilter, Prisma.TransactionWhereInput>;
    tag?: Prisma.XOR<Prisma.TagScalarRelationFilter, Prisma.TagWhereInput>;
}, "transactionId_tagId">;
export type TxnTagOrderByWithAggregationInput = {
    transactionId?: Prisma.SortOrder;
    tagId?: Prisma.SortOrder;
    _count?: Prisma.TxnTagCountOrderByAggregateInput;
    _max?: Prisma.TxnTagMaxOrderByAggregateInput;
    _min?: Prisma.TxnTagMinOrderByAggregateInput;
};
export type TxnTagScalarWhereWithAggregatesInput = {
    AND?: Prisma.TxnTagScalarWhereWithAggregatesInput | Prisma.TxnTagScalarWhereWithAggregatesInput[];
    OR?: Prisma.TxnTagScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TxnTagScalarWhereWithAggregatesInput | Prisma.TxnTagScalarWhereWithAggregatesInput[];
    transactionId?: Prisma.StringWithAggregatesFilter<"TxnTag"> | string;
    tagId?: Prisma.StringWithAggregatesFilter<"TxnTag"> | string;
};
export type TxnTagCreateInput = {
    transaction: Prisma.TransactionCreateNestedOneWithoutTagsInput;
    tag: Prisma.TagCreateNestedOneWithoutTransactionsInput;
};
export type TxnTagUncheckedCreateInput = {
    transactionId: string;
    tagId: string;
};
export type TxnTagUpdateInput = {
    transaction?: Prisma.TransactionUpdateOneRequiredWithoutTagsNestedInput;
    tag?: Prisma.TagUpdateOneRequiredWithoutTransactionsNestedInput;
};
export type TxnTagUncheckedUpdateInput = {
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
    tagId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TxnTagCreateManyInput = {
    transactionId: string;
    tagId: string;
};
export type TxnTagUpdateManyMutationInput = {};
export type TxnTagUncheckedUpdateManyInput = {
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
    tagId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TxnTagListRelationFilter = {
    every?: Prisma.TxnTagWhereInput;
    some?: Prisma.TxnTagWhereInput;
    none?: Prisma.TxnTagWhereInput;
};
export type TxnTagOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TxnTagTransactionIdTagIdCompoundUniqueInput = {
    transactionId: string;
    tagId: string;
};
export type TxnTagCountOrderByAggregateInput = {
    transactionId?: Prisma.SortOrder;
    tagId?: Prisma.SortOrder;
};
export type TxnTagMaxOrderByAggregateInput = {
    transactionId?: Prisma.SortOrder;
    tagId?: Prisma.SortOrder;
};
export type TxnTagMinOrderByAggregateInput = {
    transactionId?: Prisma.SortOrder;
    tagId?: Prisma.SortOrder;
};
export type TxnTagCreateNestedManyWithoutTransactionInput = {
    create?: Prisma.XOR<Prisma.TxnTagCreateWithoutTransactionInput, Prisma.TxnTagUncheckedCreateWithoutTransactionInput> | Prisma.TxnTagCreateWithoutTransactionInput[] | Prisma.TxnTagUncheckedCreateWithoutTransactionInput[];
    connectOrCreate?: Prisma.TxnTagCreateOrConnectWithoutTransactionInput | Prisma.TxnTagCreateOrConnectWithoutTransactionInput[];
    createMany?: Prisma.TxnTagCreateManyTransactionInputEnvelope;
    connect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
};
export type TxnTagUncheckedCreateNestedManyWithoutTransactionInput = {
    create?: Prisma.XOR<Prisma.TxnTagCreateWithoutTransactionInput, Prisma.TxnTagUncheckedCreateWithoutTransactionInput> | Prisma.TxnTagCreateWithoutTransactionInput[] | Prisma.TxnTagUncheckedCreateWithoutTransactionInput[];
    connectOrCreate?: Prisma.TxnTagCreateOrConnectWithoutTransactionInput | Prisma.TxnTagCreateOrConnectWithoutTransactionInput[];
    createMany?: Prisma.TxnTagCreateManyTransactionInputEnvelope;
    connect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
};
export type TxnTagUpdateManyWithoutTransactionNestedInput = {
    create?: Prisma.XOR<Prisma.TxnTagCreateWithoutTransactionInput, Prisma.TxnTagUncheckedCreateWithoutTransactionInput> | Prisma.TxnTagCreateWithoutTransactionInput[] | Prisma.TxnTagUncheckedCreateWithoutTransactionInput[];
    connectOrCreate?: Prisma.TxnTagCreateOrConnectWithoutTransactionInput | Prisma.TxnTagCreateOrConnectWithoutTransactionInput[];
    upsert?: Prisma.TxnTagUpsertWithWhereUniqueWithoutTransactionInput | Prisma.TxnTagUpsertWithWhereUniqueWithoutTransactionInput[];
    createMany?: Prisma.TxnTagCreateManyTransactionInputEnvelope;
    set?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    disconnect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    delete?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    connect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    update?: Prisma.TxnTagUpdateWithWhereUniqueWithoutTransactionInput | Prisma.TxnTagUpdateWithWhereUniqueWithoutTransactionInput[];
    updateMany?: Prisma.TxnTagUpdateManyWithWhereWithoutTransactionInput | Prisma.TxnTagUpdateManyWithWhereWithoutTransactionInput[];
    deleteMany?: Prisma.TxnTagScalarWhereInput | Prisma.TxnTagScalarWhereInput[];
};
export type TxnTagUncheckedUpdateManyWithoutTransactionNestedInput = {
    create?: Prisma.XOR<Prisma.TxnTagCreateWithoutTransactionInput, Prisma.TxnTagUncheckedCreateWithoutTransactionInput> | Prisma.TxnTagCreateWithoutTransactionInput[] | Prisma.TxnTagUncheckedCreateWithoutTransactionInput[];
    connectOrCreate?: Prisma.TxnTagCreateOrConnectWithoutTransactionInput | Prisma.TxnTagCreateOrConnectWithoutTransactionInput[];
    upsert?: Prisma.TxnTagUpsertWithWhereUniqueWithoutTransactionInput | Prisma.TxnTagUpsertWithWhereUniqueWithoutTransactionInput[];
    createMany?: Prisma.TxnTagCreateManyTransactionInputEnvelope;
    set?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    disconnect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    delete?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    connect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    update?: Prisma.TxnTagUpdateWithWhereUniqueWithoutTransactionInput | Prisma.TxnTagUpdateWithWhereUniqueWithoutTransactionInput[];
    updateMany?: Prisma.TxnTagUpdateManyWithWhereWithoutTransactionInput | Prisma.TxnTagUpdateManyWithWhereWithoutTransactionInput[];
    deleteMany?: Prisma.TxnTagScalarWhereInput | Prisma.TxnTagScalarWhereInput[];
};
export type TxnTagCreateNestedManyWithoutTagInput = {
    create?: Prisma.XOR<Prisma.TxnTagCreateWithoutTagInput, Prisma.TxnTagUncheckedCreateWithoutTagInput> | Prisma.TxnTagCreateWithoutTagInput[] | Prisma.TxnTagUncheckedCreateWithoutTagInput[];
    connectOrCreate?: Prisma.TxnTagCreateOrConnectWithoutTagInput | Prisma.TxnTagCreateOrConnectWithoutTagInput[];
    createMany?: Prisma.TxnTagCreateManyTagInputEnvelope;
    connect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
};
export type TxnTagUncheckedCreateNestedManyWithoutTagInput = {
    create?: Prisma.XOR<Prisma.TxnTagCreateWithoutTagInput, Prisma.TxnTagUncheckedCreateWithoutTagInput> | Prisma.TxnTagCreateWithoutTagInput[] | Prisma.TxnTagUncheckedCreateWithoutTagInput[];
    connectOrCreate?: Prisma.TxnTagCreateOrConnectWithoutTagInput | Prisma.TxnTagCreateOrConnectWithoutTagInput[];
    createMany?: Prisma.TxnTagCreateManyTagInputEnvelope;
    connect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
};
export type TxnTagUpdateManyWithoutTagNestedInput = {
    create?: Prisma.XOR<Prisma.TxnTagCreateWithoutTagInput, Prisma.TxnTagUncheckedCreateWithoutTagInput> | Prisma.TxnTagCreateWithoutTagInput[] | Prisma.TxnTagUncheckedCreateWithoutTagInput[];
    connectOrCreate?: Prisma.TxnTagCreateOrConnectWithoutTagInput | Prisma.TxnTagCreateOrConnectWithoutTagInput[];
    upsert?: Prisma.TxnTagUpsertWithWhereUniqueWithoutTagInput | Prisma.TxnTagUpsertWithWhereUniqueWithoutTagInput[];
    createMany?: Prisma.TxnTagCreateManyTagInputEnvelope;
    set?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    disconnect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    delete?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    connect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    update?: Prisma.TxnTagUpdateWithWhereUniqueWithoutTagInput | Prisma.TxnTagUpdateWithWhereUniqueWithoutTagInput[];
    updateMany?: Prisma.TxnTagUpdateManyWithWhereWithoutTagInput | Prisma.TxnTagUpdateManyWithWhereWithoutTagInput[];
    deleteMany?: Prisma.TxnTagScalarWhereInput | Prisma.TxnTagScalarWhereInput[];
};
export type TxnTagUncheckedUpdateManyWithoutTagNestedInput = {
    create?: Prisma.XOR<Prisma.TxnTagCreateWithoutTagInput, Prisma.TxnTagUncheckedCreateWithoutTagInput> | Prisma.TxnTagCreateWithoutTagInput[] | Prisma.TxnTagUncheckedCreateWithoutTagInput[];
    connectOrCreate?: Prisma.TxnTagCreateOrConnectWithoutTagInput | Prisma.TxnTagCreateOrConnectWithoutTagInput[];
    upsert?: Prisma.TxnTagUpsertWithWhereUniqueWithoutTagInput | Prisma.TxnTagUpsertWithWhereUniqueWithoutTagInput[];
    createMany?: Prisma.TxnTagCreateManyTagInputEnvelope;
    set?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    disconnect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    delete?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    connect?: Prisma.TxnTagWhereUniqueInput | Prisma.TxnTagWhereUniqueInput[];
    update?: Prisma.TxnTagUpdateWithWhereUniqueWithoutTagInput | Prisma.TxnTagUpdateWithWhereUniqueWithoutTagInput[];
    updateMany?: Prisma.TxnTagUpdateManyWithWhereWithoutTagInput | Prisma.TxnTagUpdateManyWithWhereWithoutTagInput[];
    deleteMany?: Prisma.TxnTagScalarWhereInput | Prisma.TxnTagScalarWhereInput[];
};
export type TxnTagCreateWithoutTransactionInput = {
    tag: Prisma.TagCreateNestedOneWithoutTransactionsInput;
};
export type TxnTagUncheckedCreateWithoutTransactionInput = {
    tagId: string;
};
export type TxnTagCreateOrConnectWithoutTransactionInput = {
    where: Prisma.TxnTagWhereUniqueInput;
    create: Prisma.XOR<Prisma.TxnTagCreateWithoutTransactionInput, Prisma.TxnTagUncheckedCreateWithoutTransactionInput>;
};
export type TxnTagCreateManyTransactionInputEnvelope = {
    data: Prisma.TxnTagCreateManyTransactionInput | Prisma.TxnTagCreateManyTransactionInput[];
    skipDuplicates?: boolean;
};
export type TxnTagUpsertWithWhereUniqueWithoutTransactionInput = {
    where: Prisma.TxnTagWhereUniqueInput;
    update: Prisma.XOR<Prisma.TxnTagUpdateWithoutTransactionInput, Prisma.TxnTagUncheckedUpdateWithoutTransactionInput>;
    create: Prisma.XOR<Prisma.TxnTagCreateWithoutTransactionInput, Prisma.TxnTagUncheckedCreateWithoutTransactionInput>;
};
export type TxnTagUpdateWithWhereUniqueWithoutTransactionInput = {
    where: Prisma.TxnTagWhereUniqueInput;
    data: Prisma.XOR<Prisma.TxnTagUpdateWithoutTransactionInput, Prisma.TxnTagUncheckedUpdateWithoutTransactionInput>;
};
export type TxnTagUpdateManyWithWhereWithoutTransactionInput = {
    where: Prisma.TxnTagScalarWhereInput;
    data: Prisma.XOR<Prisma.TxnTagUpdateManyMutationInput, Prisma.TxnTagUncheckedUpdateManyWithoutTransactionInput>;
};
export type TxnTagScalarWhereInput = {
    AND?: Prisma.TxnTagScalarWhereInput | Prisma.TxnTagScalarWhereInput[];
    OR?: Prisma.TxnTagScalarWhereInput[];
    NOT?: Prisma.TxnTagScalarWhereInput | Prisma.TxnTagScalarWhereInput[];
    transactionId?: Prisma.StringFilter<"TxnTag"> | string;
    tagId?: Prisma.StringFilter<"TxnTag"> | string;
};
export type TxnTagCreateWithoutTagInput = {
    transaction: Prisma.TransactionCreateNestedOneWithoutTagsInput;
};
export type TxnTagUncheckedCreateWithoutTagInput = {
    transactionId: string;
};
export type TxnTagCreateOrConnectWithoutTagInput = {
    where: Prisma.TxnTagWhereUniqueInput;
    create: Prisma.XOR<Prisma.TxnTagCreateWithoutTagInput, Prisma.TxnTagUncheckedCreateWithoutTagInput>;
};
export type TxnTagCreateManyTagInputEnvelope = {
    data: Prisma.TxnTagCreateManyTagInput | Prisma.TxnTagCreateManyTagInput[];
    skipDuplicates?: boolean;
};
export type TxnTagUpsertWithWhereUniqueWithoutTagInput = {
    where: Prisma.TxnTagWhereUniqueInput;
    update: Prisma.XOR<Prisma.TxnTagUpdateWithoutTagInput, Prisma.TxnTagUncheckedUpdateWithoutTagInput>;
    create: Prisma.XOR<Prisma.TxnTagCreateWithoutTagInput, Prisma.TxnTagUncheckedCreateWithoutTagInput>;
};
export type TxnTagUpdateWithWhereUniqueWithoutTagInput = {
    where: Prisma.TxnTagWhereUniqueInput;
    data: Prisma.XOR<Prisma.TxnTagUpdateWithoutTagInput, Prisma.TxnTagUncheckedUpdateWithoutTagInput>;
};
export type TxnTagUpdateManyWithWhereWithoutTagInput = {
    where: Prisma.TxnTagScalarWhereInput;
    data: Prisma.XOR<Prisma.TxnTagUpdateManyMutationInput, Prisma.TxnTagUncheckedUpdateManyWithoutTagInput>;
};
export type TxnTagCreateManyTransactionInput = {
    tagId: string;
};
export type TxnTagUpdateWithoutTransactionInput = {
    tag?: Prisma.TagUpdateOneRequiredWithoutTransactionsNestedInput;
};
export type TxnTagUncheckedUpdateWithoutTransactionInput = {
    tagId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TxnTagUncheckedUpdateManyWithoutTransactionInput = {
    tagId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TxnTagCreateManyTagInput = {
    transactionId: string;
};
export type TxnTagUpdateWithoutTagInput = {
    transaction?: Prisma.TransactionUpdateOneRequiredWithoutTagsNestedInput;
};
export type TxnTagUncheckedUpdateWithoutTagInput = {
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TxnTagUncheckedUpdateManyWithoutTagInput = {
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TxnTagSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    transactionId?: boolean;
    tagId?: boolean;
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    tag?: boolean | Prisma.TagDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["txnTag"]>;
export type TxnTagSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    transactionId?: boolean;
    tagId?: boolean;
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    tag?: boolean | Prisma.TagDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["txnTag"]>;
export type TxnTagSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    transactionId?: boolean;
    tagId?: boolean;
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    tag?: boolean | Prisma.TagDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["txnTag"]>;
export type TxnTagSelectScalar = {
    transactionId?: boolean;
    tagId?: boolean;
};
export type TxnTagOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"transactionId" | "tagId", ExtArgs["result"]["txnTag"]>;
export type TxnTagInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    tag?: boolean | Prisma.TagDefaultArgs<ExtArgs>;
};
export type TxnTagIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    tag?: boolean | Prisma.TagDefaultArgs<ExtArgs>;
};
export type TxnTagIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    tag?: boolean | Prisma.TagDefaultArgs<ExtArgs>;
};
export type $TxnTagPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TxnTag";
    objects: {
        transaction: Prisma.$TransactionPayload<ExtArgs>;
        tag: Prisma.$TagPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        transactionId: string;
        tagId: string;
    }, ExtArgs["result"]["txnTag"]>;
    composites: {};
};
export type TxnTagGetPayload<S extends boolean | null | undefined | TxnTagDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TxnTagPayload, S>;
export type TxnTagCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TxnTagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TxnTagCountAggregateInputType | true;
};
export interface TxnTagDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TxnTag'];
        meta: {
            name: 'TxnTag';
        };
    };
    /**
     * Find zero or one TxnTag that matches the filter.
     * @param {TxnTagFindUniqueArgs} args - Arguments to find a TxnTag
     * @example
     * // Get one TxnTag
     * const txnTag = await prisma.txnTag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TxnTagFindUniqueArgs>(args: Prisma.SelectSubset<T, TxnTagFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TxnTagClient<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one TxnTag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TxnTagFindUniqueOrThrowArgs} args - Arguments to find a TxnTag
     * @example
     * // Get one TxnTag
     * const txnTag = await prisma.txnTag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TxnTagFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TxnTagFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TxnTagClient<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first TxnTag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TxnTagFindFirstArgs} args - Arguments to find a TxnTag
     * @example
     * // Get one TxnTag
     * const txnTag = await prisma.txnTag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TxnTagFindFirstArgs>(args?: Prisma.SelectSubset<T, TxnTagFindFirstArgs<ExtArgs>>): Prisma.Prisma__TxnTagClient<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first TxnTag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TxnTagFindFirstOrThrowArgs} args - Arguments to find a TxnTag
     * @example
     * // Get one TxnTag
     * const txnTag = await prisma.txnTag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TxnTagFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TxnTagFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TxnTagClient<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more TxnTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TxnTagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TxnTags
     * const txnTags = await prisma.txnTag.findMany()
     *
     * // Get first 10 TxnTags
     * const txnTags = await prisma.txnTag.findMany({ take: 10 })
     *
     * // Only select the `transactionId`
     * const txnTagWithTransactionIdOnly = await prisma.txnTag.findMany({ select: { transactionId: true } })
     *
     */
    findMany<T extends TxnTagFindManyArgs>(args?: Prisma.SelectSubset<T, TxnTagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a TxnTag.
     * @param {TxnTagCreateArgs} args - Arguments to create a TxnTag.
     * @example
     * // Create one TxnTag
     * const TxnTag = await prisma.txnTag.create({
     *   data: {
     *     // ... data to create a TxnTag
     *   }
     * })
     *
     */
    create<T extends TxnTagCreateArgs>(args: Prisma.SelectSubset<T, TxnTagCreateArgs<ExtArgs>>): Prisma.Prisma__TxnTagClient<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many TxnTags.
     * @param {TxnTagCreateManyArgs} args - Arguments to create many TxnTags.
     * @example
     * // Create many TxnTags
     * const txnTag = await prisma.txnTag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TxnTagCreateManyArgs>(args?: Prisma.SelectSubset<T, TxnTagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many TxnTags and returns the data saved in the database.
     * @param {TxnTagCreateManyAndReturnArgs} args - Arguments to create many TxnTags.
     * @example
     * // Create many TxnTags
     * const txnTag = await prisma.txnTag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many TxnTags and only return the `transactionId`
     * const txnTagWithTransactionIdOnly = await prisma.txnTag.createManyAndReturn({
     *   select: { transactionId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TxnTagCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TxnTagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a TxnTag.
     * @param {TxnTagDeleteArgs} args - Arguments to delete one TxnTag.
     * @example
     * // Delete one TxnTag
     * const TxnTag = await prisma.txnTag.delete({
     *   where: {
     *     // ... filter to delete one TxnTag
     *   }
     * })
     *
     */
    delete<T extends TxnTagDeleteArgs>(args: Prisma.SelectSubset<T, TxnTagDeleteArgs<ExtArgs>>): Prisma.Prisma__TxnTagClient<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one TxnTag.
     * @param {TxnTagUpdateArgs} args - Arguments to update one TxnTag.
     * @example
     * // Update one TxnTag
     * const txnTag = await prisma.txnTag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TxnTagUpdateArgs>(args: Prisma.SelectSubset<T, TxnTagUpdateArgs<ExtArgs>>): Prisma.Prisma__TxnTagClient<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more TxnTags.
     * @param {TxnTagDeleteManyArgs} args - Arguments to filter TxnTags to delete.
     * @example
     * // Delete a few TxnTags
     * const { count } = await prisma.txnTag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TxnTagDeleteManyArgs>(args?: Prisma.SelectSubset<T, TxnTagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more TxnTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TxnTagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TxnTags
     * const txnTag = await prisma.txnTag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TxnTagUpdateManyArgs>(args: Prisma.SelectSubset<T, TxnTagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more TxnTags and returns the data updated in the database.
     * @param {TxnTagUpdateManyAndReturnArgs} args - Arguments to update many TxnTags.
     * @example
     * // Update many TxnTags
     * const txnTag = await prisma.txnTag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more TxnTags and only return the `transactionId`
     * const txnTagWithTransactionIdOnly = await prisma.txnTag.updateManyAndReturn({
     *   select: { transactionId: true },
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
    updateManyAndReturn<T extends TxnTagUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TxnTagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one TxnTag.
     * @param {TxnTagUpsertArgs} args - Arguments to update or create a TxnTag.
     * @example
     * // Update or create a TxnTag
     * const txnTag = await prisma.txnTag.upsert({
     *   create: {
     *     // ... data to create a TxnTag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TxnTag we want to update
     *   }
     * })
     */
    upsert<T extends TxnTagUpsertArgs>(args: Prisma.SelectSubset<T, TxnTagUpsertArgs<ExtArgs>>): Prisma.Prisma__TxnTagClient<runtime.Types.Result.GetResult<Prisma.$TxnTagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of TxnTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TxnTagCountArgs} args - Arguments to filter TxnTags to count.
     * @example
     * // Count the number of TxnTags
     * const count = await prisma.txnTag.count({
     *   where: {
     *     // ... the filter for the TxnTags we want to count
     *   }
     * })
    **/
    count<T extends TxnTagCountArgs>(args?: Prisma.Subset<T, TxnTagCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TxnTagCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a TxnTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TxnTagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TxnTagAggregateArgs>(args: Prisma.Subset<T, TxnTagAggregateArgs>): Prisma.PrismaPromise<GetTxnTagAggregateType<T>>;
    /**
     * Group by TxnTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TxnTagGroupByArgs} args - Group by arguments.
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
    groupBy<T extends TxnTagGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TxnTagGroupByArgs['orderBy'];
    } : {
        orderBy?: TxnTagGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TxnTagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTxnTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the TxnTag model
     */
    readonly fields: TxnTagFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for TxnTag.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__TxnTagClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    transaction<T extends Prisma.TransactionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TransactionDefaultArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tag<T extends Prisma.TagDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TagDefaultArgs<ExtArgs>>): Prisma.Prisma__TagClient<runtime.Types.Result.GetResult<Prisma.$TagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the TxnTag model
 */
export interface TxnTagFieldRefs {
    readonly transactionId: Prisma.FieldRef<"TxnTag", 'String'>;
    readonly tagId: Prisma.FieldRef<"TxnTag", 'String'>;
}
/**
 * TxnTag findUnique
 */
export type TxnTagFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which TxnTag to fetch.
     */
    where: Prisma.TxnTagWhereUniqueInput;
};
/**
 * TxnTag findUniqueOrThrow
 */
export type TxnTagFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which TxnTag to fetch.
     */
    where: Prisma.TxnTagWhereUniqueInput;
};
/**
 * TxnTag findFirst
 */
export type TxnTagFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which TxnTag to fetch.
     */
    where?: Prisma.TxnTagWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TxnTags to fetch.
     */
    orderBy?: Prisma.TxnTagOrderByWithRelationInput | Prisma.TxnTagOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TxnTags.
     */
    cursor?: Prisma.TxnTagWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TxnTags from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TxnTags.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TxnTags.
     */
    distinct?: Prisma.TxnTagScalarFieldEnum | Prisma.TxnTagScalarFieldEnum[];
};
/**
 * TxnTag findFirstOrThrow
 */
export type TxnTagFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which TxnTag to fetch.
     */
    where?: Prisma.TxnTagWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TxnTags to fetch.
     */
    orderBy?: Prisma.TxnTagOrderByWithRelationInput | Prisma.TxnTagOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TxnTags.
     */
    cursor?: Prisma.TxnTagWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TxnTags from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TxnTags.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TxnTags.
     */
    distinct?: Prisma.TxnTagScalarFieldEnum | Prisma.TxnTagScalarFieldEnum[];
};
/**
 * TxnTag findMany
 */
export type TxnTagFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which TxnTags to fetch.
     */
    where?: Prisma.TxnTagWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TxnTags to fetch.
     */
    orderBy?: Prisma.TxnTagOrderByWithRelationInput | Prisma.TxnTagOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing TxnTags.
     */
    cursor?: Prisma.TxnTagWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TxnTags from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TxnTags.
     */
    skip?: number;
    distinct?: Prisma.TxnTagScalarFieldEnum | Prisma.TxnTagScalarFieldEnum[];
};
/**
 * TxnTag create
 */
export type TxnTagCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a TxnTag.
     */
    data: Prisma.XOR<Prisma.TxnTagCreateInput, Prisma.TxnTagUncheckedCreateInput>;
};
/**
 * TxnTag createMany
 */
export type TxnTagCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many TxnTags.
     */
    data: Prisma.TxnTagCreateManyInput | Prisma.TxnTagCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * TxnTag createManyAndReturn
 */
export type TxnTagCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TxnTag
     */
    select?: Prisma.TxnTagSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the TxnTag
     */
    omit?: Prisma.TxnTagOmit<ExtArgs> | null;
    /**
     * The data used to create many TxnTags.
     */
    data: Prisma.TxnTagCreateManyInput | Prisma.TxnTagCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TxnTagIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * TxnTag update
 */
export type TxnTagUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a TxnTag.
     */
    data: Prisma.XOR<Prisma.TxnTagUpdateInput, Prisma.TxnTagUncheckedUpdateInput>;
    /**
     * Choose, which TxnTag to update.
     */
    where: Prisma.TxnTagWhereUniqueInput;
};
/**
 * TxnTag updateMany
 */
export type TxnTagUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update TxnTags.
     */
    data: Prisma.XOR<Prisma.TxnTagUpdateManyMutationInput, Prisma.TxnTagUncheckedUpdateManyInput>;
    /**
     * Filter which TxnTags to update
     */
    where?: Prisma.TxnTagWhereInput;
    /**
     * Limit how many TxnTags to update.
     */
    limit?: number;
};
/**
 * TxnTag updateManyAndReturn
 */
export type TxnTagUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TxnTag
     */
    select?: Prisma.TxnTagSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the TxnTag
     */
    omit?: Prisma.TxnTagOmit<ExtArgs> | null;
    /**
     * The data used to update TxnTags.
     */
    data: Prisma.XOR<Prisma.TxnTagUpdateManyMutationInput, Prisma.TxnTagUncheckedUpdateManyInput>;
    /**
     * Filter which TxnTags to update
     */
    where?: Prisma.TxnTagWhereInput;
    /**
     * Limit how many TxnTags to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TxnTagIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * TxnTag upsert
 */
export type TxnTagUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the TxnTag to update in case it exists.
     */
    where: Prisma.TxnTagWhereUniqueInput;
    /**
     * In case the TxnTag found by the `where` argument doesn't exist, create a new TxnTag with this data.
     */
    create: Prisma.XOR<Prisma.TxnTagCreateInput, Prisma.TxnTagUncheckedCreateInput>;
    /**
     * In case the TxnTag was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.TxnTagUpdateInput, Prisma.TxnTagUncheckedUpdateInput>;
};
/**
 * TxnTag delete
 */
export type TxnTagDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which TxnTag to delete.
     */
    where: Prisma.TxnTagWhereUniqueInput;
};
/**
 * TxnTag deleteMany
 */
export type TxnTagDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which TxnTags to delete
     */
    where?: Prisma.TxnTagWhereInput;
    /**
     * Limit how many TxnTags to delete.
     */
    limit?: number;
};
/**
 * TxnTag without action
 */
export type TxnTagDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=TxnTag.d.ts.map