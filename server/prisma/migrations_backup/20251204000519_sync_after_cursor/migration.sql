-- AlterTable
ALTER TABLE "CreditCard" ADD COLUMN     "firstInstallmentDate" TEXT,
ADD COLUMN     "installmentBsmvRate" DECIMAL(18,4),
ADD COLUMN     "installmentCount" INTEGER,
ADD COLUMN     "installmentInterestRate" DECIMAL(18,4),
ADD COLUMN     "installmentPrincipal" DECIMAL(18,2);
