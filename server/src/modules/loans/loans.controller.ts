import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { LoansService } from './loans.service';
import {
  loanIdParamSchema,
  createLoanSchema,
  deleteLoanSchema,
  updateLoanSchema,
  loanInstallmentIdParamSchema,
  payInstallmentSchema,
  payNextInstallmentSchema,
} from './loans.validation';
import { getUserId } from '../../config/auth';

const service = new LoansService();

function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', details: error.issues });
  }

  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

export class LoansController {
  async list(_req: Request, res: Response) {
    try {
      const loans = await service.listLoans();
      res.json(loans);
    } catch (error) {
      handleError(res, error);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const params = loanIdParamSchema.parse(req.params);
      const loan = await service.getLoanById(params.id);
      if (!loan) {
        return res.status(404).json({ message: 'Loan not found' });
      }
      res.json(loan);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const payload = createLoanSchema.parse(req.body);
      const createdBy = getUserId(req);
      const loan = await service.createLoan(payload, createdBy);
      res.status(201).json(loan);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const params = loanIdParamSchema.parse(req.params);
      const payload = updateLoanSchema.parse(req.body);
      const updatedBy = getUserId(req);
      const loan = await service.updateLoan(params.id, payload, updatedBy);
      res.json(loan);
    } catch (error) {
      handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const params = loanIdParamSchema.parse(req.params);
      deleteLoanSchema.parse(req.body); // Validate but don't use payload
      const deletedBy = getUserId(req);
      const loan = await service.softDeleteLoan(params.id, deletedBy);
      res.json(loan);
    } catch (error) {
      handleError(res, error);
    }
  }

  async getInstallments(req: Request, res: Response) {
    try {
      const params = loanIdParamSchema.parse(req.params);
      const installments = await service.getLoanInstallments(params.id);
      res.json(installments);
    } catch (error) {
      handleError(res, error);
    }
  }

  async payInstallment(req: Request, res: Response) {
    try {
      const params = loanInstallmentIdParamSchema.parse(req.params);
      const payload = payInstallmentSchema.parse(req.body);
      const createdBy = getUserId(req);
      const result = await service.payInstallment(
        params.loanId,
        params.installmentId,
        payload.isoDate,
        payload.description || null,
        createdBy
      );
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }

  async payNextInstallment(req: Request, res: Response) {
    try {
      const params = loanIdParamSchema.parse(req.params);
      const payload = payNextInstallmentSchema.parse(req.body);
      const createdBy = getUserId(req);
      const result = await service.payNextInstallment(
        params.id,
        payload.bankId,
        payload.isoDate || null,
        payload.amount || null,
        payload.note || null,
        createdBy
      );
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }
}

