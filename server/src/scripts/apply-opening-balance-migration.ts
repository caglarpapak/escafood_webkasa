/**
 * Manual migration script to add openingBalance column to Bank table
 * Run this if Prisma migrate fails due to shadow database issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyOpeningBalanceMigration() {
  console.log('🔧 Applying openingBalance migration manually...');

  try {
    // Check if column already exists
    const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Bank' 
      AND column_name = 'openingBalance';
    `;

    if (result.length > 0) {
      console.log('✅ Column openingBalance already exists');
    } else {
      // Add column
      await prisma.$executeRaw`
        ALTER TABLE "Bank" ADD COLUMN "openingBalance" DECIMAL(18, 2);
      `;
      console.log('✅ Added openingBalance column to Bank table');
    }

    console.log('✅ Migration applied successfully!');
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('✅ Column already exists (ignoring error)');
    } else {
      console.error('❌ Error applying migration:', error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyOpeningBalanceMigration()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

