/*
  Warnings:

  - Added the required column `drawerName` to the `Cheque` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payeeName` to the `Cheque` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Add columns with default values for existing rows
ALTER TABLE "Cheque" ADD COLUMN     "drawerName" TEXT,
ADD COLUMN     "imageDataUrl" TEXT,
ADD COLUMN     "payeeName" TEXT;

-- Set default values for existing rows
UPDATE "Cheque" SET "drawerName" = 'Bilinmiyor' WHERE "drawerName" IS NULL;
UPDATE "Cheque" SET "payeeName" = 'Esca Food Gıda Dış Ticaret Sanayi A.Ş.' WHERE "payeeName" IS NULL;

-- Make columns NOT NULL after setting defaults
ALTER TABLE "Cheque" ALTER COLUMN "drawerName" SET NOT NULL;
ALTER TABLE "Cheque" ALTER COLUMN "payeeName" SET NOT NULL;
