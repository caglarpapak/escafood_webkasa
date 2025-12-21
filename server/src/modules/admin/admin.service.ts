import { prisma } from '../../config/prisma';

export class AdminService {
  async clearAllData() {
    console.log('🗑️  Starting to clear all data...');

    // Delete in order (respecting foreign key constraints)
    // Order matters: delete child records first, then parent records
    // Foreign key dependencies:
    // - Transaction references: Bank, CreditCard, Cheque, Customer, Supplier, Attachment, LoanInstallment
    // - LoanInstallment references: Loan, Transaction (optional)
    // - CreditCardOperation references: CreditCard, Transaction (optional)
    // - Cheque references: Bank, Customer, Supplier, Attachment, Transaction
    // - Loan references: Bank
    // - CreditCard references: Bank
    // - PosTerminal references: Bank
    
    // Use transaction to ensure all-or-nothing deletion
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete AuditLogs (independent, no foreign keys)
      let deletedAuditLogs = { count: 0 };
      try {
        deletedAuditLogs = await (tx as any).auditLog?.deleteMany({}) || { count: 0 };
      } catch (e) {
        console.warn('AuditLog model not found or error deleting:', e);
      }
      
      // 2. Delete records that reference Transaction (but Transaction can exist without them)
      const deletedLoanInstallments = await tx.loanInstallment.deleteMany({});
      const deletedCreditCardOperations = await tx.creditCardOperation.deleteMany({});
      
      // 3. Delete Transaction (references many tables, but we'll delete them after)
      const deletedTransactions = await tx.transaction.deleteMany({});
      
      // 4. Delete Cheque (references Bank, Customer, Supplier, Attachment)
      const deletedCheques = await tx.cheque.deleteMany({});
      
      // 5. Delete Attachment (referenced by Transaction and Cheque)
      const deletedAttachments = await tx.attachment.deleteMany({});
      
      // 6. Delete Loan (references Bank)
      const deletedLoans = await tx.loan.deleteMany({});
      
      // 7. Reset CreditCard debt fields to 0 (before deleting credit cards)
      // This ensures credit card balances are zeroed out
      const resetCreditCards = await tx.creditCard.updateMany({
        data: {
          sonEkstreBorcu: 0,
          manualGuncelBorc: null, // Reset to null so it's calculated from operations
        },
      });
      
      // 8. Delete CreditCard (references Bank)
      const deletedCreditCards = await tx.creditCard.deleteMany({});
      
      // 9. Delete PosTerminal (references Bank)
      let deletedPosTerminals = { count: 0 };
      try {
        deletedPosTerminals = await tx.posTerminal.deleteMany({});
      } catch (e) {
        console.warn('PosTerminal model not found or error deleting:', e);
      }
      
      // 10. Reset Bank openingBalance to 0 (before deleting banks)
      // This ensures bank balances are zeroed out
      const resetBanks = await tx.bank.updateMany({
        data: { openingBalance: 0 },
      });
      
      // 11. Delete Bank (referenced by Loan, CreditCard, PosTerminal, Cheque, Transaction)
      const deletedBanks = await tx.bank.deleteMany({});
      
      // 13. Delete Customer (referenced by Transaction and Cheque)
      const deletedCustomers = await tx.customer.deleteMany({});
      
      // 14. Delete Supplier (referenced by Transaction and Cheque)
      const deletedSuppliers = await tx.supplier.deleteMany({});

      // Note: User records are NOT deleted (they are system users, not data)
      // Note: Kasa bakiyesi (cash balance) is calculated from transactions, so it will be 0 after transactions are deleted
      // Note: Yaklaşan ödemeler (upcoming payments) come from loan installments and credit card operations, which are deleted above

      return {
        auditLogs: deletedAuditLogs.count,
        loanInstallments: deletedLoanInstallments.count,
        creditCardOperations: deletedCreditCardOperations.count,
        transactions: deletedTransactions.count,
        cheques: deletedCheques.count,
        attachments: deletedAttachments.count,
        loans: deletedLoans.count,
        creditCardsReset: resetCreditCards.count,
        creditCardsDeleted: deletedCreditCards.count,
        banksReset: resetBanks.count,
        banksDeleted: deletedBanks.count,
        posTerminals: deletedPosTerminals.count,
        customers: deletedCustomers.count,
        suppliers: deletedSuppliers.count,
      };
    });

    console.log('✅ All data cleared:', result);
    return result;
  }
}

