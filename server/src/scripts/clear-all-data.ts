/**
 * Clear All Data Script
 * 
 * This script deletes ALL data from the database:
 * - Transactions
 * - Banks
 * - Credit Cards
 * - Loans
 * - Cheques
 * - Customers
 * - Suppliers
 * - POS Terminals
 * 
 * WARNING: This is irreversible! Use with caution.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllData() {
  console.log('🗑️  Starting to clear all data...');
  console.log('⚠️  WARNING: This will delete ALL data from the database!');
  console.log('');

  try {
    // Delete in order (respecting foreign key constraints)
    
    console.log('1️⃣  Deleting transactions...');
    const deletedTransactions = await prisma.transaction.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTransactions.count} transactions`);

    console.log('2️⃣  Deleting cheques...');
    const deletedCheques = await prisma.cheque.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCheques.count} cheques`);

    console.log('3️⃣  Deleting loan installments...');
    const deletedInstallments = await prisma.loanInstallment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedInstallments.count} loan installments`);

    console.log('4️⃣  Deleting loans...');
    const deletedLoans = await prisma.loan.deleteMany({});
    console.log(`   ✅ Deleted ${deletedLoans.count} loans`);

    console.log('5️⃣  Deleting credit cards...');
    const deletedCreditCards = await prisma.creditCard.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCreditCards.count} credit cards`);

    console.log('6️⃣  Deleting banks...');
    const deletedBanks = await prisma.bank.deleteMany({});
    console.log(`   ✅ Deleted ${deletedBanks.count} banks`);

    console.log('7️⃣  Deleting customers...');
    const deletedCustomers = await prisma.customer.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCustomers.count} customers`);

    console.log('8️⃣  Deleting suppliers...');
    const deletedSuppliers = await prisma.supplier.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSuppliers.count} suppliers`);

    console.log('9️⃣  Deleting POS terminals...');
    // Check if PosTerminal model exists
    let deletedPosTerminals = { count: 0 };
    try {
      deletedPosTerminals = await (prisma as any).posTerminal?.deleteMany({}) || { count: 0 };
    } catch (e) {
      console.log('   ⚠️  PosTerminal model not found, skipping...');
    }
    console.log(`   ✅ Deleted ${deletedPosTerminals.count} POS terminals`);

    console.log('');
    console.log('✅ All data cleared successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   - Transactions: ${deletedTransactions.count}`);
    console.log(`   - Cheques: ${deletedCheques.count}`);
    console.log(`   - Loan Installments: ${deletedInstallments.count}`);
    console.log(`   - Loans: ${deletedLoans.count}`);
    console.log(`   - Credit Cards: ${deletedCreditCards.count}`);
    console.log(`   - Banks: ${deletedBanks.count}`);
    console.log(`   - Customers: ${deletedCustomers.count}`);
    console.log(`   - Suppliers: ${deletedSuppliers.count}`);
    console.log(`   - POS Terminals: ${deletedPosTerminals.count}`);
    console.log('');
    console.log('⚠️  Note: Users are NOT deleted. Only business data is cleared.');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearAllData()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

