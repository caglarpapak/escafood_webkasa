import type * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model Check
 *
 */
export type CheckModel = runtime.Types.Result.DefaultSelection<Prisma.$CheckPayload>;
export type AggregateCheck = {
    _count: CheckCountAggregateOutputType | null;
    _avg: CheckAvgAggregateOutputType | null;
    _sum: CheckSumAggregateOutputType | null;
    _min: CheckMinAggregateOutputType | null;
    _max: CheckMaxAggregateOutputType | null;
};
export type CheckAvgAggregateOutputType = {
    amount: runtime.Decimal | null;
};
export type CheckSumAggregateOutputType = {
    amount: runtime.Decimal | null;
};
export type CheckMinAggregateOutputType = {
    id: string | null;
    serialNo: string | null;
    bank: string | null;
    amount: runtime.Decimal | null;
    dueDate: Date | null;
    status: $Enums.CheckStatus | null;
    contactId: string | null;
    attachmentId: string | null;
    notes: string | null;
    issuedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type CheckMaxAggregateOutputType = {
    id: string | null;
    serialNo: string | null;
    bank: string | null;
    amount: runtime.Decimal | null;
    dueDate: Date | null;
    status: $Enums.CheckStatus | null;
    contactId: string | null;
    attachmentId: string | null;
    notes: string | null;
    issuedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type CheckCountAggregateOutputType = {
    id: number;
    serialNo: number;
    bank: number;
    amount: number;
    dueDate: number;
    status: number;
    contactId: number;
    attachmentId: number;
    notes: number;
    issuedBy: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type CheckAvgAggregateInputType = {
    amount?: true;
};
export type CheckSumAggregateInputType = {
    amount?: true;
};
export type CheckMinAggregateInputType = {
    id?: true;
    serialNo?: true;
    bank?: true;
    amount?: true;
    dueDate?: true;
    status?: true;
    contactId?: true;
    attachmentId?: true;
    notes?: true;
    issuedBy?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type CheckMaxAggregateInputType = {
    id?: true;
    serialNo?: true;
    bank?: true;
    amount?: true;
    dueDate?: true;
    status?: true;
    contactId?: true;
    attachmentId?: true;
    notes?: true;
    issuedBy?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type CheckCountAggregateInputType = {
    id?: true;
    serialNo?: true;
    bank?: true;
    amount?: true;
    dueDate?: true;
    status?: true;
    contactId?: true;
    attachmentId?: true;
    notes?: true;
    issuedBy?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type CheckAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Check to aggregate.
     */
    where?: Prisma.CheckWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Checks to fetch.
     */
    orderBy?: Prisma.CheckOrderByWithRelationInput | Prisma.CheckOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.CheckWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Checks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Checks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Checks
    **/
    _count?: true | CheckCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: CheckAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: CheckSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: CheckMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: CheckMaxAggregateInputType;
};
export type GetCheckAggregateType<T extends CheckAggregateArgs> = {
    [P in keyof T & keyof AggregateCheck]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCheck[P]> : Prisma.GetScalarType<T[P], AggregateCheck[P]>;
};
export type CheckGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckWhereInput;
    orderBy?: Prisma.CheckOrderByWithAggregationInput | Prisma.CheckOrderByWithAggregationInput[];
    by: Prisma.CheckScalarFieldEnum[] | Prisma.CheckScalarFieldEnum;
    having?: Prisma.CheckScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CheckCountAggregateInputType | true;
    _avg?: CheckAvgAggregateInputType;
    _sum?: CheckSumAggregateInputType;
    _min?: CheckMinAggregateInputType;
    _max?: CheckMaxAggregateInputType;
};
export type CheckGroupByOutputType = {
    id: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal;
    dueDate: Date;
    status: $Enums.CheckStatus;
    contactId: string | null;
    attachmentId: string | null;
    notes: string | null;
    issuedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: CheckCountAggregateOutputType | null;
    _avg: CheckAvgAggregateOutputType | null;
    _sum: CheckSumAggregateOutputType | null;
    _min: CheckMinAggregateOutputType | null;
    _max: CheckMaxAggregateOutputType | null;
};
type GetCheckGroupByPayload<T extends CheckGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CheckGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CheckGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CheckGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CheckGroupByOutputType[P]>;
}>>;
export type CheckWhereInput = {
    AND?: Prisma.CheckWhereInput | Prisma.CheckWhereInput[];
    OR?: Prisma.CheckWhereInput[];
    NOT?: Prisma.CheckWhereInput | Prisma.CheckWhereInput[];
    id?: Prisma.StringFilter<"Check"> | string;
    serialNo?: Prisma.StringFilter<"Check"> | string;
    bank?: Prisma.StringFilter<"Check"> | string;
    amount?: Prisma.DecimalFilter<"Check"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFilter<"Check"> | Date | string;
    status?: Prisma.EnumCheckStatusFilter<"Check"> | $Enums.CheckStatus;
    contactId?: Prisma.StringNullableFilter<"Check"> | string | null;
    attachmentId?: Prisma.StringNullableFilter<"Check"> | string | null;
    notes?: Prisma.StringNullableFilter<"Check"> | string | null;
    issuedBy?: Prisma.StringNullableFilter<"Check"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Check"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Check"> | Date | string;
    contact?: Prisma.XOR<Prisma.ContactNullableScalarRelationFilter, Prisma.ContactWhereInput> | null;
    attachment?: Prisma.XOR<Prisma.AttachmentNullableScalarRelationFilter, Prisma.AttachmentWhereInput> | null;
    transactions?: Prisma.TransactionListRelationFilter;
    moves?: Prisma.CheckMoveListRelationFilter;
};
export type CheckOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    serialNo?: Prisma.SortOrder;
    bank?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    contactId?: Prisma.SortOrderInput | Prisma.SortOrder;
    attachmentId?: Prisma.SortOrderInput | Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    issuedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    contact?: Prisma.ContactOrderByWithRelationInput;
    attachment?: Prisma.AttachmentOrderByWithRelationInput;
    transactions?: Prisma.TransactionOrderByRelationAggregateInput;
    moves?: Prisma.CheckMoveOrderByRelationAggregateInput;
};
export type CheckWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    serialNo?: string;
    attachmentId?: string;
    AND?: Prisma.CheckWhereInput | Prisma.CheckWhereInput[];
    OR?: Prisma.CheckWhereInput[];
    NOT?: Prisma.CheckWhereInput | Prisma.CheckWhereInput[];
    bank?: Prisma.StringFilter<"Check"> | string;
    amount?: Prisma.DecimalFilter<"Check"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFilter<"Check"> | Date | string;
    status?: Prisma.EnumCheckStatusFilter<"Check"> | $Enums.CheckStatus;
    contactId?: Prisma.StringNullableFilter<"Check"> | string | null;
    notes?: Prisma.StringNullableFilter<"Check"> | string | null;
    issuedBy?: Prisma.StringNullableFilter<"Check"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Check"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Check"> | Date | string;
    contact?: Prisma.XOR<Prisma.ContactNullableScalarRelationFilter, Prisma.ContactWhereInput> | null;
    attachment?: Prisma.XOR<Prisma.AttachmentNullableScalarRelationFilter, Prisma.AttachmentWhereInput> | null;
    transactions?: Prisma.TransactionListRelationFilter;
    moves?: Prisma.CheckMoveListRelationFilter;
}, "id" | "attachmentId" | "serialNo">;
export type CheckOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    serialNo?: Prisma.SortOrder;
    bank?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    contactId?: Prisma.SortOrderInput | Prisma.SortOrder;
    attachmentId?: Prisma.SortOrderInput | Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    issuedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.CheckCountOrderByAggregateInput;
    _avg?: Prisma.CheckAvgOrderByAggregateInput;
    _max?: Prisma.CheckMaxOrderByAggregateInput;
    _min?: Prisma.CheckMinOrderByAggregateInput;
    _sum?: Prisma.CheckSumOrderByAggregateInput;
};
export type CheckScalarWhereWithAggregatesInput = {
    AND?: Prisma.CheckScalarWhereWithAggregatesInput | Prisma.CheckScalarWhereWithAggregatesInput[];
    OR?: Prisma.CheckScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CheckScalarWhereWithAggregatesInput | Prisma.CheckScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    serialNo?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    bank?: Prisma.StringWithAggregatesFilter<"Check"> | string;
    amount?: Prisma.DecimalWithAggregatesFilter<"Check"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeWithAggregatesFilter<"Check"> | Date | string;
    status?: Prisma.EnumCheckStatusWithAggregatesFilter<"Check"> | $Enums.CheckStatus;
    contactId?: Prisma.StringNullableWithAggregatesFilter<"Check"> | string | null;
    attachmentId?: Prisma.StringNullableWithAggregatesFilter<"Check"> | string | null;
    notes?: Prisma.StringNullableWithAggregatesFilter<"Check"> | string | null;
    issuedBy?: Prisma.StringNullableWithAggregatesFilter<"Check"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Check"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Check"> | Date | string;
};
export type CheckCreateInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    contact?: Prisma.ContactCreateNestedOneWithoutChecksInput;
    attachment?: Prisma.AttachmentCreateNestedOneWithoutCheckInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutCheckInput;
    moves?: Prisma.CheckMoveCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    contactId?: string | null;
    attachmentId?: string | null;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutCheckInput;
    moves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    contact?: Prisma.ContactUpdateOneWithoutChecksNestedInput;
    attachment?: Prisma.AttachmentUpdateOneWithoutCheckNestedInput;
    transactions?: Prisma.TransactionUpdateManyWithoutCheckNestedInput;
    moves?: Prisma.CheckMoveUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    attachmentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutCheckNestedInput;
    moves?: Prisma.CheckMoveUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckCreateManyInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    contactId?: string | null;
    attachmentId?: string | null;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CheckUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    attachmentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CheckListRelationFilter = {
    every?: Prisma.CheckWhereInput;
    some?: Prisma.CheckWhereInput;
    none?: Prisma.CheckWhereInput;
};
export type CheckOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CheckNullableScalarRelationFilter = {
    is?: Prisma.CheckWhereInput | null;
    isNot?: Prisma.CheckWhereInput | null;
};
export type CheckCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    serialNo?: Prisma.SortOrder;
    bank?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    contactId?: Prisma.SortOrder;
    attachmentId?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    issuedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CheckAvgOrderByAggregateInput = {
    amount?: Prisma.SortOrder;
};
export type CheckMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    serialNo?: Prisma.SortOrder;
    bank?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    contactId?: Prisma.SortOrder;
    attachmentId?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    issuedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CheckMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    serialNo?: Prisma.SortOrder;
    bank?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    contactId?: Prisma.SortOrder;
    attachmentId?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    issuedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CheckSumOrderByAggregateInput = {
    amount?: Prisma.SortOrder;
};
export type CheckScalarRelationFilter = {
    is?: Prisma.CheckWhereInput;
    isNot?: Prisma.CheckWhereInput;
};
export type CheckCreateNestedManyWithoutContactInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutContactInput, Prisma.CheckUncheckedCreateWithoutContactInput> | Prisma.CheckCreateWithoutContactInput[] | Prisma.CheckUncheckedCreateWithoutContactInput[];
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutContactInput | Prisma.CheckCreateOrConnectWithoutContactInput[];
    createMany?: Prisma.CheckCreateManyContactInputEnvelope;
    connect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
};
export type CheckUncheckedCreateNestedManyWithoutContactInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutContactInput, Prisma.CheckUncheckedCreateWithoutContactInput> | Prisma.CheckCreateWithoutContactInput[] | Prisma.CheckUncheckedCreateWithoutContactInput[];
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutContactInput | Prisma.CheckCreateOrConnectWithoutContactInput[];
    createMany?: Prisma.CheckCreateManyContactInputEnvelope;
    connect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
};
export type CheckUpdateManyWithoutContactNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutContactInput, Prisma.CheckUncheckedCreateWithoutContactInput> | Prisma.CheckCreateWithoutContactInput[] | Prisma.CheckUncheckedCreateWithoutContactInput[];
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutContactInput | Prisma.CheckCreateOrConnectWithoutContactInput[];
    upsert?: Prisma.CheckUpsertWithWhereUniqueWithoutContactInput | Prisma.CheckUpsertWithWhereUniqueWithoutContactInput[];
    createMany?: Prisma.CheckCreateManyContactInputEnvelope;
    set?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    disconnect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    delete?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    connect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    update?: Prisma.CheckUpdateWithWhereUniqueWithoutContactInput | Prisma.CheckUpdateWithWhereUniqueWithoutContactInput[];
    updateMany?: Prisma.CheckUpdateManyWithWhereWithoutContactInput | Prisma.CheckUpdateManyWithWhereWithoutContactInput[];
    deleteMany?: Prisma.CheckScalarWhereInput | Prisma.CheckScalarWhereInput[];
};
export type CheckUncheckedUpdateManyWithoutContactNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutContactInput, Prisma.CheckUncheckedCreateWithoutContactInput> | Prisma.CheckCreateWithoutContactInput[] | Prisma.CheckUncheckedCreateWithoutContactInput[];
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutContactInput | Prisma.CheckCreateOrConnectWithoutContactInput[];
    upsert?: Prisma.CheckUpsertWithWhereUniqueWithoutContactInput | Prisma.CheckUpsertWithWhereUniqueWithoutContactInput[];
    createMany?: Prisma.CheckCreateManyContactInputEnvelope;
    set?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    disconnect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    delete?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    connect?: Prisma.CheckWhereUniqueInput | Prisma.CheckWhereUniqueInput[];
    update?: Prisma.CheckUpdateWithWhereUniqueWithoutContactInput | Prisma.CheckUpdateWithWhereUniqueWithoutContactInput[];
    updateMany?: Prisma.CheckUpdateManyWithWhereWithoutContactInput | Prisma.CheckUpdateManyWithWhereWithoutContactInput[];
    deleteMany?: Prisma.CheckScalarWhereInput | Prisma.CheckScalarWhereInput[];
};
export type CheckCreateNestedOneWithoutAttachmentInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutAttachmentInput, Prisma.CheckUncheckedCreateWithoutAttachmentInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutAttachmentInput;
    connect?: Prisma.CheckWhereUniqueInput;
};
export type CheckUncheckedCreateNestedOneWithoutAttachmentInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutAttachmentInput, Prisma.CheckUncheckedCreateWithoutAttachmentInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutAttachmentInput;
    connect?: Prisma.CheckWhereUniqueInput;
};
export type CheckUpdateOneWithoutAttachmentNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutAttachmentInput, Prisma.CheckUncheckedCreateWithoutAttachmentInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutAttachmentInput;
    upsert?: Prisma.CheckUpsertWithoutAttachmentInput;
    disconnect?: Prisma.CheckWhereInput | boolean;
    delete?: Prisma.CheckWhereInput | boolean;
    connect?: Prisma.CheckWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CheckUpdateToOneWithWhereWithoutAttachmentInput, Prisma.CheckUpdateWithoutAttachmentInput>, Prisma.CheckUncheckedUpdateWithoutAttachmentInput>;
};
export type CheckUncheckedUpdateOneWithoutAttachmentNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutAttachmentInput, Prisma.CheckUncheckedCreateWithoutAttachmentInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutAttachmentInput;
    upsert?: Prisma.CheckUpsertWithoutAttachmentInput;
    disconnect?: Prisma.CheckWhereInput | boolean;
    delete?: Prisma.CheckWhereInput | boolean;
    connect?: Prisma.CheckWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CheckUpdateToOneWithWhereWithoutAttachmentInput, Prisma.CheckUpdateWithoutAttachmentInput>, Prisma.CheckUncheckedUpdateWithoutAttachmentInput>;
};
export type CheckCreateNestedOneWithoutTransactionsInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutTransactionsInput, Prisma.CheckUncheckedCreateWithoutTransactionsInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutTransactionsInput;
    connect?: Prisma.CheckWhereUniqueInput;
};
export type CheckUpdateOneWithoutTransactionsNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutTransactionsInput, Prisma.CheckUncheckedCreateWithoutTransactionsInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutTransactionsInput;
    upsert?: Prisma.CheckUpsertWithoutTransactionsInput;
    disconnect?: Prisma.CheckWhereInput | boolean;
    delete?: Prisma.CheckWhereInput | boolean;
    connect?: Prisma.CheckWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CheckUpdateToOneWithWhereWithoutTransactionsInput, Prisma.CheckUpdateWithoutTransactionsInput>, Prisma.CheckUncheckedUpdateWithoutTransactionsInput>;
};
export type EnumCheckStatusFieldUpdateOperationsInput = {
    set?: $Enums.CheckStatus;
};
export type CheckCreateNestedOneWithoutMovesInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutMovesInput, Prisma.CheckUncheckedCreateWithoutMovesInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutMovesInput;
    connect?: Prisma.CheckWhereUniqueInput;
};
export type CheckUpdateOneRequiredWithoutMovesNestedInput = {
    create?: Prisma.XOR<Prisma.CheckCreateWithoutMovesInput, Prisma.CheckUncheckedCreateWithoutMovesInput>;
    connectOrCreate?: Prisma.CheckCreateOrConnectWithoutMovesInput;
    upsert?: Prisma.CheckUpsertWithoutMovesInput;
    connect?: Prisma.CheckWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CheckUpdateToOneWithWhereWithoutMovesInput, Prisma.CheckUpdateWithoutMovesInput>, Prisma.CheckUncheckedUpdateWithoutMovesInput>;
};
export type CheckCreateWithoutContactInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    attachment?: Prisma.AttachmentCreateNestedOneWithoutCheckInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutCheckInput;
    moves?: Prisma.CheckMoveCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateWithoutContactInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    attachmentId?: string | null;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutCheckInput;
    moves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckCreateOrConnectWithoutContactInput = {
    where: Prisma.CheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckCreateWithoutContactInput, Prisma.CheckUncheckedCreateWithoutContactInput>;
};
export type CheckCreateManyContactInputEnvelope = {
    data: Prisma.CheckCreateManyContactInput | Prisma.CheckCreateManyContactInput[];
    skipDuplicates?: boolean;
};
export type CheckUpsertWithWhereUniqueWithoutContactInput = {
    where: Prisma.CheckWhereUniqueInput;
    update: Prisma.XOR<Prisma.CheckUpdateWithoutContactInput, Prisma.CheckUncheckedUpdateWithoutContactInput>;
    create: Prisma.XOR<Prisma.CheckCreateWithoutContactInput, Prisma.CheckUncheckedCreateWithoutContactInput>;
};
export type CheckUpdateWithWhereUniqueWithoutContactInput = {
    where: Prisma.CheckWhereUniqueInput;
    data: Prisma.XOR<Prisma.CheckUpdateWithoutContactInput, Prisma.CheckUncheckedUpdateWithoutContactInput>;
};
export type CheckUpdateManyWithWhereWithoutContactInput = {
    where: Prisma.CheckScalarWhereInput;
    data: Prisma.XOR<Prisma.CheckUpdateManyMutationInput, Prisma.CheckUncheckedUpdateManyWithoutContactInput>;
};
export type CheckScalarWhereInput = {
    AND?: Prisma.CheckScalarWhereInput | Prisma.CheckScalarWhereInput[];
    OR?: Prisma.CheckScalarWhereInput[];
    NOT?: Prisma.CheckScalarWhereInput | Prisma.CheckScalarWhereInput[];
    id?: Prisma.StringFilter<"Check"> | string;
    serialNo?: Prisma.StringFilter<"Check"> | string;
    bank?: Prisma.StringFilter<"Check"> | string;
    amount?: Prisma.DecimalFilter<"Check"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFilter<"Check"> | Date | string;
    status?: Prisma.EnumCheckStatusFilter<"Check"> | $Enums.CheckStatus;
    contactId?: Prisma.StringNullableFilter<"Check"> | string | null;
    attachmentId?: Prisma.StringNullableFilter<"Check"> | string | null;
    notes?: Prisma.StringNullableFilter<"Check"> | string | null;
    issuedBy?: Prisma.StringNullableFilter<"Check"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Check"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Check"> | Date | string;
};
export type CheckCreateWithoutAttachmentInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    contact?: Prisma.ContactCreateNestedOneWithoutChecksInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutCheckInput;
    moves?: Prisma.CheckMoveCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateWithoutAttachmentInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    contactId?: string | null;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutCheckInput;
    moves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckCreateOrConnectWithoutAttachmentInput = {
    where: Prisma.CheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckCreateWithoutAttachmentInput, Prisma.CheckUncheckedCreateWithoutAttachmentInput>;
};
export type CheckUpsertWithoutAttachmentInput = {
    update: Prisma.XOR<Prisma.CheckUpdateWithoutAttachmentInput, Prisma.CheckUncheckedUpdateWithoutAttachmentInput>;
    create: Prisma.XOR<Prisma.CheckCreateWithoutAttachmentInput, Prisma.CheckUncheckedCreateWithoutAttachmentInput>;
    where?: Prisma.CheckWhereInput;
};
export type CheckUpdateToOneWithWhereWithoutAttachmentInput = {
    where?: Prisma.CheckWhereInput;
    data: Prisma.XOR<Prisma.CheckUpdateWithoutAttachmentInput, Prisma.CheckUncheckedUpdateWithoutAttachmentInput>;
};
export type CheckUpdateWithoutAttachmentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    contact?: Prisma.ContactUpdateOneWithoutChecksNestedInput;
    transactions?: Prisma.TransactionUpdateManyWithoutCheckNestedInput;
    moves?: Prisma.CheckMoveUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateWithoutAttachmentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutCheckNestedInput;
    moves?: Prisma.CheckMoveUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckCreateWithoutTransactionsInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    contact?: Prisma.ContactCreateNestedOneWithoutChecksInput;
    attachment?: Prisma.AttachmentCreateNestedOneWithoutCheckInput;
    moves?: Prisma.CheckMoveCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateWithoutTransactionsInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    contactId?: string | null;
    attachmentId?: string | null;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    moves?: Prisma.CheckMoveUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckCreateOrConnectWithoutTransactionsInput = {
    where: Prisma.CheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckCreateWithoutTransactionsInput, Prisma.CheckUncheckedCreateWithoutTransactionsInput>;
};
export type CheckUpsertWithoutTransactionsInput = {
    update: Prisma.XOR<Prisma.CheckUpdateWithoutTransactionsInput, Prisma.CheckUncheckedUpdateWithoutTransactionsInput>;
    create: Prisma.XOR<Prisma.CheckCreateWithoutTransactionsInput, Prisma.CheckUncheckedCreateWithoutTransactionsInput>;
    where?: Prisma.CheckWhereInput;
};
export type CheckUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: Prisma.CheckWhereInput;
    data: Prisma.XOR<Prisma.CheckUpdateWithoutTransactionsInput, Prisma.CheckUncheckedUpdateWithoutTransactionsInput>;
};
export type CheckUpdateWithoutTransactionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    contact?: Prisma.ContactUpdateOneWithoutChecksNestedInput;
    attachment?: Prisma.AttachmentUpdateOneWithoutCheckNestedInput;
    moves?: Prisma.CheckMoveUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateWithoutTransactionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    attachmentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    moves?: Prisma.CheckMoveUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckCreateWithoutMovesInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    contact?: Prisma.ContactCreateNestedOneWithoutChecksInput;
    attachment?: Prisma.AttachmentCreateNestedOneWithoutCheckInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutCheckInput;
};
export type CheckUncheckedCreateWithoutMovesInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    contactId?: string | null;
    attachmentId?: string | null;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutCheckInput;
};
export type CheckCreateOrConnectWithoutMovesInput = {
    where: Prisma.CheckWhereUniqueInput;
    create: Prisma.XOR<Prisma.CheckCreateWithoutMovesInput, Prisma.CheckUncheckedCreateWithoutMovesInput>;
};
export type CheckUpsertWithoutMovesInput = {
    update: Prisma.XOR<Prisma.CheckUpdateWithoutMovesInput, Prisma.CheckUncheckedUpdateWithoutMovesInput>;
    create: Prisma.XOR<Prisma.CheckCreateWithoutMovesInput, Prisma.CheckUncheckedCreateWithoutMovesInput>;
    where?: Prisma.CheckWhereInput;
};
export type CheckUpdateToOneWithWhereWithoutMovesInput = {
    where?: Prisma.CheckWhereInput;
    data: Prisma.XOR<Prisma.CheckUpdateWithoutMovesInput, Prisma.CheckUncheckedUpdateWithoutMovesInput>;
};
export type CheckUpdateWithoutMovesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    contact?: Prisma.ContactUpdateOneWithoutChecksNestedInput;
    attachment?: Prisma.AttachmentUpdateOneWithoutCheckNestedInput;
    transactions?: Prisma.TransactionUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateWithoutMovesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    contactId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    attachmentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckCreateManyContactInput = {
    id?: string;
    serialNo: string;
    bank: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate: Date | string;
    status?: $Enums.CheckStatus;
    attachmentId?: string | null;
    notes?: string | null;
    issuedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CheckUpdateWithoutContactInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attachment?: Prisma.AttachmentUpdateOneWithoutCheckNestedInput;
    transactions?: Prisma.TransactionUpdateManyWithoutCheckNestedInput;
    moves?: Prisma.CheckMoveUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateWithoutContactInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    attachmentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutCheckNestedInput;
    moves?: Prisma.CheckMoveUncheckedUpdateManyWithoutCheckNestedInput;
};
export type CheckUncheckedUpdateManyWithoutContactInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serialNo?: Prisma.StringFieldUpdateOperationsInput | string;
    bank?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumCheckStatusFieldUpdateOperationsInput | $Enums.CheckStatus;
    attachmentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    issuedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type CheckCountOutputType
 */
export type CheckCountOutputType = {
    transactions: number;
    moves: number;
};
export type CheckCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    transactions?: boolean | CheckCountOutputTypeCountTransactionsArgs;
    moves?: boolean | CheckCountOutputTypeCountMovesArgs;
};
/**
 * CheckCountOutputType without action
 */
export type CheckCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CheckCountOutputType
     */
    select?: Prisma.CheckCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * CheckCountOutputType without action
 */
export type CheckCountOutputTypeCountTransactionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TransactionWhereInput;
};
/**
 * CheckCountOutputType without action
 */
export type CheckCountOutputTypeCountMovesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CheckMoveWhereInput;
};
export type CheckSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    serialNo?: boolean;
    bank?: boolean;
    amount?: boolean;
    dueDate?: boolean;
    status?: boolean;
    contactId?: boolean;
    attachmentId?: boolean;
    notes?: boolean;
    issuedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    contact?: boolean | Prisma.Check$contactArgs<ExtArgs>;
    attachment?: boolean | Prisma.Check$attachmentArgs<ExtArgs>;
    transactions?: boolean | Prisma.Check$transactionsArgs<ExtArgs>;
    moves?: boolean | Prisma.Check$movesArgs<ExtArgs>;
    _count?: boolean | Prisma.CheckCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["check"]>;
export type CheckSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    serialNo?: boolean;
    bank?: boolean;
    amount?: boolean;
    dueDate?: boolean;
    status?: boolean;
    contactId?: boolean;
    attachmentId?: boolean;
    notes?: boolean;
    issuedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    contact?: boolean | Prisma.Check$contactArgs<ExtArgs>;
    attachment?: boolean | Prisma.Check$attachmentArgs<ExtArgs>;
}, ExtArgs["result"]["check"]>;
export type CheckSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    serialNo?: boolean;
    bank?: boolean;
    amount?: boolean;
    dueDate?: boolean;
    status?: boolean;
    contactId?: boolean;
    attachmentId?: boolean;
    notes?: boolean;
    issuedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    contact?: boolean | Prisma.Check$contactArgs<ExtArgs>;
    attachment?: boolean | Prisma.Check$attachmentArgs<ExtArgs>;
}, ExtArgs["result"]["check"]>;
export type CheckSelectScalar = {
    id?: boolean;
    serialNo?: boolean;
    bank?: boolean;
    amount?: boolean;
    dueDate?: boolean;
    status?: boolean;
    contactId?: boolean;
    attachmentId?: boolean;
    notes?: boolean;
    issuedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type CheckOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "serialNo" | "bank" | "amount" | "dueDate" | "status" | "contactId" | "attachmentId" | "notes" | "issuedBy" | "createdAt" | "updatedAt", ExtArgs["result"]["check"]>;
export type CheckInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    contact?: boolean | Prisma.Check$contactArgs<ExtArgs>;
    attachment?: boolean | Prisma.Check$attachmentArgs<ExtArgs>;
    transactions?: boolean | Prisma.Check$transactionsArgs<ExtArgs>;
    moves?: boolean | Prisma.Check$movesArgs<ExtArgs>;
    _count?: boolean | Prisma.CheckCountOutputTypeDefaultArgs<ExtArgs>;
};
export type CheckIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    contact?: boolean | Prisma.Check$contactArgs<ExtArgs>;
    attachment?: boolean | Prisma.Check$attachmentArgs<ExtArgs>;
};
export type CheckIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    contact?: boolean | Prisma.Check$contactArgs<ExtArgs>;
    attachment?: boolean | Prisma.Check$attachmentArgs<ExtArgs>;
};
export type $CheckPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Check";
    objects: {
        contact: Prisma.$ContactPayload<ExtArgs> | null;
        attachment: Prisma.$AttachmentPayload<ExtArgs> | null;
        transactions: Prisma.$TransactionPayload<ExtArgs>[];
        moves: Prisma.$CheckMovePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        serialNo: string;
        bank: string;
        amount: runtime.Decimal;
        dueDate: Date;
        status: $Enums.CheckStatus;
        contactId: string | null;
        attachmentId: string | null;
        notes: string | null;
        issuedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["check"]>;
    composites: {};
};
export type CheckGetPayload<S extends boolean | null | undefined | CheckDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CheckPayload, S>;
export type CheckCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CheckFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CheckCountAggregateInputType | true;
};
export interface CheckDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Check'];
        meta: {
            name: 'Check';
        };
    };
    /**
     * Find zero or one Check that matches the filter.
     * @param {CheckFindUniqueArgs} args - Arguments to find a Check
     * @example
     * // Get one Check
     * const check = await prisma.check.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CheckFindUniqueArgs>(args: Prisma.SelectSubset<T, CheckFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Check that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CheckFindUniqueOrThrowArgs} args - Arguments to find a Check
     * @example
     * // Get one Check
     * const check = await prisma.check.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CheckFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CheckFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Check that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckFindFirstArgs} args - Arguments to find a Check
     * @example
     * // Get one Check
     * const check = await prisma.check.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CheckFindFirstArgs>(args?: Prisma.SelectSubset<T, CheckFindFirstArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Check that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckFindFirstOrThrowArgs} args - Arguments to find a Check
     * @example
     * // Get one Check
     * const check = await prisma.check.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CheckFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CheckFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Checks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Checks
     * const checks = await prisma.check.findMany()
     *
     * // Get first 10 Checks
     * const checks = await prisma.check.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const checkWithIdOnly = await prisma.check.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CheckFindManyArgs>(args?: Prisma.SelectSubset<T, CheckFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Check.
     * @param {CheckCreateArgs} args - Arguments to create a Check.
     * @example
     * // Create one Check
     * const Check = await prisma.check.create({
     *   data: {
     *     // ... data to create a Check
     *   }
     * })
     *
     */
    create<T extends CheckCreateArgs>(args: Prisma.SelectSubset<T, CheckCreateArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Checks.
     * @param {CheckCreateManyArgs} args - Arguments to create many Checks.
     * @example
     * // Create many Checks
     * const check = await prisma.check.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CheckCreateManyArgs>(args?: Prisma.SelectSubset<T, CheckCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Checks and returns the data saved in the database.
     * @param {CheckCreateManyAndReturnArgs} args - Arguments to create many Checks.
     * @example
     * // Create many Checks
     * const check = await prisma.check.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Checks and only return the `id`
     * const checkWithIdOnly = await prisma.check.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CheckCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CheckCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Check.
     * @param {CheckDeleteArgs} args - Arguments to delete one Check.
     * @example
     * // Delete one Check
     * const Check = await prisma.check.delete({
     *   where: {
     *     // ... filter to delete one Check
     *   }
     * })
     *
     */
    delete<T extends CheckDeleteArgs>(args: Prisma.SelectSubset<T, CheckDeleteArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Check.
     * @param {CheckUpdateArgs} args - Arguments to update one Check.
     * @example
     * // Update one Check
     * const check = await prisma.check.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CheckUpdateArgs>(args: Prisma.SelectSubset<T, CheckUpdateArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Checks.
     * @param {CheckDeleteManyArgs} args - Arguments to filter Checks to delete.
     * @example
     * // Delete a few Checks
     * const { count } = await prisma.check.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CheckDeleteManyArgs>(args?: Prisma.SelectSubset<T, CheckDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Checks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Checks
     * const check = await prisma.check.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CheckUpdateManyArgs>(args: Prisma.SelectSubset<T, CheckUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Checks and returns the data updated in the database.
     * @param {CheckUpdateManyAndReturnArgs} args - Arguments to update many Checks.
     * @example
     * // Update many Checks
     * const check = await prisma.check.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Checks and only return the `id`
     * const checkWithIdOnly = await prisma.check.updateManyAndReturn({
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
    updateManyAndReturn<T extends CheckUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CheckUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Check.
     * @param {CheckUpsertArgs} args - Arguments to update or create a Check.
     * @example
     * // Update or create a Check
     * const check = await prisma.check.upsert({
     *   create: {
     *     // ... data to create a Check
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Check we want to update
     *   }
     * })
     */
    upsert<T extends CheckUpsertArgs>(args: Prisma.SelectSubset<T, CheckUpsertArgs<ExtArgs>>): Prisma.Prisma__CheckClient<runtime.Types.Result.GetResult<Prisma.$CheckPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Checks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckCountArgs} args - Arguments to filter Checks to count.
     * @example
     * // Count the number of Checks
     * const count = await prisma.check.count({
     *   where: {
     *     // ... the filter for the Checks we want to count
     *   }
     * })
    **/
    count<T extends CheckCountArgs>(args?: Prisma.Subset<T, CheckCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CheckCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Check.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CheckAggregateArgs>(args: Prisma.Subset<T, CheckAggregateArgs>): Prisma.PrismaPromise<GetCheckAggregateType<T>>;
    /**
     * Group by Check.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CheckGroupByArgs} args - Group by arguments.
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
    groupBy<T extends CheckGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CheckGroupByArgs['orderBy'];
    } : {
        orderBy?: CheckGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CheckGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCheckGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Check model
     */
    readonly fields: CheckFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Check.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__CheckClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    contact<T extends Prisma.Check$contactArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Check$contactArgs<ExtArgs>>): Prisma.Prisma__ContactClient<runtime.Types.Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    attachment<T extends Prisma.Check$attachmentArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Check$attachmentArgs<ExtArgs>>): Prisma.Prisma__AttachmentClient<runtime.Types.Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    transactions<T extends Prisma.Check$transactionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Check$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    moves<T extends Prisma.Check$movesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Check$movesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CheckMovePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the Check model
 */
export interface CheckFieldRefs {
    readonly id: Prisma.FieldRef<"Check", 'String'>;
    readonly serialNo: Prisma.FieldRef<"Check", 'String'>;
    readonly bank: Prisma.FieldRef<"Check", 'String'>;
    readonly amount: Prisma.FieldRef<"Check", 'Decimal'>;
    readonly dueDate: Prisma.FieldRef<"Check", 'DateTime'>;
    readonly status: Prisma.FieldRef<"Check", 'CheckStatus'>;
    readonly contactId: Prisma.FieldRef<"Check", 'String'>;
    readonly attachmentId: Prisma.FieldRef<"Check", 'String'>;
    readonly notes: Prisma.FieldRef<"Check", 'String'>;
    readonly issuedBy: Prisma.FieldRef<"Check", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Check", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Check", 'DateTime'>;
}
/**
 * Check findUnique
 */
export type CheckFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Check to fetch.
     */
    where: Prisma.CheckWhereUniqueInput;
};
/**
 * Check findUniqueOrThrow
 */
export type CheckFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Check to fetch.
     */
    where: Prisma.CheckWhereUniqueInput;
};
/**
 * Check findFirst
 */
export type CheckFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Check to fetch.
     */
    where?: Prisma.CheckWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Checks to fetch.
     */
    orderBy?: Prisma.CheckOrderByWithRelationInput | Prisma.CheckOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Checks.
     */
    cursor?: Prisma.CheckWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Checks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Checks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Checks.
     */
    distinct?: Prisma.CheckScalarFieldEnum | Prisma.CheckScalarFieldEnum[];
};
/**
 * Check findFirstOrThrow
 */
export type CheckFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Check to fetch.
     */
    where?: Prisma.CheckWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Checks to fetch.
     */
    orderBy?: Prisma.CheckOrderByWithRelationInput | Prisma.CheckOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Checks.
     */
    cursor?: Prisma.CheckWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Checks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Checks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Checks.
     */
    distinct?: Prisma.CheckScalarFieldEnum | Prisma.CheckScalarFieldEnum[];
};
/**
 * Check findMany
 */
export type CheckFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which Checks to fetch.
     */
    where?: Prisma.CheckWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Checks to fetch.
     */
    orderBy?: Prisma.CheckOrderByWithRelationInput | Prisma.CheckOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Checks.
     */
    cursor?: Prisma.CheckWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Checks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Checks.
     */
    skip?: number;
    distinct?: Prisma.CheckScalarFieldEnum | Prisma.CheckScalarFieldEnum[];
};
/**
 * Check create
 */
export type CheckCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a Check.
     */
    data: Prisma.XOR<Prisma.CheckCreateInput, Prisma.CheckUncheckedCreateInput>;
};
/**
 * Check createMany
 */
export type CheckCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Checks.
     */
    data: Prisma.CheckCreateManyInput | Prisma.CheckCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Check createManyAndReturn
 */
export type CheckCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Check
     */
    select?: Prisma.CheckSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Check
     */
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    /**
     * The data used to create many Checks.
     */
    data: Prisma.CheckCreateManyInput | Prisma.CheckCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CheckIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Check update
 */
export type CheckUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a Check.
     */
    data: Prisma.XOR<Prisma.CheckUpdateInput, Prisma.CheckUncheckedUpdateInput>;
    /**
     * Choose, which Check to update.
     */
    where: Prisma.CheckWhereUniqueInput;
};
/**
 * Check updateMany
 */
export type CheckUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Checks.
     */
    data: Prisma.XOR<Prisma.CheckUpdateManyMutationInput, Prisma.CheckUncheckedUpdateManyInput>;
    /**
     * Filter which Checks to update
     */
    where?: Prisma.CheckWhereInput;
    /**
     * Limit how many Checks to update.
     */
    limit?: number;
};
/**
 * Check updateManyAndReturn
 */
export type CheckUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Check
     */
    select?: Prisma.CheckSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Check
     */
    omit?: Prisma.CheckOmit<ExtArgs> | null;
    /**
     * The data used to update Checks.
     */
    data: Prisma.XOR<Prisma.CheckUpdateManyMutationInput, Prisma.CheckUncheckedUpdateManyInput>;
    /**
     * Filter which Checks to update
     */
    where?: Prisma.CheckWhereInput;
    /**
     * Limit how many Checks to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CheckIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Check upsert
 */
export type CheckUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the Check to update in case it exists.
     */
    where: Prisma.CheckWhereUniqueInput;
    /**
     * In case the Check found by the `where` argument doesn't exist, create a new Check with this data.
     */
    create: Prisma.XOR<Prisma.CheckCreateInput, Prisma.CheckUncheckedCreateInput>;
    /**
     * In case the Check was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.CheckUpdateInput, Prisma.CheckUncheckedUpdateInput>;
};
/**
 * Check delete
 */
export type CheckDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which Check to delete.
     */
    where: Prisma.CheckWhereUniqueInput;
};
/**
 * Check deleteMany
 */
export type CheckDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Checks to delete
     */
    where?: Prisma.CheckWhereInput;
    /**
     * Limit how many Checks to delete.
     */
    limit?: number;
};
/**
 * Check.contact
 */
export type Check$contactArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * Check.attachment
 */
export type Check$attachmentArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: Prisma.AttachmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Attachment
     */
    omit?: Prisma.AttachmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AttachmentInclude<ExtArgs> | null;
    where?: Prisma.AttachmentWhereInput;
};
/**
 * Check.transactions
 */
export type Check$transactionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    orderBy?: Prisma.TransactionOrderByWithRelationInput | Prisma.TransactionOrderByWithRelationInput[];
    cursor?: Prisma.TransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TransactionScalarFieldEnum | Prisma.TransactionScalarFieldEnum[];
};
/**
 * Check.moves
 */
export type Check$movesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * Check without action
 */
export type CheckDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
export {};
//# sourceMappingURL=Check.d.ts.map