import cron from "node-cron";
import { format } from "date-fns";
import { env } from "../config/env.js";
import { sendMail } from "../lib/mailer.js";
import { ReportService } from "../services/report.service.js";
import { generateDailyReportCSV, generateDailyReportPDF } from "../utils/report-export.js";

const RECIPIENT = "muhasebe@esca-food.com";
const TIMEZONE = "Europe/Istanbul";

const formatHtmlSummary = (report: Awaited<ReturnType<typeof ReportService.dailyLedger>>) => `
  <h2>Esca Food Günlük Kasa Özeti</h2>
  <p>Periyot: ${format(report.period.start, "dd.MM.yyyy")} - ${format(report.period.end, "dd.MM.yyyy")}</p>
  <ul>
    <li>Toplam Giriş: <strong>${report.totals.inflow.toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
    })}</strong></li>
    <li>Toplam Çıkış: <strong>${report.totals.outflow.toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
    })}</strong></li>
    <li>Net: <strong>${report.totals.net.toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
    })}</strong></li>
    <li>Kapanış Bakiyesi: <strong>${report.totals.closingBalance.toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
    })}</strong></li>
  </ul>
`;

const sendReportEmail = async (type: "hourly" | "daily") => {
  const report = await ReportService.dailyLedger({});
  const timestamp = format(new Date(), "yyyyMMdd_HHmm");

  const attachments =
    type === "daily"
      ? [
          {
            filename: `daily_report_${timestamp}.pdf`,
            content: await generateDailyReportPDF(report),
            contentType: "application/pdf",
          },
          {
            filename: `daily_report_${timestamp}.csv`,
            content: Buffer.from(generateDailyReportCSV(report), "utf-8"),
            contentType: "text/csv",
          },
        ]
      : [];

  await sendMail({
    to: RECIPIENT,
    subject:
      type === "daily"
        ? "Esca Food Günlük Kasa Özeti"
        : "Esca Food Saatlik Kasa Özeti",
    html: formatHtmlSummary(report),
    attachments,
  });
};

export const initializeReportSchedulers = () => {
  if (env.NODE_ENV === "test") {
    return;
  }

  // Hourly summary at minute 0
  cron.schedule(
    "0 * * * *",
    async () => {
      try {
        await sendReportEmail("hourly");
      } catch (error) {
        console.error("Saatlik rapor gönderimi başarısız:", error);
      }
    },
    { timezone: TIMEZONE },
  );

  // Daily summary at 23:59
  cron.schedule(
    "59 23 * * *",
    async () => {
      try {
        await sendReportEmail("daily");
      } catch (error) {
        console.error("Gün sonu rapor gönderimi başarısız:", error);
      }
    },
    { timezone: TIMEZONE },
  );
};
