-- CreateEnum
CREATE TYPE "LoanInstallmentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- AlterEnum
ALTER TYPE "DailyTransactionType" ADD VALUE 'KREDI_TAKSIT_ODEME';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "loanInstallmentId" TEXT;

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "installmentCount" INTEGER NOT NULL,
    "firstInstallmentDate" TEXT NOT NULL,
    "interestRate" DECIMAL(18,4) NOT NULL,
    "bsmvRate" DECIMAL(18,4) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_installments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "installmentIndex" INTEGER NOT NULL,
    "dueDate" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "principal" DECIMAL(18,2) NOT NULL,
    "interest" DECIMAL(18,2) NOT NULL,
    "status" "LoanInstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "paidDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "loan_installments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loanInstallmentId_fkey" FOREIGN KEY ("loanInstallmentId") REFERENCES "loan_installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
