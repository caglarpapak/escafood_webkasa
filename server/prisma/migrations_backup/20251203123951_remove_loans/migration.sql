/*
  Warnings:

  - The values [KREDI_TAKSIT_ODEME] on the enum `DailyTransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `loanInstallmentId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `loan_installments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loans` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DailyTransactionType_new" AS ENUM ('NAKIT_TAHSILAT', 'NAKIT_ODEME', 'KASA_BANKA_TRANSFER', 'BANKA_KASA_TRANSFER', 'BANKA_HAVALE_GIRIS', 'BANKA_HAVALE_CIKIS', 'POS_TAHSILAT_BRUT', 'POS_KOMISYONU', 'KREDI_KARTI_HARCAMA', 'KREDI_KARTI_EKSTRE_ODEME', 'CEK_GIRISI', 'CEK_TAHSIL_BANKA', 'CEK_ODENMESI', 'CEK_KARSILIKSIZ', 'DEVIR_BAKIYE', 'DUZELTME');
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "DailyTransactionType_new" USING ("type"::text::"DailyTransactionType_new");
ALTER TYPE "DailyTransactionType" RENAME TO "DailyTransactionType_old";
ALTER TYPE "DailyTransactionType_new" RENAME TO "DailyTransactionType";
DROP TYPE "DailyTransactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "loan_installments" DROP CONSTRAINT "loan_installments_bankId_fkey";

-- DropForeignKey
ALTER TABLE "loan_installments" DROP CONSTRAINT "loan_installments_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "loan_installments" DROP CONSTRAINT "loan_installments_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "loan_installments" DROP CONSTRAINT "loan_installments_loanId_fkey";

-- DropForeignKey
ALTER TABLE "loan_installments" DROP CONSTRAINT "loan_installments_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_bankId_fkey";

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_loanInstallmentId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "loanInstallmentId";

-- DropTable
DROP TABLE "loan_installments";

-- DropTable
DROP TABLE "loans";

-- DropEnum
DROP TYPE "LoanInstallmentStatus";
