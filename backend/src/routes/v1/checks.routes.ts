import { Router } from "express";
import { z } from "zod";
import { CheckController } from "../../controllers/check.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import { upload } from "../../middlewares/upload.js";
import { validate } from "../../middlewares/validate.js";

const checkInSchema = z.object({
  serialNo: z.string().min(3),
  bank: z.string().min(2),
  amount: z.coerce.number().positive(),
  dueDate: z.string().date(),
  customerId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

const checkOutSchema = z.object({
  checkId: z.string().uuid(),
  supplierId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

const issueSchema = z.object({
  serialNo: z.string().min(3),
  bank: z.string().min(2),
  amount: z.coerce.number().positive(),
  dueDate: z.string().date(),
  notes: z.string().max(500).optional(),
});

const paymentSchema = z.object({
  checkId: z.string().uuid(),
  bankAccountId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  txnDate: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const checksRouter = Router();

checksRouter.use(authenticate());

checksRouter.post(
  "/in",
  upload.single("attachment"),
  validate(checkInSchema),
  CheckController.registerIn,
);

checksRouter.post(
  "/out",
  validate(checkOutSchema),
  CheckController.registerOut,
);

checksRouter.post(
  "/issue",
  upload.single("attachment"),
  validate(issueSchema),
  CheckController.issueCompanyCheck,
);

checksRouter.post(
  "/payment",
  validate(paymentSchema),
  CheckController.payCheck,
);

checksRouter.get("/report", CheckController.list);
