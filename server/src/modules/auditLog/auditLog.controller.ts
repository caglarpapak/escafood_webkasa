import { Request, Response } from 'express';
import { AuditLogService } from './auditLog.service';

const service = new AuditLogService();

export class AuditLogController {
  async list(req: Request, res: Response) {
    try {
      const query = {
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        actorEmail: req.query.actorEmail as string | undefined,
        action: req.query.action as any,
        entityType: req.query.entityType as any,
        entityId: req.query.entityId as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };

      const result = await service.listAuditLogs(query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Failed to list audit logs' });
    }
  }
}

