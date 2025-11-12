import type { NextFunction, Request, Response } from "express";
export declare class HttpError extends Error {
    statusCode: number;
    details?: unknown;
    constructor(statusCode: number, message: string, details?: unknown);
}
export declare const errorHandler: (err: Error | HttpError, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=error-handler.d.ts.map