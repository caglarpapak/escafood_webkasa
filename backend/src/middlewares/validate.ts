import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny, ZodError, ZodIssue } from "zod";
import { HttpError } from "./error-handler.js";

type ValidationTarget = "body" | "query" | "params";

const serializeIssues = (issues: ZodIssue[]) =>
  issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));

export const validate =
  (schema: ZodTypeAny, target: ValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);
      (req as unknown as Record<string, unknown>)[target] = parsed;
      return next();
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodErr = error as ZodError;
        throw new HttpError(422, "Validation failed", serializeIssues(zodErr.issues));
      }
      return next(error);
    }
  };
