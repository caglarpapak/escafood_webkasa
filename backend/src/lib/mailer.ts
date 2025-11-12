import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export const mailTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth:
    env.SMTP_USER && env.SMTP_PASS
      ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        }
      : undefined,
});

type MailAttachment = {
  filename: string;
  path?: string;
  content?: string | Buffer;
  contentType?: string;
};

export const sendMail = async (options: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: MailAttachment[];
}) => {
  const payload = {
    from: env.EMAIL_FROM,
    ...options,
  };

  return mailTransporter.sendMail(payload);
};
