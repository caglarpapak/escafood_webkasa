import { Router } from "express";
import { z } from "zod";
import { DashboardController } from "../../controllers/dashboard.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
const querySchema = z.object({
    date: z
        .string()
        .datetime()
        .optional(),
});
export const dashboardRouter = Router();
dashboardRouter.get("/", authenticate(), validate(querySchema, "query"), DashboardController.getOverview);
//# sourceMappingURL=dashboard.routes.js.map