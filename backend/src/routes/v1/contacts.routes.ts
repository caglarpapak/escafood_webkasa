import { Router } from "express";
import { z } from "zod";
import { ContactController } from "../../controllers/contact.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import { uploaders } from "../../middlewares/upload.js";
import { uploadRateLimiter } from "../../middlewares/rate-limit.js";
import { validate } from "../../middlewares/validate.js";

const importSchema = z.object({
  // no body fields required, the presence of file is validated in service
});

export const contactsRouter = Router();

contactsRouter.use(authenticate());

contactsRouter.post(
  "/import",
  uploadRateLimiter,
  uploaders.imports.single("file"),
  validate(importSchema),
  ContactController.import,
);
