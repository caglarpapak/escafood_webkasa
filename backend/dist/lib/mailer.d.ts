import nodemailer from "nodemailer";
export declare const mailTransporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo, import("nodemailer/lib/smtp-transport/index.js").Options>;
type MailAttachment = {
    filename: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
};
export declare const sendMail: (options: {
    to: string | string[];
    subject: string;
    html: string;
    attachments?: MailAttachment[];
}) => Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export {};
//# sourceMappingURL=mailer.d.ts.map