import { TransactionService } from "../services/transaction.service.js";
export class TransactionController {
    static async cashIn(req, res, next) {
        try {
            await TransactionService.cashIn({
                ...req.body,
                createdById: req.user.sub,
            });
            res.status(201).json({ message: "Nakit giriş kaydedildi" });
        }
        catch (error) {
            next(error);
        }
    }
    static async cashOut(req, res, next) {
        try {
            await TransactionService.cashOut({
                ...req.body,
                createdById: req.user.sub,
            });
            res.status(201).json({ message: "Nakit çıkış kaydedildi" });
        }
        catch (error) {
            next(error);
        }
    }
    static async bankIn(req, res, next) {
        try {
            await TransactionService.bankIn({
                ...req.body,
                createdById: req.user.sub,
            });
            res.status(201).json({ message: "Banka girişi kaydedildi" });
        }
        catch (error) {
            next(error);
        }
    }
    static async bankOut(req, res, next) {
        try {
            await TransactionService.bankOut({
                ...req.body,
                createdById: req.user.sub,
            });
            res.status(201).json({ message: "Banka çıkışı kaydedildi" });
        }
        catch (error) {
            next(error);
        }
    }
    static async pos(req, res, next) {
        try {
            await TransactionService.posCollection({
                ...req.body,
                createdById: req.user.sub,
            });
            res.status(201).json({ message: "POS tahsilatı işlendi" });
        }
        catch (error) {
            next(error);
        }
    }
    static async cardExpense(req, res, next) {
        try {
            await TransactionService.cardExpense({
                ...req.body,
                createdById: req.user.sub,
            });
            res.status(201).json({ message: "Kart harcaması kaydedildi" });
        }
        catch (error) {
            next(error);
        }
    }
    static async cardPayment(req, res, next) {
        try {
            await TransactionService.cardPayment({
                ...req.body,
                createdById: req.user.sub,
            });
            res.status(201).json({ message: "Kart ödemesi kaydedildi" });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            await TransactionService.deleteTransaction(id);
            res.json({ message: "İşlem silindi" });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=transaction.controller.js.map