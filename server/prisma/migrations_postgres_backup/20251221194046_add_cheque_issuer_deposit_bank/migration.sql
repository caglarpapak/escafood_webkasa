/*
  Warnings:

  - You are about to drop the column `bankId` on the `Cheque` table. All the data in the column will be lost.
  - Added the required column `issuerBankName` to the `Cheque` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add new columns (nullable first)
ALTER TABLE "Cheque" ADD COLUMN     "depositBankId" TEXT,
ADD COLUMN     "issuerBankName" TEXT;

-- Step 2: Migrate existing data
-- For existing cheques, try to get issuerBankName from bank relation if exists
-- If bankId exists, use bank.name as issuerBankName (legacy data migration)
-- Otherwise use a default value
UPDATE "Cheque" 
SET "issuerBankName" = COALESCE(
  (SELECT "Bank"."name" FROM "Bank" WHERE "Bank"."id" = "Cheque"."bankId" LIMIT 1),
  'Bilinmeyen Banka'
)
WHERE "issuerBankName" IS NULL;

-- Step 3: Migrate depositBankId from bankId (if bankId was used for deposit)
-- For cheques with status BANKADA_TAHSILDE, bankId was likely the deposit bank
UPDATE "Cheque"
SET "depositBankId" = "bankId"
WHERE "status" = 'BANKADA_TAHSILDE' AND "bankId" IS NOT NULL;

-- Step 4: Make issuerBankName NOT NULL
ALTER TABLE "Cheque" ALTER COLUMN "issuerBankName" SET NOT NULL;

-- Step 5: Drop old bankId foreign key constraint and column
ALTER TABLE "Cheque" DROP CONSTRAINT IF EXISTS "Cheque_bankId_fkey";
ALTER TABLE "Cheque" DROP COLUMN IF EXISTS "bankId";

-- Step 6: Add new foreign key for depositBankId
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_depositBankId_fkey" FOREIGN KEY ("depositBankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
