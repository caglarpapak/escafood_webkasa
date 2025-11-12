import { Router } from "express";
import { z } from "zod";
import { ReportController } from "../../controllers/report.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
const querySchema = z.object({
    startDate: z
        .string()
        .datetime()
        .optional(),
    endDate: z
        .string()
        .datetime()
        .optional(),
});
export const reportsRouter = Router();
reportsRouter.get("/daily", authenticate(), validate(querySchema, "query"), ReportController.daily);
//# sourceMappingURL=reports.routes.js.map