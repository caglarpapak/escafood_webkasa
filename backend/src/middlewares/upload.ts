import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import multer from "multer";
import { env } from "../config/env.js";
import { HttpError } from "./error-handler.js";

type UploaderOptions = {
  allowedMimeTypes?: string[];
  maxFileSizeMB?: number;
};

const rootUploadDir = join(process.cwd(), env.UPLOAD_DIR);

const defaultMimeTypes = ["image/jpeg", "image/png", "application/pdf"];

const ensureDir = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (targetDir: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, targetDir);
    },
    filename: (_req, file, cb) => {
      const extension = extname(file.originalname);
      cb(null, `${randomUUID()}${extension}`);
    },
  });

const createFileFilter =
  (allowedMimeTypes: string[]): Required<multer.Options>["fileFilter"] =>
  (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new HttpError(400, "Desteklenmeyen dosya formatı"));
    }
    cb(null, true);
  };

const createUploader = (subDir: string, opts: UploaderOptions = {}) => {
  const targetDir = join(rootUploadDir, subDir);
  ensureDir(targetDir);

  const allowedMimeTypes = opts.allowedMimeTypes ?? defaultMimeTypes;
  const maxFileSizeMB = opts.maxFileSizeMB ?? 8;

  return multer({
    storage: createStorage(targetDir),
    fileFilter: createFileFilter(allowedMimeTypes),
    limits: {
      fileSize: maxFileSizeMB * 1024 * 1024,
    },
  });
};

export const uploaders = {
  general: createUploader("general"),
  checks: createUploader("checks"),
  slips: createUploader("slips"),
  imports: createUploader("imports", {
    allowedMimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
    maxFileSizeMB: 5,
  }),
};

// Backwards compatibility for existing imports
export const upload = uploaders.general;
