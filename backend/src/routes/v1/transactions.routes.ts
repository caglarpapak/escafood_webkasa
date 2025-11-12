import { Router } from "express";
import { z } from "zod";
import {
  TransactionCategory,
} from "@prisma/client";
import { TransactionController } from "../../controllers/transaction.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

const baseTransactionSchema = {
  amount: z.coerce.number().positive(),
  txnDate: z.string().datetime().optional(),
  description: z.string().max(255).optional(),
  note: z.string().max(500).optional(),
  contactId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
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

const bankOutSchema = z.object({
  ...baseTransactionSchema,
  bankAccountId: z.string().uuid(),
  category: z.nativeEnum(TransactionCategory),
});

const posSchema = z.object({
  ...baseTransactionSchema,
  bankAccountId: z.string().uuid(),
  posBrut: z.coerce.number().positive(),
  posKomisyon: z.coerce.number().min(0),
});

const cardExpenseSchema = z.object({
  ...baseTransactionSchema,
  cardId: z.string().uuid(),
  category: z.nativeEnum(TransactionCategory),
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
