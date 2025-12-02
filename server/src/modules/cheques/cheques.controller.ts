import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ChequesService } from './cheques.service';
import {
  chequeIdParamSchema,
  chequeQuerySchema,
  createChequeSchema,
  updateChequeSchema,
  updateChequeStatusSchema,
} from './cheques.validation';

const service = new ChequesService();

function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', details: error.errors });
  }

  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

export class ChequesController {
  async list(req: Request, res: Response) {
    try {
      const query = chequeQuerySchema.parse(req.query);
      const cheques = await service.getCheques(query);
      res.json(cheques);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const payload = createChequeSchema.parse(req.body);
      const cheque = await service.createCheque(payload);
      res.status(201).json(cheque);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const params = chequeIdParamSchema.parse(req.params);
      const payload = updateChequeSchema.parse(req.body);
      const cheque = await service.updateCheque(params.id, payload);
      res.json(cheque);
    } catch (error) {
      handleError(res, error);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const params = chequeIdParamSchema.parse(req.params);
      const payload = updateChequeStatusSchema.parse(req.body);
      const result = await service.updateChequeStatus(params.id, payload);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }
}
