import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
type ValidationTarget = "body" | "query" | "params";
export declare const validate: (schema: ZodTypeAny, target?: ValidationTarget) => (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.d.ts.map