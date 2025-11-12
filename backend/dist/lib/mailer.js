import nodemailer from "nodemailer";
import { env } from "../config/env.js";
export const mailTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        }
        : undefined,
});
export const sendMail = async (options) => {
    const payload = {
        from: env.EMAIL_FROM,
        ...options,
    };
    return mailTransporter.sendMail(payload);
};
//# sourceMappingURL=mailer.js.map