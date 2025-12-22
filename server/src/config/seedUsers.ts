import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const saltRounds = 10;

export async function seedUsers(prisma: PrismaClient) {
  try {
    const onurPasswordHash = await bcrypt.hash('248624', saltRounds);
    const hayrullahPasswordHash = await bcrypt.hash('397139', saltRounds);

    // 1) Upsert Onur
    await prisma.user.upsert({
      where: { id: 'user-onur' },
      update: {
        email: 'onur@esca-food.com',
        name: 'Onur Öztürkler',
        passwordHash: onurPasswordHash,
        isActive: true,
      },
      create: {
        id: 'user-onur',
        email: 'onur@esca-food.com',
        name: 'Onur Öztürkler',
        passwordHash: onurPasswordHash,
        isActive: true,
      },
    });

    // 2) Upsert Hayrullah
    await prisma.user.upsert({
      where: { id: 'user-hayrullah' },
      update: {
        email: 'hayrullah@esca-food.com',
        name: 'Hayrullah Öztürkler',
        passwordHash: hayrullahPasswordHash,
        isActive: true,
      },
      create: {
        id: 'user-hayrullah',
        email: 'hayrullah@esca-food.com',
        name: 'Hayrullah Öztürkler',
        passwordHash: hayrullahPasswordHash,
        isActive: true,
      },
    });

    // 3) Find legacy/dev users (do NOT delete yet)
    const legacyUsers = await prisma.user.findMany({
      where: {
        OR: [{ email: 'dev@esca.local' }, { id: 'x-user-id' }],
      },
      select: { id: true, email: true },
    });

    if (legacyUsers.length > 0) {
      const legacyIds = legacyUsers.map((u) => u.id);

      // 4) Re-assign foreign keys to Onur (user-onur) for all models
      // Update createdBy, updatedBy, and deletedBy fields

      // Transactions
      await prisma.transaction.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.transaction.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.transaction.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // Banks
      await prisma.bank.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.bank.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.bank.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // Credit Cards
      await prisma.creditCard.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.creditCard.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.creditCard.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // Credit Card Operations
      await prisma.creditCardOperation.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.creditCardOperation.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.creditCardOperation.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // Cheques
      await prisma.cheque.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.cheque.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.cheque.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // Customers
      await prisma.customer.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.customer.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.customer.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // Suppliers
      await prisma.supplier.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.supplier.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.supplier.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // Attachments (nullable fields)
      await prisma.attachment.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.attachment.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.attachment.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // Loans
      await prisma.loan.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.loan.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.loan.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // Loan Installments
      await prisma.loanInstallment.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.loanInstallment.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.loanInstallment.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // POS Terminals
      await prisma.posTerminal.updateMany({
        where: { createdBy: { in: legacyIds } },
        data: { createdBy: 'user-onur' },
      });
      await prisma.posTerminal.updateMany({
        where: { updatedBy: { in: legacyIds } },
        data: { updatedBy: 'user-onur' },
      });
      await prisma.posTerminal.updateMany({
        where: { deletedBy: { in: legacyIds } },
        data: { deletedBy: 'user-onur' },
      });

      // 5) Disable legacy users (FK-safe) and rename emails with unique suffix
      for (let i = 0; i < legacyUsers.length; i++) {
        const legacyUser = legacyUsers[i];
        const uniqueEmail = `disabled-dev-${legacyUser.id}@esca.local`;
        await prisma.user.update({
          where: { id: legacyUser.id },
          data: { 
            isActive: false, 
            email: uniqueEmail,
          },
        });
      }

      console.log(`✅ Legacy users disabled & reassigned to user-onur: ${legacyUsers.map(u => u.id).join(', ')}`);
    }

    console.log('✅ Seed users completed: Onur & Hayrullah');
  } catch (error) {
    console.error('❌ seedUsers failed:', error);
    throw error;
  }
}
