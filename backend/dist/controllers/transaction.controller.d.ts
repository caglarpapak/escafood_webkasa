import type { NextFunction, Request, Response } from "express";
export declare class TransactionController {
    static cashIn(req: Request, res: Response, next: NextFunction): Promise<void>;
    static cashOut(req: Request, res: Response, next: NextFunction): Promise<void>;
    static bankIn(req: Request, res: Response, next: NextFunction): Promise<void>;
    static bankOut(req: Request, res: Response, next: NextFunction): Promise<void>;
    static pos(req: Request, res: Response, next: NextFunction): Promise<void>;
    static cardExpense(req: Request, res: Response, next: NextFunction): Promise<void>;
    static cardPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    static delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=transaction.controller.d.ts.map