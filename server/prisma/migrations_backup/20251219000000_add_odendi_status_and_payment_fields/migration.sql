-- AlterEnum: Add ODENDI to ChequeStatus enum
ALTER TYPE "ChequeStatus" ADD VALUE IF NOT EXISTS 'ODENDI';

-- AlterTable: Add payment tracking fields to Cheque
ALTER TABLE "Cheque" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "paidBankId" TEXT,
ADD COLUMN IF NOT EXISTS "paymentTransactionId" TEXT;

