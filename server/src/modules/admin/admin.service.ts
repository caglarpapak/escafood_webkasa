import { prisma } from '../../config/prisma';

export class AdminService {
  async clearAllData() {
    console.log('🗑️  Starting to clear all data...');

    // Delete in order (respecting foreign key constraints)
    
    const deletedTransactions = await prisma.transaction.deleteMany({});
    const deletedCheques = await prisma.cheque.deleteMany({});
    const deletedInstallments = await prisma.loanInstallment.deleteMany({});
    const deletedLoans = await prisma.loan.deleteMany({});
    const deletedCreditCards = await prisma.creditCard.deleteMany({});
    const deletedBanks = await prisma.bank.deleteMany({});
    const deletedCustomers = await prisma.customer.deleteMany({});
    const deletedSuppliers = await prisma.supplier.deleteMany({});
    // Check if PosTerminal model exists
    let deletedPosTerminals = { count: 0 };
    try {
      deletedPosTerminals = await (prisma as any).posTerminal?.deleteMany({}) || { count: 0 };
    } catch (e) {
      // PosTerminal model might not exist
    }

    return {
      transactions: deletedTransactions.count,
      cheques: deletedCheques.count,
      loanInstallments: deletedInstallments.count,
      loans: deletedLoans.count,
      creditCards: deletedCreditCards.count,
      banks: deletedBanks.count,
      customers: deletedCustomers.count,
      suppliers: deletedSuppliers.count,
      posTerminals: deletedPosTerminals.count,
    };
  }
}

