import { Router } from "express";
import { z } from "zod";
import { AuthController } from "../../controllers/auth.controller.js";
import { validate } from "../../middlewares/validate.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const authRouter = Router();

authRouter.post("/login", validate(loginSchema), AuthController.login);
