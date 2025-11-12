import type { NextFunction, Request, Response } from "express";
import { CheckService } from "../services/check.service.js";

export class CheckController {
  static async registerIn(req: Request, res: Response, next: NextFunction) {
    try {
      await CheckService.registerIn({
        ...req.body,
        amount: Number(req.body.amount),
        createdById: req.user!.sub,
        attachment: req.file,
      });
      res.status(201).json({ message: "Çek kasaya alındı" });
    } catch (error) {
      next(error);
    }
  }

  static async registerOut(req: Request, res: Response, next: NextFunction) {
    try {
      await CheckService.registerOut({
        ...req.body,
        createdById: req.user!.sub,
      });
      res.status(201).json({ message: "Çek çıkışı kaydedildi" });
    } catch (error) {
      next(error);
    }
  }

  static async issueCompanyCheck(req: Request, res: Response, next: NextFunction) {
    try {
      await CheckService.issueCompanyCheck({
        ...req.body,
        amount: Number(req.body.amount),
        createdById: req.user!.sub,
        attachment: req.file,
      });
      res.status(201).json({ message: "Şirket çeki düzenlendi" });
    } catch (error) {
      next(error);
    }
  }

  static async payCheck(req: Request, res: Response, next: NextFunction) {
    try {
      await CheckService.payCheck({
        ...req.body,
        amount: Number(req.body.amount),
        createdById: req.user!.sub,
      });
      res.status(201).json({ message: "Çek ödemesi kaydedildi" });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const checks = await CheckService.listAll();
      res.json(checks);
    } catch (error) {
      next(error);
    }
  }
}
