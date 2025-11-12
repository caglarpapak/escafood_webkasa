import { ContactService } from "../services/contact.service.js";
export class ContactController {
    static async import(req, res, next) {
        try {
            const result = await ContactService.importFromFile(req.file);
            res.status(201).json({
                message: "Müşteri/Tedarikçi listesi içe aktarıldı",
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=contact.controller.js.map