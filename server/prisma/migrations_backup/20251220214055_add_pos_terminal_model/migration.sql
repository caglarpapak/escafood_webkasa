-- Create PosTerminal table
CREATE TABLE IF NOT EXISTS "PosTerminal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "bankId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "commissionRate" DECIMAL(5, 4) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3),
  "updatedBy" TEXT,
  "deletedAt" TIMESTAMP(3),
  "deletedBy" TEXT,
  FOREIGN KEY ("bankId") REFERENCES "Bank"("id"),
  FOREIGN KEY ("createdBy") REFERENCES "User"("id"),
  FOREIGN KEY ("updatedBy") REFERENCES "User"("id"),
  FOREIGN KEY ("deletedBy") REFERENCES "User"("id")
);
