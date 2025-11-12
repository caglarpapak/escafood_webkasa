import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { transactionsRouter } from "./transactions.routes.js";
import { checksRouter } from "./checks.routes.js";
import { reportsRouter } from "./reports.routes.js";
import { contactsRouter } from "./contacts.routes.js";
export const v1Router = Router();
v1Router.use("/auth", authRouter);
v1Router.use("/dashboard", dashboardRouter);
v1Router.use("/transactions", transactionsRouter);
v1Router.use("/checks", checksRouter);
v1Router.use("/reports", reportsRouter);
v1Router.use("/contacts", contactsRouter);
//# sourceMappingURL=index.js.map