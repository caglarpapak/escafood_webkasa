/**
 * DATA REPAIR SCRIPT: Fix Bank Opening Balance Double-Count
 * 
 * This script:
 * 1. Extracts opening balance from "Açılış bakiyesi" transactions
 * 2. Updates Bank.openingBalance field with the extracted value
 * 3. Deletes the opening balance transactions (they are no longer needed)
 * 
 * Run this ONCE after migration to fix existing data.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function repairBankOpeningBalance() {
  console.log('🔧 Starting bank opening balance repair...');

  try {
    // Step 1: Find all opening balance transactions
    const openingTransactions = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        description: 'Açılış bakiyesi',
        bankId: { not: null },
      },
      select: {
        id: true,
        bankId: true,
        bankDelta: true,
      },
    });

    console.log(`📊 Found ${openingTransactions.length} opening balance transactions`);

    // Step 2: Group by bankId and extract opening balance
    const openingBalanceMap = new Map<string, number>();
    for (const tx of openingTransactions) {
      if (tx.bankId && tx.bankDelta) {
        const current = openingBalanceMap.get(tx.bankId) || 0;
        openingBalanceMap.set(tx.bankId, current + Number(tx.bankDelta));
      }
    }

    console.log(`📊 Found ${openingBalanceMap.size} banks with opening balances`);

    // Step 3: Update Bank.openingBalance for each bank
    let updatedCount = 0;
    for (const [bankId, openingBalance] of openingBalanceMap.entries()) {
      const bank = await prisma.bank.findUnique({ where: { id: bankId } });
      if (!bank || bank.deletedAt) {
        console.log(`⚠️  Bank ${bankId} not found or deleted, skipping`);
        continue;
      }

      await prisma.bank.update({
        where: { id: bankId },
        data: {
          openingBalance: openingBalance !== 0 ? openingBalance : null,
        },
      });

      updatedCount++;
      console.log(`✅ Updated bank ${bank.name} (${bankId}): openingBalance = ${openingBalance}`);
    }

    console.log(`✅ Updated ${updatedCount} banks with opening balances`);

    // Step 4: Delete opening balance transactions (they are no longer needed)
    const deleteResult = await prisma.transaction.deleteMany({
      where: {
        description: 'Açılış bakiyesi',
        bankId: { not: null },
      },
    });

    console.log(`🗑️  Deleted ${deleteResult.count} opening balance transactions`);

    console.log('✅ Bank opening balance repair completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   - Banks updated: ${updatedCount}`);
    console.log(`   - Opening transactions deleted: ${deleteResult.count}`);
    console.log('');
    console.log('⚠️  IMPORTANT: After this repair, opening balance is stored in Bank.openingBalance');
    console.log('   Opening balance transactions are no longer created or used.');

  } catch (error) {
    console.error('❌ Error during repair:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the repair
repairBankOpeningBalance()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

