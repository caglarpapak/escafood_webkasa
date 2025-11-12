import type { NextFunction, Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service.js";

export class DashboardController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query as { date?: string };
      const baseDate = date ? new Date(date) : new Date();
      const data = await DashboardService.getOverview(baseDate);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}
