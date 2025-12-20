-- Add openingBalance column to Bank table
ALTER TABLE "Bank" ADD COLUMN IF NOT EXISTS "openingBalance" DECIMAL(18, 2);
