import { CheckMoveAction, CheckStatus, ContactType, Prisma, TransactionCategory, } from "@prisma/client";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middlewares/error-handler.js";
import { TransactionService } from "./transaction.service.js";
const TIMEZONE = "Europe/Istanbul";
const toDecimal = (amount) => new Prisma.Decimal(typeof amount === "number" ? amount.toFixed(2) : amount);
const parseDueDate = (value) => {
    const trimmed = value.trim();
    const parsed = fromZonedTime(`${trimmed}T00:00:00`, TIMEZONE);
    if (Number.isNaN(parsed.getTime())) {
        throw new HttpError(400, "Geçersiz vade tarihi");
    }
    return parsed;
};
const toRelativePath = (absolutePath) => {
    const prefix = `${process.cwd()}/`;
    return absolutePath.startsWith(prefix) ? absolutePath.slice(prefix.length) : absolutePath;
};
const createAttachments = async (tx, checkId, files, uploaderId) => {
    if (!files.length)
        return;
    await tx.attachment.createMany({
        data: files.map((file) => ({
            path: toRelativePath(file.path),
            filename: file.filename,
            mimeType: file.mimeType,
            size: file.size,
            uploaderId,
            checkId,
        })),
    });
};
export class CheckService {
    static async registerIn(payload) {
        if (!payload.attachments?.length) {
            throw new HttpError(400, "Çek görseli zorunludur");
        }
        await prisma.$transaction(async (tx) => {
            const contact = await tx.contact.findUnique({
                where: { id: payload.customerId },
            });
            if (!contact || contact.type !== ContactType.CUSTOMER) {
                throw new HttpError(400, "Geçersiz müşteri seçimi");
            }
            const check = await tx.check.create({
                data: {
                    serialNo: payload.serialNo,
                    bank: payload.bank,
                    amount: toDecimal(payload.amount),
                    dueDate: parseDueDate(payload.dueDate),
                    status: CheckStatus.IN_SAFE,
                    contactId: contact.id,
                    notes: payload.notes ?? null,
                },
            });
            await createAttachments(tx, check.id, payload.attachments, payload.actor.id);
            await tx.checkMove.create({
                data: {
                    checkId: check.id,
                    action: CheckMoveAction.IN,
                    description: payload.notes ?? null,
                    performedById: payload.actor.id,
                },
            });
        });
    }
    static async registerOut(payload) {
        if (!payload.checkId) {
            throw new HttpError(400, "Devir için çek seçmelisiniz");
        }
        if (!payload.supplierId) {
            throw new HttpError(400, "Devir için tedarikçi seçmelisiniz");
        }
        await prisma.$transaction(async (tx) => {
            const [check, supplier] = await Promise.all([
                tx.check.findUnique({ where: { id: payload.checkId } }),
                tx.contact.findUnique({ where: { id: payload.supplierId } }),
            ]);
            if (!check) {
                throw new HttpError(404, "Çek bulunamadı");
            }
            if (check.status !== CheckStatus.IN_SAFE) {
                throw new HttpError(400, "Çek kasada değil");
            }
            if (!supplier || supplier.type !== ContactType.SUPPLIER) {
                throw new HttpError(400, "Geçersiz tedarikçi seçimi");
            }
            await tx.check.update({
                where: { id: check.id },
                data: {
                    status: CheckStatus.ENDORSED,
                    notes: payload.notes ?? check.notes ?? null,
                },
            });
            await tx.checkMove.create({
                data: {
                    checkId: check.id,
                    action: CheckMoveAction.OUT,
                    description: `Tedarikçi: ${supplier.name}`,
                    performedById: payload.actor.id,
                },
            });
        });
    }
    static async issueCompanyCheck(payload) {
        if (!payload.attachments?.length) {
            throw new HttpError(400, "Çek görseli zorunludur");
        }
        await prisma.$transaction(async (tx) => {
            const check = await tx.check.create({
                data: {
                    serialNo: payload.serialNo,
                    bank: payload.bank,
                    amount: toDecimal(payload.amount),
                    dueDate: parseDueDate(payload.dueDate),
                    status: CheckStatus.ISSUED,
                    notes: payload.notes ?? null,
                    issuedBy: payload.issuerName ?? "Esca Food",
                },
            });
            await createAttachments(tx, check.id, payload.attachments, payload.actor.id);
            await tx.checkMove.create({
                data: {
                    checkId: check.id,
                    action: CheckMoveAction.ISSUE,
                    description: payload.notes ?? null,
                    performedById: payload.actor.id,
                },
            });
        });
    }
    static async listAll() {
        return prisma.check.findMany({
            include: {
                contact: { select: { id: true, name: true, type: true } },
                attachments: { select: { id: true, filename: true, path: true } },
                moves: {
                    include: {
                        performedBy: { select: { id: true, fullName: true } },
                    },
                    orderBy: { performedAt: "desc" },
                },
            },
            orderBy: [
                { status: "asc" },
                { dueDate: "asc" },
            ],
        });
    }
    static async payCheck(payload) {
        const check = await prisma.check.findUnique({ where: { id: payload.checkId } });
        if (!check) {
            throw new HttpError(404, "Çek bulunamadı");
        }
        if (check.status === CheckStatus.PAID) {
            throw new HttpError(400, "Çek zaten ödenmiş");
        }
        await TransactionService.registerCheckPayment({
            actor: payload.actor,
            amount: payload.amount,
            bankAccountId: payload.bankAccountId,
            description: payload.notes ?? `Çek ödemesi: ${check.serialNo}`,
            txnDate: payload.txnDate,
            checkId: payload.checkId,
            category: TransactionCategory.DIGER,
            meta: {
                checkSerialNo: check.serialNo,
                checkBank: check.bank,
            },
        });
    }
}
//# sourceMappingURL=check.service.js.map