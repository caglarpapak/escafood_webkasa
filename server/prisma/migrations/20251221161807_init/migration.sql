-- CreateEnum
CREATE TYPE "DailyTransactionType" AS ENUM ('NAKIT_TAHSILAT', 'NAKIT_ODEME', 'KASA_BANKA_TRANSFER_OUT', 'KASA_BANKA_TRANSFER_IN', 'BANKA_KASA_TRANSFER_OUT', 'BANKA_KASA_TRANSFER_IN', 'BANKA_HAVALE_GIRIS', 'BANKA_HAVALE_CIKIS', 'POS_TAHSILAT_BRUT', 'POS_KOMISYONU', 'KREDI_KARTI_HARCAMA', 'KREDI_KARTI_EKSTRE_ODEME', 'CEK_GIRISI', 'CEK_TAHSIL_BANKA', 'CEK_ODENMESI', 'CEK_KARSILIKSIZ', 'DEVIR_BAKIYE', 'DUZELTME', 'KREDI_TAKSIT_ODEME');

-- CreateEnum
CREATE TYPE "DailyTransactionSource" AS ENUM ('KASA', 'BANKA', 'POS', 'KREDI_KARTI', 'CEK', 'SENET', 'DIGER');

-- CreateEnum
CREATE TYPE "CreditCardOperationType" AS ENUM ('HARCAMA', 'ODEME', 'IADE', 'FAIZ', 'AIDAT');

-- CreateEnum
CREATE TYPE "ChequeStatus" AS ENUM ('KASADA', 'BANKADA_TAHSILDE', 'ODEMEDE', 'TAHSIL_EDILDI', 'ODENDI', 'KARSILIKSIZ');

-- CreateEnum
CREATE TYPE "ChequeDirection" AS ENUM ('ALACAK', 'BORC');

-- CreateEnum
CREATE TYPE "LoanInstallmentStatus" AS ENUM ('BEKLENIYOR', 'ODEME_ALINDI', 'GECIKMIS');

-- CreateTable
CREATE TABLE "PosTerminal" (
    "id" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "PosTerminal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountNo" TEXT,
    "iban" TEXT,
    "openingBalance" DECIMAL(18,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditCard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bankId" TEXT,
    "limit" DECIMAL(18,2),
    "closingDay" INTEGER,
    "dueDay" INTEGER,
    "installmentPrincipal" DECIMAL(18,2),
    "installmentInterestRate" DECIMAL(18,4),
    "installmentBsmvRate" DECIMAL(18,4),
    "installmentCount" INTEGER,
    "firstInstallmentDate" TEXT,
    "sonEkstreBorcu" DECIMAL(18,2) DEFAULT 0,
    "manualGuncelBorc" DECIMAL(18,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "CreditCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditCardOperation" (
    "id" TEXT NOT NULL,
    "creditCardId" TEXT NOT NULL,
    "isoDate" TEXT NOT NULL,
    "type" "CreditCardOperationType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "description" TEXT,
    "relatedTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "CreditCardOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cheque" (
    "id" TEXT NOT NULL,
    "cekNo" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "entryDate" TEXT NOT NULL,
    "maturityDate" TEXT NOT NULL,
    "status" "ChequeStatus" NOT NULL,
    "direction" "ChequeDirection" NOT NULL,
    "customerId" TEXT,
    "supplierId" TEXT,
    "bankId" TEXT,
    "description" TEXT,
    "attachmentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidBankId" TEXT,
    "paymentTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Cheque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "taxNo" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "taxNo" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "base64Data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "isoDate" TEXT NOT NULL,
    "documentNo" TEXT,
    "type" "DailyTransactionType" NOT NULL,
    "source" "DailyTransactionSource" NOT NULL,
    "counterparty" TEXT,
    "description" TEXT,
    "category" TEXT,
    "incoming" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "outgoing" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "bankDelta" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "displayIncoming" DECIMAL(18,2),
    "displayOutgoing" DECIMAL(18,2),
    "balanceAfter" DECIMAL(18,2) NOT NULL,
    "cashAccountId" TEXT,
    "bankId" TEXT,
    "creditCardId" TEXT,
    "chequeId" TEXT,
    "customerId" TEXT,
    "supplierId" TEXT,
    "attachmentId" TEXT,
    "loanInstallmentId" TEXT,
    "transferGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "createdByEmail" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "installmentCount" INTEGER NOT NULL,
    "firstInstallmentDate" TEXT NOT NULL,
    "annualInterestRate" DECIMAL(18,4) NOT NULL,
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
    "installmentNumber" INTEGER NOT NULL,
    "dueDate" TEXT NOT NULL,
    "principal" DECIMAL(18,2) NOT NULL,
    "interest" DECIMAL(18,2) NOT NULL,
    "bsmv" DECIMAL(18,2) NOT NULL,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "status" "LoanInstallmentStatus" NOT NULL DEFAULT 'BEKLENIYOR',
    "paidDate" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "loan_installments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cheque_paymentTransactionId_key" ON "Cheque"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "transactions_transferGroupId_idx" ON "transactions"("transferGroupId");

-- CreateIndex
CREATE INDEX "audit_logs_actorEmail_idx" ON "audit_logs"("actorEmail");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "loan_installments_transactionId_key" ON "loan_installments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "loan_installments_loanId_installmentNumber_key" ON "loan_installments"("loanId", "installmentNumber");

-- AddForeignKey
ALTER TABLE "PosTerminal" ADD CONSTRAINT "PosTerminal_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosTerminal" ADD CONSTRAINT "PosTerminal_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosTerminal" ADD CONSTRAINT "PosTerminal_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosTerminal" ADD CONSTRAINT "PosTerminal_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCardOperation" ADD CONSTRAINT "CreditCardOperation_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "CreditCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCardOperation" ADD CONSTRAINT "CreditCardOperation_relatedTransactionId_fkey" FOREIGN KEY ("relatedTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCardOperation" ADD CONSTRAINT "CreditCardOperation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCardOperation" ADD CONSTRAINT "CreditCardOperation_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCardOperation" ADD CONSTRAINT "CreditCardOperation_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "CreditCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_chequeId_fkey" FOREIGN KEY ("chequeId") REFERENCES "Cheque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_installments" ADD CONSTRAINT "loan_installments_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
