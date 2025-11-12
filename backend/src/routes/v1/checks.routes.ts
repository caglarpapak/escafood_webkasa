import { Router } from "express";
import { z } from "zod";
import { CheckController } from "../../controllers/check.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import { uploaders } from "../../middlewares/upload.js";
import { uploadRateLimiter } from "../../middlewares/rate-limit.js";
import { validate } from "../../middlewares/validate.js";

const checkInSchema = z.object({
  serialNo: z.string().min(3),
  bank: z.string().min(2),
  amount: z.coerce.number().positive(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Vade tarihi YYYY-MM-DD formatında olmalıdır"),
  customerId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

const checkOutSchema = z.object({
  checkId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
  mode: z.enum(["musteri_cek_devir", "yeni_duzenlenen"]).optional(),
  amount: z.coerce.number().positive().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Vade tarihi YYYY-MM-DD olmalıdır")
    .optional(),
  serialNo: z.string().optional(),
  bank: z.string().optional(),
  issuerName: z.string().optional(),
});

const issueSchema = z.object({
  serialNo: z.string().min(3),
  bank: z.string().min(2),
  amount: z.coerce.number().positive(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Vade tarihi YYYY-MM-DD olmalıdır"),
  notes: z.string().max(500).optional(),
});

const paymentSchema = z.object({
  checkId: z.string().uuid(),
  bankAccountId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  txnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih formatı YYYY-MM-DD olmalıdır"),
  notes: z.string().max(500).optional(),
});

export const checksRouter = Router();

checksRouter.use(authenticate());

checksRouter.post(
  "/in",
  uploadRateLimiter,
  uploaders.checks.array("attachments", 5),
  validate(checkInSchema),
  CheckController.registerIn,
);

checksRouter.post(
  "/out",
  uploadRateLimiter,
  uploaders.checks.array("attachments", 5),
  validate(checkOutSchema),
  CheckController.registerOut,
);

checksRouter.post(
  "/issue",
  uploadRateLimiter,
  uploaders.checks.array("attachments", 5),
  validate(issueSchema),
  CheckController.issueCompanyCheck,
);

checksRouter.post(
  "/payment",
  validate(paymentSchema),
  CheckController.payCheck,
);

checksRouter.get("/report", CheckController.list);
