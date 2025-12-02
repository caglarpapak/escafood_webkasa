import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { BanksService } from './banks.service';
import { bankIdParamSchema, createBankSchema, deleteBankSchema, updateBankSchema } from './banks.validation';

const service = new BanksService();

function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', details: error.errors });
  }

  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

export class BanksController {
  async list(_req: Request, res: Response) {
    try {
      const banks = await service.getAllBanksWithBalances();
      res.json(banks);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const payload = createBankSchema.parse(req.body);
      const bank = await service.createBank(payload);
      res.status(201).json(bank);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const params = bankIdParamSchema.parse(req.params);
      const payload = updateBankSchema.parse(req.body);
      const bank = await service.updateBank(params.id, payload);
      res.json(bank);
    } catch (error) {
      handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const params = bankIdParamSchema.parse(req.params);
      const payload = deleteBankSchema.parse(req.body);
      const bank = await service.softDeleteBank(params.id, payload);
      res.json(bank);
    } catch (error) {
      handleError(res, error);
    }
  }
}
