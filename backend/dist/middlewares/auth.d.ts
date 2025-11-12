import type { NextFunction, Request, Response } from "express";
export declare const authenticate: (options?: {
    optional?: boolean;
}) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map