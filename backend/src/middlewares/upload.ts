import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import multer from "multer";
import { env } from "../config/env.js";
import { HttpError } from "./error-handler.js";

const uploadDir = join(process.cwd(), env.UPLOAD_DIR);

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = extname(file.originalname);
    cb(null, `${randomUUID()}${extension}`);
  },
});

const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new HttpError(400, "Desteklenmeyen dosya formatı"));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
