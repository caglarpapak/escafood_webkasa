import type { NextFunction, Request, Response } from "express";
export declare class CheckController {
    static registerIn(req: Request, res: Response, next: NextFunction): Promise<void>;
    static registerOut(req: Request, res: Response, next: NextFunction): Promise<void>;
    static issueCompanyCheck(req: Request, res: Response, next: NextFunction): Promise<void>;
    static payCheck(req: Request, res: Response, next: NextFunction): Promise<void>;
    static list(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=check.controller.d.ts.map