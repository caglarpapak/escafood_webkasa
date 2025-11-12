import type { NextFunction, Request, Response, Express } from "express";
import { TransactionService } from "../services/transaction.service.js";

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

export class TransactionController {
  static async cashIn(req: Request, res: Response, next: NextFunction) {
    try {
      await TransactionService.cashIn({
        ...req.body,
        actor: buildActor(req),
      });
      res.status(201).json({ message: "Nakit giriş kaydedildi" });
    } catch (error) {
      next(error);
    }
  }

  static async cashOut(req: Request, res: Response, next: NextFunction) {
    try {
      await TransactionService.cashOut({
        ...req.body,
        actor: buildActor(req),
      });
      res.status(201).json({ message: "Nakit çıkış kaydedildi" });
    } catch (error) {
      next(error);
    }
  }

  static async bankIn(req: Request, res: Response, next: NextFunction) {
    try {
      await TransactionService.bankIn({
        ...req.body,
        actor: buildActor(req),
      });
      res.status(201).json({ message: "Banka girişi kaydedildi" });
    } catch (error) {
      next(error);
    }
  }

  static async bankOut(req: Request, res: Response, next: NextFunction) {
    try {
      await TransactionService.bankOut({
        ...req.body,
        actor: buildActor(req),
      });
      res.status(201).json({ message: "Banka çıkışı kaydedildi" });
    } catch (error) {
      next(error);
    }
  }

  static async pos(req: Request, res: Response, next: NextFunction) {
    try {
      await TransactionService.posCollection({
        ...req.body,
        actor: buildActor(req),
      });
      res.status(201).json({ message: "POS tahsilatı işlendi" });
    } catch (error) {
      next(error);
    }
  }

  static async cardExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      await TransactionService.cardExpense({
        ...req.body,
        actor: buildActor(req),
        attachments: mapFilesToAttachments(files),
      });
      res.status(201).json({ message: "Kart harcaması kaydedildi" });
    } catch (error) {
      next(error);
    }
  }

  static async cardPayment(req: Request, res: Response, next: NextFunction) {
    try {
      await TransactionService.cardPayment({
        ...req.body,
        actor: buildActor(req),
      });
      res.status(201).json({ message: "Kart ödemesi kaydedildi" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      await TransactionService.deleteTransaction(id, buildActor(req));
      res.json({ message: "İşlem silindi" });
    } catch (error) {
      next(error);
    }
  }
}
