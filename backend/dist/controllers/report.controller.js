import { ReportService } from "../services/report.service.js";
export class ReportController {
    static async daily(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const params = {};
            if (startDate)
                params.startDate = startDate;
            if (endDate)
                params.endDate = endDate;
            const report = await ReportService.dailyLedger(params);
            res.json(report);
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=report.controller.js.map