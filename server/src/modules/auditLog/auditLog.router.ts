import { Router } from 'express';
import { AuditLogController } from './auditLog.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();
const controller = new AuditLogController();

// All audit log routes require authentication
router.use(authMiddleware);

router.get('/', (req, res) => controller.list(req, res));

export default router;

