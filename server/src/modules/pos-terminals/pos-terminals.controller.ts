import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PosTerminalsService } from './pos-terminals.service';
import { bulkSavePosTerminalSchema, createPosTerminalSchema, posTerminalIdParamSchema, deletePosTerminalSchema, updatePosTerminalSchema } from './pos-terminals.validation';
import { getUserId, getUserInfo } from '../../config/auth';
import { logAudit, createDiff } from '../auditLog/auditLog.helper';
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
      // İŞLEM LOGU (AUDIT LOG) - 8.1: Tekil POS ekleme loglanır
      const { userId: createdBy, userEmail } = await getUserInfo(req);
      const terminal = await service.createPosTerminal(payload, createdBy);
      
      await logAudit(
        userEmail,
        'CREATE',
        'POS_TERMINAL',
        `POS terminali oluşturuldu: ${terminal.name}`,
        terminal.id,
        { terminal: { name: terminal.name, bankId: terminal.bankId } }
      );
      
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
      // İŞLEM LOGU (AUDIT LOG) - 8.1: CSV importlar loglanır
      const { userId, userEmail } = await getUserInfo(req);
      const terminals = await service.bulkSavePosTerminals(payload, userId);
      
      await logAudit(
        userEmail,
        'IMPORT',
        'POS_TERMINAL',
        `${terminals.length} POS terminali CSV'den içe aktarıldı`,
        null,
        { count: terminals.length, terminals: terminals.map(t => ({ id: t.id, name: t.name })) }
      );
      
      res.json(terminals);
    } catch (error) {
      handleError(res, error);
    }
  }
}

