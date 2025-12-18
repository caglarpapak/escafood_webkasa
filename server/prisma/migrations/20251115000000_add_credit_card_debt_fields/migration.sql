-- Add manual debt tracking fields to credit cards
ALTER TABLE "CreditCard"
  ADD COLUMN "sonEkstreBorcu" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN "manualGuncelBorc" DECIMAL(18,2);
