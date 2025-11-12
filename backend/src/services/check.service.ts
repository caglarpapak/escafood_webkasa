import {
  CheckMoveAction,
  CheckStatus,
  ContactType,
  Prisma,
  TransactionCategory,
  TransactionType,
} from "@prisma/client";
import type { Express } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middlewares/error-handler.js";
import { TransactionService } from "./transaction.service.js";

const toDecimal = (amount: number | string) =>
  new Prisma.Decimal(typeof amount === "number" ? amount.toFixed(2) : amount);

const parseDueDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, "Geçersiz vade tarihi");
  }
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

type PrismaClientLike = Prisma.TransactionClient;

const createAttachment = async (tx: PrismaClientLike, file: Express.Multer.File, userId: string) => {
  const attachment = await tx.attachment.create({
    data: {
      path: file.path,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploaderId: userId,
    },
  });

  return attachment;
};

export class CheckService {
  static async registerIn(payload: {
    serialNo: string;
    bank: string;
    amount: number;
    dueDate: string;
    customerId: string;
    notes?: string;
    createdById: string;
    attachment?: Express.Multer.File;
  }) {
    if (!payload.attachment) {
      throw new HttpError(400, "Çek görseli zorunludur");
    }

    await prisma.$transaction(async (tx) => {
      const attachmentFile = payload.attachment;
      const contact = await tx.contact.findUnique({
        where: { id: payload.customerId },
      });

      if (!contact || contact.type !== ContactType.CUSTOMER) {
        throw new HttpError(400, "Geçersiz müşteri seçimi");
      }

      const attachment = await createAttachment(tx, attachmentFile as Express.Multer.File, payload.createdById);

      const check = await tx.check.create({
        data: {
          serialNo: payload.serialNo,
          bank: payload.bank,
          amount: toDecimal(payload.amount),
          dueDate: parseDueDate(payload.dueDate),
          status: CheckStatus.IN_SAFE,
          contactId: contact.id,
          notes: payload.notes ?? null,
          attachmentId: attachment.id,
        },
      });

      await tx.checkMove.create({
        data: {
          checkId: check.id,
          action: CheckMoveAction.IN,
          description: payload.notes ?? null,
          performedById: payload.createdById,
        },
      });
    });
  }

  static async registerOut(payload: {
    checkId: string;
    supplierId: string;
    notes?: string;
    createdById: string;
  }) {
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
          performedById: payload.createdById,
        },
      });
    });
  }

  static async issueCompanyCheck(payload: {
    serialNo: string;
    bank: string;
    amount: number;
    dueDate: string;
    notes?: string;
    createdById: string;
    attachment?: Express.Multer.File;
  }) {
    if (!payload.attachment) {
      throw new HttpError(400, "Çek görseli zorunludur");
    }

    await prisma.$transaction(async (tx) => {
      const attachment = await createAttachment(
        tx,
        payload.attachment as Express.Multer.File,
        payload.createdById,
      );

      const check = await tx.check.create({
        data: {
          serialNo: payload.serialNo,
          bank: payload.bank,
          amount: toDecimal(payload.amount),
          dueDate: parseDueDate(payload.dueDate),
          status: CheckStatus.ISSUED,
          notes: payload.notes ?? null,
          attachmentId: attachment.id,
          issuedBy: "Esca Food",
        },
      });

      await tx.checkMove.create({
        data: {
          checkId: check.id,
          action: CheckMoveAction.ISSUE,
          description: payload.notes ?? null,
          performedById: payload.createdById,
        },
      });
    });
  }

  static async listAll() {
    return prisma.check.findMany({
      include: {
        contact: { select: { id: true, name: true, type: true } },
        attachment: { select: { id: true, filename: true, path: true } },
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

  static async payCheck(payload: {
    checkId: string;
    bankAccountId: string;
    amount: number;
    txnDate: string;
    notes?: string;
    createdById: string;
  }) {
    const check = await prisma.check.findUnique({ where: { id: payload.checkId } });
    if (!check) {
      throw new HttpError(404, "Çek bulunamadı");
    }

    if (check.status === CheckStatus.PAID) {
      throw new HttpError(400, "Çek zaten ödenmiş");
    }

    await TransactionService.registerCheckPayment({
      amount: payload.amount,
      bankAccountId: payload.bankAccountId,
      createdById: payload.createdById,
      description: payload.notes ?? `Çek ödemesi: ${check.serialNo}`,
      txnDate: payload.txnDate,
      checkId: payload.checkId,
      category: TransactionCategory.SUPPLIER,
      meta: {
        checkSerialNo: check.serialNo,
        checkBank: check.bank,
        source: TransactionType.CHECK_PAYMENT,
      },
    });
  }
}
