import { DashboardService } from "../services/dashboard.service.js";
export class DashboardController {
    static async getOverview(req, res, next) {
        try {
            const { date } = req.query;
            const baseDate = date ? new Date(date) : new Date();
            const data = await DashboardService.getOverview(baseDate);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=dashboard.controller.js.map