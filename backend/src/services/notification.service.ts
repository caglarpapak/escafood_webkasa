import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { sendMail } from "../lib/mailer.js";
import { env } from "../config/env.js";

const TIMEZONE = "Europe/Istanbul";
const FORMAT_TR_DATE = "dd/MM/yyyy";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (date: Date) => {
  const zoned = toZonedTime(date, TIMEZONE);
  return format(zoned, FORMAT_TR_DATE);
};

interface TransactionEmailPayload {
  txnNo: string;
  amount: number;
  description?: string | null;
  txnDate: Date;
  performedAt: Date;
  actor: {
    id: string;
    fullName: string;
    email: string;
  };
}

export class NotificationService {
  static async sendBackdatedTransaction(context: TransactionEmailPayload) {
    const html = `
      <h2>Geçmiş Tarihli Kayıt Bildirimi</h2>
      <p><strong>Belge No:</strong> ${context.txnNo}</p>
      <p><strong>Kayıt Tarihi:</strong> ${formatDate(context.txnDate)}</p>
      <p><strong>Giriş Tarihi:</strong> ${formatDate(context.performedAt)}</p>
      <p><strong>Tutar:</strong> ${formatCurrency(context.amount)}</p>
      <p><strong>Kullanıcı:</strong> ${context.actor.fullName} (${context.actor.email})</p>
      ${
        context.description
          ? `<p><strong>Açıklama:</strong> ${context.description}</p>`
          : ""
      }
    `;

    await sendMail({
      to: env.EMAIL_FROM,
      subject: "Esca Food - Geçmiş Tarihli Kayıt",
      html,
    });
  }

  static async sendHardDelete(context: TransactionEmailPayload) {
    const html = `
      <h2>Hard Delete Bildirimi</h2>
      <p><strong>Belge No:</strong> ${context.txnNo}</p>
      <p><strong>Tarih:</strong> ${formatDate(context.txnDate)}</p>
      <p><strong>Tutar:</strong> ${formatCurrency(context.amount)}</p>
      <p><strong>Silme Zamanı:</strong> ${formatDate(context.performedAt)}</p>
      <p><strong>Kullanıcı:</strong> ${context.actor.fullName} (${context.actor.email})</p>
      ${
        context.description
          ? `<p><strong>Açıklama:</strong> ${context.description}</p>`
          : ""
      }
    `;

    await sendMail({
      to: env.EMAIL_FROM,
      subject: "Esca Food - Hard Delete Bilgisi",
      html,
    });
  }
}
