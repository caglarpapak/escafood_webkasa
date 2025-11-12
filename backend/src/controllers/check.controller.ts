import type { NextFunction, Request, Response, Express } from "express";
import { CheckService } from "../services/check.service.js";
import { HttpError } from "../middlewares/error-handler.js";

const buildActor = (req: Request) => ({
  id: req.user!.sub,
  email: req.user!.email,
  fullName: req.user!.fullName,
});

const mapFilesToAttachments = (files: Express.Multer.File[] = []) =>
  files.map((file) => ({
    path: file.path,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
  }));

export class CheckController {
  static async registerIn(req: Request, res: Response, next: NextFunction) {
    try {
      await CheckService.registerIn({
        ...req.body,
        amount: Number(req.body.amount),
        actor: buildActor(req),
        attachments: mapFilesToAttachments(req.files as Express.Multer.File[]),
      });
      res.status(201).json({ message: "Çek kasaya alındı" });
    } catch (error) {
      next(error);
    }
  }

  static async registerOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { mode } = req.body as { mode?: string };
      if (mode === "yeni_duzenlenen") {
        const { serialNo, bank, amount, dueDate } = req.body;
        if (!serialNo || !bank || !amount || !dueDate) {
          throw new HttpError(
            400,
            "Yeni düzenlenen çek için seri no, banka, tutar ve vade tarihini giriniz",
          );
        }
        await CheckService.issueCompanyCheck({
          ...req.body,
          amount: Number(req.body.amount),
          actor: buildActor(req),
          attachments: mapFilesToAttachments(req.files as Express.Multer.File[]),
        });
        res.status(201).json({ message: "Şirket çeki düzenlendi" });
        return;
      }

      await CheckService.registerOut({
        ...req.body,
        actor: buildActor(req),
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
        actor: buildActor(req),
        attachments: mapFilesToAttachments(req.files as Express.Multer.File[]),
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
        actor: buildActor(req),
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
