import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { sendMail } from "../lib/mailer.js";
import { env } from "../config/env.js";
const TIMEZONE = "Europe/Istanbul";
const FORMAT_TR_DATE = "dd/MM/yyyy";
const formatCurrency = (value) => new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(value);
const formatDate = (date) => {
    const zoned = toZonedTime(date, TIMEZONE);
    return format(zoned, FORMAT_TR_DATE);
};
export class NotificationService {
    static async sendBackdatedTransaction(context) {
        const html = `
      <h2>Geçmiş Tarihli Kayıt Bildirimi</h2>
      <p><strong>Belge No:</strong> ${context.txnNo}</p>
      <p><strong>Kayıt Tarihi:</strong> ${formatDate(context.txnDate)}</p>
      <p><strong>Giriş Tarihi:</strong> ${formatDate(context.performedAt)}</p>
      <p><strong>Tutar:</strong> ${formatCurrency(context.amount)}</p>
      <p><strong>Kullanıcı:</strong> ${context.actor.fullName} (${context.actor.email})</p>
      ${context.description
            ? `<p><strong>Açıklama:</strong> ${context.description}</p>`
            : ""}
    `;
        await sendMail({
            to: env.EMAIL_FROM,
            subject: "Esca Food - Geçmiş Tarihli Kayıt",
            html,
        });
    }
    static async sendHardDelete(context) {
        const html = `
      <h2>Hard Delete Bildirimi</h2>
      <p><strong>Belge No:</strong> ${context.txnNo}</p>
      <p><strong>Tarih:</strong> ${formatDate(context.txnDate)}</p>
      <p><strong>Tutar:</strong> ${formatCurrency(context.amount)}</p>
      <p><strong>Silme Zamanı:</strong> ${formatDate(context.performedAt)}</p>
      <p><strong>Kullanıcı:</strong> ${context.actor.fullName} (${context.actor.email})</p>
      ${context.description
            ? `<p><strong>Açıklama:</strong> ${context.description}</p>`
            : ""}
    `;
        await sendMail({
            to: env.EMAIL_FROM,
            subject: "Esca Food - Hard Delete Bilgisi",
            html,
        });
    }
}
//# sourceMappingURL=notification.service.js.map