import { Loan } from '../models/loan';
import { addMonths } from './date';

export interface LoanInstallment {
  index: number;
  dateIso: string;
  principal: number;
  interest: number;
  bsmv: number;
  totalPayment: number;
  remainingPrincipal: number;
}

export function buildLoanSchedule(loan: Loan): LoanInstallment[] {
  const r = loan.faizOraniYillik / 12;
  const b = loan.bsmvOrani;
  const rEff = r * (1 + b);
  const n = loan.vadeSayisi;
  const P = loan.toplamKrediTutari;
  const schedule: LoanInstallment[] = [];

  const factor = Math.pow(1 + rEff, n);
  const installment = rEff === 0 ? P / n : (P * (rEff * factor)) / (factor - 1);

  let remaining = P;

  for (let i = 1; i <= n; i += 1) {
    const interest = remaining * r;
    const bsmv = interest * b;
    let principal = installment - interest - bsmv;
    let totalPayment = installment;

    if (i === n && Math.abs(remaining - principal) > 0.01) {
      principal = remaining;
      totalPayment = principal + interest + bsmv;
    }

    remaining = remaining - principal;
    if (Math.abs(remaining) < 0.01) {
      remaining = 0;
    }

    schedule.push({
      index: i,
      dateIso: addMonths(loan.ilkTaksitTarihi, i - 1),
      principal,
      interest,
      bsmv,
      totalPayment,
      remainingPrincipal: remaining,
    });
  }

  return schedule;
}
