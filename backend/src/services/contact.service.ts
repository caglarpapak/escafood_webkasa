import type { Express } from "express";
import { ContactType } from "@prisma/client";
import { readFile, utils } from "xlsx";
import { unlinkSync } from "node:fs";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middlewares/error-handler.js";

const removeDiacritics = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const normalizeValue = (value: unknown) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
};

const typeMap: Record<string, ContactType> = {
  musteri: ContactType.CUSTOMER,
  müsteri: ContactType.CUSTOMER,
  musterı: ContactType.CUSTOMER,
  customer: ContactType.CUSTOMER,
  tedarikci: ContactType.SUPPLIER,
  tedarıkcı: ContactType.SUPPLIER,
  supplier: ContactType.SUPPLIER,
  diger: ContactType.OTHER,
  diğer: ContactType.OTHER,
  other: ContactType.OTHER,
};

const extractField = (row: Record<string, unknown>, candidates: string[]) => {
  const entries = Object.entries(row).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (!key) return acc;
    const normalized = removeDiacritics(key.trim());
    acc[normalized] = value;
    return acc;
  }, {});

  for (const candidate of candidates) {
    const normalizedCandidate = removeDiacritics(candidate);
    if (normalizedCandidate in entries) {
      return entries[normalizedCandidate];
    }
  }
  return undefined;
};

export class ContactService {
  static async importFromFile(file: Express.Multer.File | undefined) {
    if (!file) {
      throw new HttpError(400, "Yüklenecek dosya bulunamadı");
    }

    try {
      const workbook = readFile(file.path);
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new HttpError(400, "Excel dosyasında sayfa bulunamadı");
      }

      const sheet = workbook.Sheets[firstSheetName];
      if (!sheet) {
        throw new HttpError(400, "Excel sayfası bulunamadı");
      }
      const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      if (!rows.length) {
        throw new HttpError(400, "Excel dosyası boş");
      }

      let imported = 0;

      await prisma.$transaction(async (tx) => {
        for (const row of rows) {
          const rawName = extractField(row, ["adı*", "adı", "ad", "name"]);
          const rawType = extractField(row, ["tür*", "tür", "tur", "type"]);

          const name = normalizeValue(rawName);
          if (!name) {
            throw new HttpError(400, "Adı alanı zorunludur");
          }

          const typeKey = normalizeValue(rawType);
          if (!typeKey) {
            throw new HttpError(400, `${name} için tür alanı zorunludur`);
          }

          const type = typeMap[removeDiacritics(typeKey)];
          if (!type) {
            throw new HttpError(400, `${name} için geçersiz tür: ${typeKey}`);
          }

          const taxNo = normalizeValue(extractField(row, ["vergino", "vergi no", "taxno"]));
          const email = normalizeValue(extractField(row, ["eposta", "email"]));
          const phone = normalizeValue(extractField(row, ["telefon", "phone"]));
          const country = normalizeValue(extractField(row, ["ülke", "ulke", "country"]));
          const city = normalizeValue(extractField(row, ["şehir", "sehir", "city"]));
          const address = normalizeValue(extractField(row, ["adres", "address"]));

          await tx.contact.upsert({
            where: {
              name_type: {
                name,
                type,
              },
            },
            update: {
              taxNo,
              email,
              phone,
              notes: address,
            },
            create: {
              name,
              type,
              taxNo,
              email,
              phone,
              notes: address,
              shortName: city,
            },
          });

          imported += 1;
        }
      });

      return { imported };
    } finally {
      try {
        unlinkSync(file.path);
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
