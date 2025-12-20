/**
 * Manual migration script to create PosTerminal table
 * Run this if Prisma migrate fails due to shadow database issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyPosTerminalMigration() {
  console.log('🔧 Applying PosTerminal migration manually...');

  try {
    // Check if table already exists
    const result = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'PosTerminal';
    `;

    if (result.length > 0) {
      console.log('✅ PosTerminal table already exists');
    } else {
      // Create table
      await prisma.$executeRaw`
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
      `;
      console.log('✅ Created PosTerminal table');
    }

    console.log('✅ Migration applied successfully!');
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('✅ Table already exists (ignoring error)');
    } else {
      console.error('❌ Error applying migration:', error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyPosTerminalMigration()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

