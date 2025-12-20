import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ChequesService } from './cheques.service';
import {
  chequeIdParamSchema,
  chequeQuerySchema,
  createChequeSchema,
  updateChequeSchema,
  updateChequeStatusSchema,
  payableChequesQuerySchema,
  payChequeSchema,
} from './cheques.validation';
import { ChequeListQuery } from './cheques.types';
import { ChequeStatus } from '@prisma/client';
import { getUserId } from '../../config/auth';

const service = new ChequesService();

function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', details: error.issues });
  }

  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

export class ChequesController {
  async list(req: Request, res: Response) {
    try {
      const rawQuery = chequeQuerySchema.parse(req.query);
      // Type assertion: status can be 'ALL' but service expects ChequeStatus | undefined
      const query: ChequeListQuery = {
        ...rawQuery,
        status: rawQuery.status === 'ALL' ? undefined : rawQuery.status as ChequeStatus | undefined,
      };
      const cheques = await service.listCheques(query);
      res.json(cheques);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const payload = createChequeSchema.parse(req.body);
      const createdBy = getUserId(req);
      const cheque = await service.createCheque(payload, createdBy);
      res.status(201).json(cheque);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const params = chequeIdParamSchema.parse(req.params);
      const payload = updateChequeSchema.parse(req.body);
      const updatedBy = getUserId(req);
      const cheque = await service.updateCheque(params.id, payload, updatedBy);
      res.json(cheque);
    } catch (error) {
      handleError(res, error);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const params = chequeIdParamSchema.parse(req.params);
      const payload = updateChequeStatusSchema.parse(req.body);
      const updatedBy = getUserId(req);
      const result = await service.updateChequeStatus(params.id, payload, updatedBy);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }

  async getPayableCheques(req: Request, res: Response) {
    try {
      const query = payableChequesQuerySchema.parse(req.query);
      const cheques = await service.getPayableCheques(query.bankId);
      res.json(cheques);
    } catch (error) {
      handleError(res, error);
    }
  }

  async payCheque(req: Request, res: Response) {
    try {
      const params = chequeIdParamSchema.parse(req.params);
      const payload = payChequeSchema.parse(req.body);
      const createdBy = getUserId(req);
      const result = await service.payCheque(params.id, payload, createdBy);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }
}
