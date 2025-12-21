import { prisma } from '../../config/prisma';
import { LoanRecord, LoanDto, LoanInstallmentRecord, LoanInstallmentDto, CreateLoanDTO, UpdateLoanDTO } from './loans.types';
import { TransactionsService } from '../transactions/transactions.service';
import { DailyTransactionType, DailyTransactionSource, LoanInstallmentStatus } from '@prisma/client';

const transactionsService = new TransactionsService();

/**
 * Calculate loan installment schedule
 */
function calculateLoanSchedule(
  totalAmount: number,
  installmentCount: number,
  firstInstallmentDate: string,
  annualInterestRate: number,
  bsmvRate: number
): Array<{
  installmentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  bsmv: number;
  totalAmount: number;
  remainingPrincipal: number;
}> {
  const r = annualInterestRate / 12; // Monthly interest rate
  const b = bsmvRate;
  const rEff = r * (1 + b); // Effective monthly rate with BSMV
  const n = installmentCount;
  const P = totalAmount;
  const schedule: Array<{
    installmentNumber: number;
    dueDate: string;
    principal: number;
    interest: number;
    bsmv: number;
    totalAmount: number;
    remainingPrincipal: number;
  }> = [];

  // Calculate monthly payment using annuity formula
  const factor = Math.pow(1 + rEff, n);
  const installment = rEff === 0 ? P / n : (P * (rEff * factor)) / (factor - 1);

  let remaining = P;

  for (let i = 1; i <= n; i += 1) {
    const interest = remaining * r;
    const bsmv = interest * b;
    let principal = installment - interest - bsmv;
    let totalPayment = installment;

    // Last installment adjustment
    if (i === n && Math.abs(remaining - principal) > 0.01) {
      principal = remaining;
      totalPayment = principal + interest + bsmv;
    }

    remaining = remaining - principal;
    if (Math.abs(remaining) < 0.01) {
      remaining = 0;
    }

    // Calculate due date (add i-1 months to firstInstallmentDate)
    const firstDate = new Date(`${firstInstallmentDate}T00:00:00Z`);
    const dueDate = new Date(Date.UTC(
      firstDate.getUTCFullYear(),
      firstDate.getUTCMonth() + (i - 1),
      firstDate.getUTCDate()
    ));
    const dueDateIso = dueDate.toISOString().slice(0, 10);

    // Round values to 2 decimal places and ensure they fit in Decimal(18,2)
    // Decimal(18,2) can hold values up to 9999999999999999.99 (10^16 - 1)
    const MAX_DECIMAL_VALUE = 9999999999999999.99;
    
    const roundTo2Decimals = (value: number): number => {
      const rounded = Math.round(value * 100) / 100;
      if (Math.abs(rounded) > MAX_DECIMAL_VALUE) {
        throw new Error(`Numeric overflow: value ${rounded} exceeds maximum Decimal(18,2) value of ${MAX_DECIMAL_VALUE}`);
      }
      return rounded;
    };

    schedule.push({
      installmentNumber: i,
      dueDate: dueDateIso,
      principal: roundTo2Decimals(principal),
      interest: roundTo2Decimals(interest),
      bsmv: roundTo2Decimals(bsmv),
      totalAmount: roundTo2Decimals(totalPayment),
      remainingPrincipal: roundTo2Decimals(remaining),
    });
  }

  return schedule;
}

export class LoansService {
  /**
   * List all active loans
   */
  async listLoans(): Promise<LoanDto[]> {
    const loans = await prisma.loan.findMany({
      where: { deletedAt: null },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
        installments: {
          where: { deletedAt: null },
          orderBy: { installmentNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });


    return loans.map((loan) => ({
      id: loan.id,
      name: loan.name,
      bankId: loan.bankId,
      totalAmount: Number(loan.totalAmount),
      installmentCount: loan.installmentCount,
      firstInstallmentDate: loan.firstInstallmentDate,
      annualInterestRate: Number(loan.annualInterestRate),
      bsmvRate: Number(loan.bsmvRate),
      isActive: loan.isActive,
      createdAt: loan.createdAt,
      createdBy: loan.createdBy,
      updatedAt: loan.updatedAt,
      updatedBy: loan.updatedBy,
      deletedAt: loan.deletedAt,
      deletedBy: loan.deletedBy,
      bank: loan.bank ? { id: loan.bank.id, name: loan.bank.name } : undefined,
      installments: loan.installments.map((inst) => ({
        id: inst.id,
        loanId: inst.loanId,
        installmentNumber: inst.installmentNumber,
        dueDate: inst.dueDate,
        principal: Number(inst.principal),
        interest: Number(inst.interest),
        bsmv: Number(inst.bsmv),
        totalAmount: Number(inst.totalAmount),
        status: inst.status as 'BEKLENIYOR' | 'ODEME_ALINDI' | 'GECIKMIS',
        paidDate: inst.paidDate,
        transactionId: inst.transactionId,
        createdAt: inst.createdAt,
        createdBy: inst.createdBy,
        updatedAt: inst.updatedAt,
        updatedBy: inst.updatedBy,
        deletedAt: inst.deletedAt,
        deletedBy: inst.deletedBy,
      })),
    }));
  }

  /**
   * Get loan by ID
   */
  async getLoanById(id: string): Promise<LoanDto | null> {
    const loan = await prisma.loan.findUnique({
      where: { id, deletedAt: null },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
        installments: {
          where: { deletedAt: null },
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });

    if (!loan) return null;

    return {
      id: loan.id,
      name: loan.name,
      bankId: loan.bankId,
      totalAmount: Number(loan.totalAmount),
      installmentCount: loan.installmentCount,
      firstInstallmentDate: loan.firstInstallmentDate,
      annualInterestRate: Number(loan.annualInterestRate),
      bsmvRate: Number(loan.bsmvRate),
      isActive: loan.isActive,
      createdAt: loan.createdAt,
      createdBy: loan.createdBy,
      updatedAt: loan.updatedAt,
      updatedBy: loan.updatedBy,
      deletedAt: loan.deletedAt,
      deletedBy: loan.deletedBy,
      bank: loan.bank ? { id: loan.bank.id, name: loan.bank.name } : undefined,
      installments: loan.installments.map((inst) => ({
        id: inst.id,
        loanId: inst.loanId,
        installmentNumber: inst.installmentNumber,
        dueDate: inst.dueDate,
        principal: Number(inst.principal),
        interest: Number(inst.interest),
        bsmv: Number(inst.bsmv),
        totalAmount: Number(inst.totalAmount),
        status: inst.status as 'BEKLENIYOR' | 'ODEME_ALINDI' | 'GECIKMIS',
        paidDate: inst.paidDate,
        transactionId: inst.transactionId,
        createdAt: inst.createdAt,
        createdBy: inst.createdBy,
        updatedAt: inst.updatedAt,
        updatedBy: inst.updatedBy,
        deletedAt: inst.deletedAt,
        deletedBy: inst.deletedBy,
      })),
    };
  }

  /**
   * Create a new loan and generate installments
   */
  async createLoan(data: CreateLoanDTO, createdBy: string): Promise<LoanDto> {
    // Verify bank exists
    const bank = await prisma.bank.findUnique({
      where: { id: data.bankId, deletedAt: null },
    });

    if (!bank) {
      throw new Error(`Bank with ID ${data.bankId} not found`);
    }

    // Calculate installment schedule
    const schedule = calculateLoanSchedule(
      data.totalAmount,
      data.installmentCount,
      data.firstInstallmentDate,
      data.annualInterestRate,
      data.bsmvRate
    );

    // Create loan and installments in a transaction
    const loan = await prisma.$transaction(async (tx) => {
      // Create loan
      const newLoan = await tx.loan.create({
        data: {
          name: data.name,
          bankId: data.bankId,
          totalAmount: data.totalAmount,
          installmentCount: data.installmentCount,
          firstInstallmentDate: data.firstInstallmentDate,
          annualInterestRate: data.annualInterestRate,
          bsmvRate: data.bsmvRate,
          isActive: true,
          createdBy,
        },
      });

      // Create installments
      await tx.loanInstallment.createMany({
        data: schedule.map((inst) => ({
          loanId: newLoan.id,
          installmentNumber: inst.installmentNumber,
          dueDate: inst.dueDate,
          principal: inst.principal,
          interest: inst.interest,
          bsmv: inst.bsmv,
          totalAmount: inst.totalAmount,
          status: 'BEKLENIYOR',
          createdBy,
        })),
      });

      return newLoan;
    });

    // Return loan with installments
    return this.getLoanById(loan.id) as Promise<LoanDto>;
  }

  /**
   * Update a loan
   */
  async updateLoan(id: string, data: UpdateLoanDTO, updatedBy: string): Promise<LoanDto> {
    const existing = await prisma.loan.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new Error('Loan not found');
    }

    const updated = await prisma.loan.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    return this.getLoanById(updated.id) as Promise<LoanDto>;
  }

  /**
   * Soft delete a loan
   */
  async softDeleteLoan(id: string, deletedBy: string): Promise<LoanDto> {
    const existing = await prisma.loan.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new Error('Loan not found');
    }

    const deleted = await prisma.loan.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });

    return this.getLoanById(deleted.id) as Promise<LoanDto>;
  }

  /**
   * Pay a loan installment
   */
  async payInstallment(
    loanId: string,
    installmentId: string,
    isoDate: string,
    description: string | null,
    createdBy: string,
    createdByEmail: string
  ): Promise<{ ok: boolean; paidInstallmentId: string; loan: LoanDto; transaction: any }> {
    const installment = await prisma.loanInstallment.findUnique({
      where: { id: installmentId },
      include: {
        loan: true,
      },
    });

    if (!installment || installment.deletedAt) {
      throw new Error('Installment not found');
    }

    if (installment.loanId !== loanId) {
      throw new Error('Installment does not belong to this loan');
    }

    // ROOT FIX C: Use Prisma enum for comparison
    if (installment.status === LoanInstallmentStatus.ODEME_ALINDI) {
      throw new Error('Installment already paid');
    }

    if (installment.loan.deletedAt) {
      throw new Error('Loan has been deleted');
    }

    // DETERMINISTIC FIX: Fail-fast validation before transaction
    // Verify installment exists and is not already paid
    const inst = await prisma.loanInstallment.findFirst({
      where: { id: installmentId, deletedAt: null },
      select: { id: true, loanId: true, status: true },
    });
    
    if (!inst) {
      throw new Error(`Installment not found: ${installmentId}`);
    }
    if (inst.status === LoanInstallmentStatus.ODEME_ALINDI) {
      throw new Error(`Installment already paid: ${installmentId}`);
    }
    if (inst.loanId !== loanId) {
      throw new Error(`Installment does not belong to loan ${loanId}`);
    }

    // Atomic transaction: create transaction and update installment together
    const paymentDate = isoDate || installment.dueDate;
    const outgoingAmount = installment.totalAmount.toNumber();
    const bankDelta = -outgoingAmount; // Bank balance decreases

    // Calculate balance after (for KASA source, but this is BANKA so balanceAfter = 0 for cash)
    // For bank transactions, we don't calculate cash balance
    const balanceAfter = 0; // Bank transactions don't affect cash balance

    const result = await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          isoDate: paymentDate,
          type: DailyTransactionType.KREDI_TAKSIT_ODEME,
          source: DailyTransactionSource.BANKA,
          counterparty: `Kredi Taksit Ödemesi - ${installment.loan.name}`,
          description: description || `Kredi taksit ödemesi - Taksit #${installment.installmentNumber}`,
          incoming: 0,
          outgoing: outgoingAmount,
          bankDelta: bankDelta,
          displayIncoming: null,
          displayOutgoing: outgoingAmount,
          balanceAfter: balanceAfter,
          bankId: installment.loan.bankId,
          loanInstallmentId: installmentId,
          documentNo: null,
          cashAccountId: null,
          creditCardId: null,
          chequeId: null,
          customerId: null,
          supplierId: null,
          attachmentId: null,
          createdBy,
          createdByEmail: createdByEmail || '',
        },
      });

      // DETERMINISTIC FIX: Update installment with paidAt as Date
      const updatedInstallment = await tx.loanInstallment.update({
        where: { id: installmentId },
        data: {
          status: LoanInstallmentStatus.ODEME_ALINDI,
          paidDate: paymentDate,
          transactionId: transaction.id,
          updatedBy: createdBy,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          loanId: true,
          status: true,
          paidDate: true,
        },
      });

      return { transaction, updatedInstallment };
    });

    const { transaction, updatedInstallment } = result;

    // DETERMINISTIC FIX: Verify the correct installment was updated
    if (updatedInstallment.id !== installmentId) {
      throw new Error(`Installment ID mismatch: expected ${installmentId}, got ${updatedInstallment.id}`);
    }
    if (updatedInstallment.status !== LoanInstallmentStatus.ODEME_ALINDI) {
      throw new Error(`Installment status not updated: expected ODEME_ALINDI, got ${updatedInstallment.status}`);
    }

    // Return updated loan
    const loan = await this.getLoanById(loanId);
    if (!loan) {
      throw new Error('Loan not found after payment');
    }

    return { 
      ok: true,
      paidInstallmentId: updatedInstallment.id,
      loan, 
      transaction,
    };
  }

  /**
   * Pay the next (earliest) unpaid installment for a loan
   * Used by Banka Nakit Çıkış when user only selects loan (not specific installment)
   */
  async payNextInstallment(
    loanId: string,
    bankId: string,
    isoDate: string | null,
    amount: number | null,
    description: string | null,
    createdBy: string,
    createdByEmail: string
  ): Promise<{ ok: boolean; paidLoanId: string; paidInstallmentId: string; loan: LoanDto; transaction: any }> {
    // Verify loan exists and is active
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!loan || loan.deletedAt) {
      throw new Error('Loan not found');
    }
    if (!loan.isActive) {
      throw new Error('Loan is not active');
    }

    // Find next unpaid installment deterministically
    const result = await prisma.$transaction(async (tx) => {
      const nextInstallment = await tx.loanInstallment.findFirst({
        where: {
          loanId,
          deletedAt: null,
          status: { not: LoanInstallmentStatus.ODEME_ALINDI },
        },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
      });

      if (!nextInstallment) {
        throw new Error('No unpaid installment found for this loan');
      }

      // Validate amount if provided
      const paymentAmount = amount ?? nextInstallment.totalAmount.toNumber();
      if (amount && Math.abs(amount - nextInstallment.totalAmount.toNumber()) > 0.01) {
        throw new Error(`Amount mismatch: installment amount is ${nextInstallment.totalAmount.toNumber()}, provided amount is ${amount}`);
      }

      const paymentDate = isoDate || nextInstallment.dueDate;
      const bankDelta = -paymentAmount;

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          isoDate: paymentDate,
          type: DailyTransactionType.KREDI_TAKSIT_ODEME,
          source: DailyTransactionSource.BANKA,
          counterparty: `Kredi Taksit Ödemesi - ${loan.name}`,
          description: description || `Kredi taksit ödemesi - Taksit #${nextInstallment.installmentNumber}`,
          incoming: 0,
          outgoing: paymentAmount,
          bankDelta: bankDelta,
          displayIncoming: null,
          displayOutgoing: paymentAmount,
          balanceAfter: 0,
          bankId: bankId,
          loanInstallmentId: nextInstallment.id,
          documentNo: null,
          cashAccountId: null,
          creditCardId: null,
          chequeId: null,
          customerId: null,
          supplierId: null,
          attachmentId: null,
          createdBy,
          createdByEmail: createdByEmail || '',
        },
      });

      // Update installment status
      const updatedInstallment = await tx.loanInstallment.update({
        where: { id: nextInstallment.id },
        data: {
          status: LoanInstallmentStatus.ODEME_ALINDI,
          paidDate: paymentDate,
          transactionId: transaction.id,
          updatedBy: createdBy,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          loanId: true,
          status: true,
          paidDate: true,
        },
      });

      return { transaction, updatedInstallment };
    });

    const { transaction, updatedInstallment } = result;

    // Verify update was successful
    if (updatedInstallment.status !== LoanInstallmentStatus.ODEME_ALINDI) {
      throw new Error(`Installment status not updated: expected ODEME_ALINDI, got ${updatedInstallment.status}`);
    }

    // Return updated loan
    const updatedLoan = await this.getLoanById(loanId);
    if (!updatedLoan) {
      throw new Error('Loan not found after payment');
    }

    return {
      ok: true,
      paidLoanId: loanId,
      paidInstallmentId: updatedInstallment.id,
      loan: updatedLoan,
      transaction,
    };
  }

  /**
   * Get loan installments
   */
  async getLoanInstallments(loanId: string): Promise<LoanInstallmentDto[]> {
    const installments = await prisma.loanInstallment.findMany({
      where: {
        loanId,
        deletedAt: null,
      },
      include: {
        loan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { installmentNumber: 'asc' },
    });

    return installments.map((inst) => ({
      id: inst.id,
      loanId: inst.loanId,
      installmentNumber: inst.installmentNumber,
      dueDate: inst.dueDate,
      principal: Number(inst.principal),
      interest: Number(inst.interest),
      bsmv: Number(inst.bsmv),
      totalAmount: Number(inst.totalAmount),
      status: inst.status as 'BEKLENIYOR' | 'ODEME_ALINDI' | 'GECIKMIS',
      paidDate: inst.paidDate,
      transactionId: inst.transactionId,
      createdAt: inst.createdAt,
      createdBy: inst.createdBy,
      updatedAt: inst.updatedAt,
      updatedBy: inst.updatedBy,
      deletedAt: inst.deletedAt,
      deletedBy: inst.deletedBy,
      loan: inst.loan ? { id: inst.loan.id, name: inst.loan.name } : undefined,
    }));
  }
}

