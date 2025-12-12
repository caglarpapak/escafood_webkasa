-- AlterTable
ALTER TABLE "CreditCard" ADD COLUMN     "manualGuncelBorc" DECIMAL(18,2),
ADD COLUMN     "sonEkstreBorcu" DECIMAL(18,2) DEFAULT 0;
