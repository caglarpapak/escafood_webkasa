-- AlterTable
ALTER TABLE "Cheque" ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "paidBankId" TEXT,
ADD COLUMN "paymentTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cheque_paymentTransactionId_key" ON "Cheque"("paymentTransactionId");

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

