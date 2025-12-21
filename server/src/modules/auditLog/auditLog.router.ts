import { Router } from 'express';
import { AuditLogController } from './auditLog.controller';

const router = Router();
const controller = new AuditLogController();

router.get('/', (req, res) => controller.list(req, res));

export default router;

