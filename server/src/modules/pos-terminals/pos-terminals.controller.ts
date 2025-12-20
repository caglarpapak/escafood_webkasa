import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PosTerminalsService } from './pos-terminals.service';
import { bulkSavePosTerminalSchema, createPosTerminalSchema, posTerminalIdParamSchema, deletePosTerminalSchema, updatePosTerminalSchema } from './pos-terminals.validation';
import { getUserId } from '../../config/auth';
import { BadRequestError } from '../../utils/errors';

const service = new PosTerminalsService();

function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', details: error.issues });
  }
  if (error instanceof BadRequestError) {
    return res.status(400).json({ message: error.message });
  }
  if (error instanceof Error) {
    return res.status(400).json({ message: (error as Error).message });
  }
  return res.status(500).json({ message: 'Internal server error' });
}

export class PosTerminalsController {
  async list(_req: Request, res: Response) {
    try {
      const terminals = await service.getAllPosTerminals();
      res.json(terminals);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const payload = createPosTerminalSchema.parse(req.body);
      const createdBy = getUserId(req);
      const terminal = await service.createPosTerminal(payload, createdBy);
      res.status(201).json(terminal);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const params = posTerminalIdParamSchema.parse(req.params);
      const payload = updatePosTerminalSchema.parse(req.body);
      const updatedBy = getUserId(req);
      const terminal = await service.updatePosTerminal(params.id, payload, updatedBy);
      res.json(terminal);
    } catch (error) {
      handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const params = posTerminalIdParamSchema.parse(req.params);
      deletePosTerminalSchema.parse(req.body); // Validate but don't use payload
      const deletedBy = getUserId(req);
      const terminal = await service.softDeletePosTerminal(params.id, deletedBy);
      res.json(terminal);
    } catch (error) {
      handleError(res, error);
    }
  }

  async bulkSave(req: Request, res: Response) {
    try {
      const payload = bulkSavePosTerminalSchema.parse(req.body);
      const userId = getUserId(req);
      const terminals = await service.bulkSavePosTerminals(payload, userId);
      res.json(terminals);
    } catch (error) {
      handleError(res, error);
    }
  }
}

