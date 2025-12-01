import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { TransactionsService } from './transactions.service';
import {
  createTransactionSchema,
  deleteTransactionSchema,
  transactionQuerySchema,
  updateTransactionSchema,
} from './transactions.validation';

const service = new TransactionsService();

function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', details: error.errors });
  }

  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

export class TransactionsController {
  async create(req: Request, res: Response) {
    try {
      const payload = createTransactionSchema.parse(req.body);
      const transaction = await service.createTransaction(payload);
      res.status(201).json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  }

  async list(req: Request, res: Response) {
    try {
      const query = transactionQuerySchema.parse(req.query);
      const result = await service.getTransactions(query);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const payload = updateTransactionSchema.parse(req.body);
      const transaction = await service.updateTransaction(req.params.id, payload);
      res.json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const payload = deleteTransactionSchema.parse(req.body);
      const transaction = await service.deleteTransaction(req.params.id, payload);
      res.json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  }
}
