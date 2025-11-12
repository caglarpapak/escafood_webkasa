import { Router } from "express";
import { z } from "zod";
import { TransactionCategory } from "@prisma/client";
import { TransactionController } from "../../controllers/transaction.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { uploaders } from "../../middlewares/upload.js";
import { uploadRateLimiter } from "../../middlewares/rate-limit.js";

const baseTransactionSchema = {
  amount: z.coerce.number().positive(),
  txnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih formatı YYYY-MM-DD olmalıdır")
    .optional(),
  description: z.string().max(255).optional(),
  note: z.string().max(500).optional(),
  contactId: z.string().uuid().optional().nullable(),
  tagNames: z.array(z.string().max(50)).optional(),
};

const cashInSchema = z.object({
  ...baseTransactionSchema,
});

const cashOutSchema = z.object({
  ...baseTransactionSchema,
  category: z.nativeEnum(TransactionCategory),
});

const bankInSchema = z.object({
  ...baseTransactionSchema,
  bankAccountId: z.string().uuid(),
});

const bankOutSchema = z
  .object({
    ...baseTransactionSchema,
    bankAccountId: z.string().uuid(),
    category: z.nativeEnum(TransactionCategory),
  })
  .refine(
    (data) => data.category !== TransactionCategory.KK_ODEME || !!data.contactId,
    "KK ödemesi için tedarikçi seçiniz",
  );

const posSchema = z
  .object({
    ...baseTransactionSchema,
    bankAccountId: z.string().uuid(),
    mode: z.enum(["net_komisyon", "brut_komisyon"]),
    net: z.coerce.number().positive().optional(),
    brut: z.coerce.number().positive().optional(),
    komisyon: z.coerce.number().min(0),
    provider: z.enum(["ykb", "enpara", "other"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "net_komisyon" && data.net === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["net"],
        message: "Net tutar zorunludur",
      });
    }
    if (data.mode === "brut_komisyon" && data.brut === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["brut"],
        message: "Brüt tutar zorunludur",
      });
    }
  });

const cardExpenseSchema = z.object({
  ...baseTransactionSchema,
  cardId: z.string().uuid(),
  category: z.nativeEnum(TransactionCategory),
  plate: z.string().max(16).optional(),
});

const cardPaymentSchema = z.object({
  ...baseTransactionSchema,
  cardId: z.string().uuid(),
  bankAccountId: z.string().uuid().optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const transactionsRouter = Router();

transactionsRouter.use(authenticate());

transactionsRouter.post("/cash-in", validate(cashInSchema), TransactionController.cashIn);
transactionsRouter.post("/cash-out", validate(cashOutSchema), TransactionController.cashOut);
transactionsRouter.post("/bank-in", validate(bankInSchema), TransactionController.bankIn);
transactionsRouter.post("/bank-out", validate(bankOutSchema), TransactionController.bankOut);
transactionsRouter.post("/pos", validate(posSchema), TransactionController.pos);
transactionsRouter.post(
  "/card-expense",
  uploadRateLimiter,
  uploaders.slips.array("attachments", 5),
  validate(cardExpenseSchema),
  TransactionController.cardExpense,
);
transactionsRouter.post(
  "/card-payment",
  validate(cardPaymentSchema),
  TransactionController.cardPayment,
);
transactionsRouter.delete(
  "/:id",
  validate(idParamSchema, "params"),
  TransactionController.delete,
);
