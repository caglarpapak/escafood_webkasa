import { randomBytes } from "node:crypto";
import { format } from "date-fns";

export const generateTransactionNo = () => {
  const timestamp = format(new Date(), "yyyyMMddHHmmss");
  const random = randomBytes(2).toString("hex").toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

export const generateDocumentNo = (prefix: string) => {
  const timestamp = format(new Date(), "yyyyMMddHHmm");
  const random = randomBytes(2).toString("hex").toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};
