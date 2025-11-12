import type { NextFunction, Request, Response } from "express";
import { ReportService } from "../services/report.service.js";

export class ReportController {
  static async daily(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const report = await ReportService.dailyLedger(params);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}
